"""/api/admin/sales — sales analytics (admin-only).

Sales are every ``db.orders`` document with ``status="paid"``. No new tracking is
needed; aggregation happens server-side and category is resolved by joining each
order item's ``product_id`` to ``db.products``.
"""
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query

from database import db
from dependencies import require_admin

router = APIRouter(tags=["admin-analytics"], dependencies=[Depends(require_admin)])


def _parse(s: str):
    if not s:
        return None
    try:
        dt = datetime.fromisoformat(s)
    except (TypeError, ValueError):
        return None
    # Normalize to naive UTC so aware order timestamps and naive date params compare.
    if dt.tzinfo is not None:
        dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


async def _paid_orders() -> list:
    cursor = db.orders.find({"status": "paid"}, {"_id": 0})
    return [o async for o in cursor]


async def _product_map() -> dict:
    docs = await db.products.find({}, {"_id": 0, "id": 1, "category": 1, "name": 1}).to_list(5000)
    return {p["id"]: p for p in docs}


def _sale_dt(order: dict):
    return _parse(order.get("paid_at") or order.get("created_at") or "")


def _in_range(dt, from_str: str, to_str: str) -> bool:
    if dt is None:
        return False
    if from_str:
        f = _parse(from_str)
        if f and dt < f:
            return False
    if to_str:
        t = _parse(to_str)
        if t and dt >= t + timedelta(days=1):  # `to` is inclusive end-of-day
            return False
    return True


def _bucket(dt: datetime, bucket: str) -> str:
    if bucket == "week":
        iso = dt.isocalendar()
        return f"{iso[0]}-W{iso[1]:02d}"
    if bucket == "month":
        return dt.strftime("%Y-%m")
    return dt.strftime("%Y-%m-%d")  # day


@router.get("/admin/sales/summary")
async def summary(from_: str = Query("", alias="from"), to_: str = Query("", alias="to")):
    orders = await _paid_orders()
    pmap = await _product_map()

    in_range = [o for o in orders if _in_range(_sale_dt(o), from_, to_)]
    revenue = sum(o.get("amount") or 0 for o in in_range)
    count = len(in_range)
    aov = round(revenue / count) if count else 0
    units = sum((it.get("quantity") or 0) for o in in_range for it in (o.get("items") or []))

    cat_rev: dict = {}
    prod_rev: dict = {}
    for o in in_range:
        for it in (o.get("items") or []):
            pid = it.get("product_id")
            cat = (pmap.get(pid) or {}).get("category") or "Unknown"
            rev = it.get("line_total") or 0
            cat_rev[cat] = cat_rev.get(cat, 0) + rev
            prod_rev[pid] = prod_rev.get(pid, 0) + rev

    return {
        "orders": count,
        "revenue": revenue,
        "aov": aov,
        "units": units,
        "top_category": max(cat_rev, key=lambda k: cat_rev[k]) if cat_rev else None,
        "top_product": max(prod_rev, key=lambda k: prod_rev[k]) if prod_rev else None,
    }


@router.get("/admin/sales/timeseries")
async def timeseries(
    from_: str = Query("", alias="from"),
    to_: str = Query("", alias="to"),
    bucket: str = Query("day"),
):
    bucket = bucket if bucket in ("day", "week", "month") else "day"
    orders = await _paid_orders()
    series: dict = {}
    for o in orders:
        dt = _sale_dt(o)
        if dt is None or not _in_range(dt, from_, to_):
            continue
        b = _bucket(dt, bucket)
        series[b] = series.get(b, 0) + (o.get("amount") or 0)
    return [{"bucket": k, "revenue": v} for k, v in sorted(series.items())]


@router.get("/admin/sales/timeseries/categories")
async def timeseries_categories(
    from_: str = Query("", alias="from"),
    to_: str = Query("", alias="to"),
    bucket: str = Query("day"),
):
    bucket = bucket if bucket in ("day", "week", "month") else "day"
    orders = await _paid_orders()
    pmap = await _product_map()
    data: dict = {}
    for o in orders:
        dt = _sale_dt(o)
        if dt is None or not _in_range(dt, from_, to_):
            continue
        b = _bucket(dt, bucket)
        for it in (o.get("items") or []):
            cat = (pmap.get(it.get("product_id")) or {}).get("category") or "Unknown"
            key = (b, cat)
            data[key] = data.get(key, 0) + (it.get("line_total") or 0)
    return [{"bucket": b, "category": c, "revenue": v} for (b, c), v in sorted(data.items())]


@router.get("/admin/sales/by_category")
async def by_category(from_: str = Query("", alias="from"), to_: str = Query("", alias="to")):
    orders = await _paid_orders()
    pmap = await _product_map()
    cat_rev: dict = {}
    for o in orders:
        if not _in_range(_sale_dt(o), from_, to_):
            continue
        for it in (o.get("items") or []):
            cat = (pmap.get(it.get("product_id")) or {}).get("category") or "Unknown"
            cat_rev[cat] = cat_rev.get(cat, 0) + (it.get("line_total") or 0)
    return [{"category": c, "revenue": v} for c, v in sorted(cat_rev.items(), key=lambda kv: -kv[1])]


@router.get("/admin/sales/by_product")
async def by_product(
    from_: str = Query("", alias="from"),
    to_: str = Query("", alias="to"),
    limit: int = Query(10),
    sort: str = Query("units"),
):
    sort = sort if sort in ("units", "revenue") else "units"
    orders = await _paid_orders()
    pmap = await _product_map()
    prod: dict = {}
    for o in orders:
        if not _in_range(_sale_dt(o), from_, to_):
            continue
        for it in (o.get("items") or []):
            pid = it.get("product_id")
            name = (pmap.get(pid) or {}).get("name") or it.get("name") or pid
            p = prod.setdefault(pid, {"product_id": pid, "name": name, "units": 0, "revenue": 0})
            p["units"] += it.get("quantity") or 0
            p["revenue"] += it.get("line_total") or 0
    ranked = sorted(prod.values(), key=lambda x: -x[sort])
    return ranked[:limit]

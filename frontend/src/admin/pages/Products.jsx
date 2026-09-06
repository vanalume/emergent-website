import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Copy, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/admin/AdminAuth";
import DataTable from "@/admin/primitives/DataTable";
import ConfirmDialog from "@/admin/primitives/ConfirmDialog";
import ProductEditor from "@/admin/pages/ProductEditor";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const effectiveStock = (p) => {
  const variants = p.variants || [];
  if (variants.length) return variants.reduce((s, v) => s + (Number(v.stock) || 0), 0);
  return Number(p.stock) || 0;
};

export default function Products() {
  const { authHeaders } = useAdminAuth();
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState(null); // null | { product? }
  const [deleting, setDeleting] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [subcategoryFilter, setSubcategoryFilter] = useState("");

  const fetch = async () => {
    try {
      const [p, c] = await Promise.all([
        axios.get(`${API}/admin/products`, { headers: authHeaders }),
        axios.get(`${API}/admin/categories`, { headers: authHeaders }),
      ]);
      setRows(p.data);
      setCategories(c.data);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not load products");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetch(); }, []);

  const catTitle = (id) => categories.find((c) => c.id === id)?.title || id;

  const selectedCategory = categories.find((c) => c.id === categoryFilter);
  const subOptions = selectedCategory?.subcategories || [];

  const filteredRows = useMemo(() => {
    return rows.filter((p) => {
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (subcategoryFilter && p.subcategory !== subcategoryFilter) return false;
      return true;
    });
  }, [rows, categoryFilter, subcategoryFilter]);

  const onCategoryChange = (v) => {
    setCategoryFilter(v);
    setSubcategoryFilter("");
  };

  const duplicate = async (p) => {
    const base = `${p.id}-copy`;
    let id = base;
    let n = 2;
    const used = new Set(rows.map((r) => r.id));
    while (used.has(id)) id = `${base}-${n++}`;
    const copy = { ...p, id, name: `${p.name} (copy)`, stock: 0, variants: (p.variants || []).map((v) => ({ ...v, stock: 0 })) };
    try {
      await axios.post(`${API}/admin/products`, copy, { headers: authHeaders });
      toast.success("Product duplicated");
      fetch();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Duplicate failed");
    }
  };

  const doDelete = async () => {
    try {
      await axios.delete(`${API}/admin/products/${deleting.id}`, { headers: authHeaders });
      toast.success("Product deleted");
      setDeleting(null);
      fetch();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Delete failed");
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.24em] uppercase text-[#5c3e2b]">Catalogue</p>
          <h1 className="font-display text-5xl mt-2 leading-none">Products</h1>
          <p className="text-[#5c3e2b]/80 mt-3 text-sm max-w-lg">Everything for sale — edit details, variants, sizes, images and rituals.</p>
        </div>
        <button onClick={() => setEditor({})}
          className="shrink-0 inline-flex items-center gap-2 text-sm bg-[#2b2320] text-[#f8f6f2] rounded-full px-5 py-2.5 hover:bg-[#395439] transition-colors">
          <Plus size={15} /> Add product
        </button>
      </div>

      <div className="mt-10">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            data-testid="product-category-filter"
            className="bg-transparent border border-[#2b2320]/25 rounded-full pl-4 pr-3 py-2 text-sm text-[#2b2320] cursor-pointer hover:border-[#2b2320] focus:outline-none focus:border-[#2b2320] transition-colors duration-300"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#f8f6f2]">{c.title}</option>
            ))}
          </select>

          <select
            value={subcategoryFilter}
            onChange={(e) => setSubcategoryFilter(e.target.value)}
            disabled={!categoryFilter || subOptions.length === 0}
            data-testid="product-subcategory-filter"
            className="bg-transparent border border-[#2b2320]/25 rounded-full pl-4 pr-3 py-2 text-sm text-[#2b2320] cursor-pointer hover:border-[#2b2320] focus:outline-none focus:border-[#2b2320] transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="">All sub-categories</option>
            {subOptions.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#f8f6f2]">{s.title}</option>
            ))}
          </select>

          <span className="text-xs text-[#5c3e2b]/60 ml-auto">{filteredRows.length} of {rows.length} products</span>
        </div>

        <DataTable
          rows={filteredRows}
          rowKey={(r) => r.id}
          emptyMessage={loading ? "Loading…" : "No products yet."}
          columns={[
            { key: "thumb", header: "", render: (r) => r.images?.[0]
              ? <img src={r.images[0]} alt="" className="h-10 w-10 rounded-sm object-cover" />
              : <span className="h-10 w-10 rounded-sm bg-[#e6dfd3] inline-block" /> },
            { key: "name", header: "Product", render: (r) => <span className="font-medium">{r.name}</span> },
            { key: "category", header: "Category", render: (r) => <span className="text-[#2b2320]/70">{catTitle(r.category)}</span> },
            { key: "mrp", header: "MRP", render: (r) => <span className="text-[#2b2320]/50 line-through">₹{r.mrp}</span> },
            { key: "sp", header: "SP", render: (r) => <span className="font-medium">₹{r.sp}</span> },
            { key: "stock", header: "Stock", render: (r) => {
              const s = effectiveStock(r);
              return s === 0
                ? <span className="text-xs font-medium text-[#9a3b2e]">Out of stock</span>
                : <span className="font-medium">{s}</span>;
            } },
            { key: "status", header: "Status", render: (r) => r.draft
              ? <span className="text-xs rounded-full px-2 py-0.5 bg-[#d4a574]/20 text-[#5c3e2b]">Draft</span>
              : <span className="text-xs rounded-full px-2 py-0.5 bg-[#395439]/10 text-[#395439]">Live</span> },
          ]}
          actions={(r) => (
            <div className="inline-flex items-center gap-1">
              <button onClick={() => setEditor({ product: r })} aria-label={`Edit ${r.name}`} className="h-8 w-8 rounded-full hover:bg-[#2b2320]/8 flex items-center justify-center"><Pencil size={14} /></button>
              <button onClick={() => duplicate(r)} aria-label={`Duplicate ${r.name}`} className="h-8 w-8 rounded-full hover:bg-[#2b2320]/8 flex items-center justify-center"><Copy size={14} /></button>
              <button onClick={() => setDeleting(r)} aria-label={`Delete ${r.name}`} className="h-8 w-8 rounded-full hover:bg-[#9a3b2e]/10 flex items-center justify-center text-[#9a3b2e]"><Trash2 size={14} /></button>
            </div>
          )}
        />
      </div>

      <ProductEditor
        open={!!editor}
        product={editor?.product || null}
        categories={categories}
        onClose={() => setEditor(null)}
        onSaved={() => { setEditor(null); fetch(); }}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={doDelete}
        title="Delete this product?"
        description={`"${deleting?.name}" will be removed from the store.`}
      />
    </div>
  );
}

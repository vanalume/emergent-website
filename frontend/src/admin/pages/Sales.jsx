import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { IndianRupee, ShoppingBag, Package, Receipt } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { toast } from "sonner";
import { useAdminAuth } from "@/admin/AdminAuth";
import { formatINR } from "@/context/CartContext";
import RangePicker from "@/admin/primitives/RangePicker";
import StatCard from "@/admin/primitives/StatCard";
import DataTable from "@/admin/primitives/DataTable";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const COLORS = ["#395439", "#5c3e2b", "#d4a574", "#9a3b2e", "#7c9a7c", "#b08d57", "#4a6b7c", "#8a6d3b"];

const tooltipStyle = { fontSize: 12, fontFamily: "Jost, sans-serif" };

export default function Sales() {
  const { authHeaders } = useAdminAuth();
  const [range, setRange] = useState({ preset: "all" });
  const [topN, setTopN] = useState(10);
  const [topSort, setTopSort] = useState("units");
  const [tableView, setTableView] = useState("category");
  const [data, setData] = useState({ summary: null, timeseries: [], timeseriesCategories: [], byCategory: [], byProduct: [] });
  const [loading, setLoading] = useState(true);

  const bucket = range.preset === "all" ? "month" : range.preset === "quarter" ? "week" : "day";

  useEffect(() => {
    const params = { from: range.from || undefined, to: range.to || undefined, bucket };
    setLoading(true);
    Promise.all([
      axios.get(`${API}/admin/sales/summary`, { headers: authHeaders, params }),
      axios.get(`${API}/admin/sales/timeseries`, { headers: authHeaders, params }),
      axios.get(`${API}/admin/sales/timeseries/categories`, { headers: authHeaders, params }),
      axios.get(`${API}/admin/sales/by_category`, { headers: authHeaders, params }),
      axios.get(`${API}/admin/sales/by_product`, { headers: authHeaders, params: { from: range.from || undefined, to: range.to || undefined, limit: topN, sort: topSort } }),
    ])
      .then(([s, ts, tsc, bc, bp]) => {
        setData({
          summary: s.data,
          timeseries: ts.data,
          timeseriesCategories: tsc.data,
          byCategory: bc.data,
          byProduct: bp.data,
        });
      })
      .catch((e) => toast.error(e?.response?.data?.detail || "Could not load sales"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, topN, topSort, bucket]);

  const stacked = useMemo(() => {
    const byBucket = {};
    const cats = new Set();
    for (const r of data.timeseriesCategories) cats.add(r.category);
    for (const r of data.timeseriesCategories) {
      byBucket[r.bucket] = byBucket[r.bucket] || { bucket: r.bucket };
      byBucket[r.bucket][r.category] = r.revenue;
    }
    return { data: Object.values(byBucket).sort((a, b) => a.bucket.localeCompare(b.bucket)), cats: [...cats] };
  }, [data.timeseriesCategories]);

  const catName = (id) => data.byCategory.find((c) => c.category === id)?.category || id;

  const tableRows = tableView === "category" ? data.byCategory : data.byProduct;

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] tracking-[0.24em] uppercase text-[#5c3e2b]">Analytics</p>
          <h1 className="font-display text-5xl mt-2 leading-none">Sales</h1>
          <p className="text-[#5c3e2b]/80 mt-3 text-sm max-w-lg">Revenue, orders and what's selling — by range, category and product.</p>
        </div>
        <RangePicker value={range} onChange={setRange} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <StatCard kicker="Revenue" value={formatINR(data.summary?.revenue ?? 0)} icon={IndianRupee} />
        <StatCard kicker="Orders" value={String(data.summary?.orders ?? 0)} icon={ShoppingBag} accent="#395439" />
        <StatCard kicker="AOV" value={formatINR(data.summary?.aov ?? 0)} icon={Receipt} accent="#5c3e2b" />
        <StatCard kicker="Units" value={String(data.summary?.units ?? 0)} icon={Package} accent="#9a3b2e" />
      </div>

      {/* Line chart */}
      <section className="mt-10 bg-[#faf7f1] rounded-sm border border-[#2b2320]/10 p-6">
        <h2 className="font-display text-2xl">Revenue over time</h2>
        <div className="h-72 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.timeseries} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2b2320" strokeOpacity={0.08} />
              <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "#5c3e2b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#5c3e2b" }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatINR(v)} />
              <Line type="monotone" dataKey="revenue" stroke="#395439" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Stacked bar */}
      <section className="mt-6 bg-[#faf7f1] rounded-sm border border-[#2b2320]/10 p-6">
        <h2 className="font-display text-2xl">Revenue by category over time</h2>
        <div className="h-72 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stacked.data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2b2320" strokeOpacity={0.08} />
              <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "#5c3e2b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#5c3e2b" }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatINR(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {stacked.cats.map((c, i) => (
                <Bar key={c} dataKey={c} stackId="a" fill={COLORS[i % COLORS.length]} name={catName(c)} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Donut + top-N */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <section className="bg-[#faf7f1] rounded-sm border border-[#2b2320]/10 p-6">
          <h2 className="font-display text-2xl">Revenue by category</h2>
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.byCategory} dataKey="revenue" nameKey="category" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {data.byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatINR(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-[#faf7f1] rounded-sm border border-[#2b2320]/10 p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-display text-2xl">Top products</h2>
            <div className="flex items-center gap-2">
              <select value={topN} onChange={(e) => setTopN(Number(e.target.value))}
                className="bg-transparent border border-[#2b2320]/25 rounded-full pl-3 pr-2 py-1.5 text-xs text-[#2b2320] cursor-pointer hover:border-[#2b2320] focus:outline-none">
                {[5, 10, 20, 50].map((n) => <option key={n} value={n} className="bg-[#f8f6f2]">Top {n}</option>)}
              </select>
              <select value={topSort} onChange={(e) => setTopSort(e.target.value)}
                className="bg-transparent border border-[#2b2320]/25 rounded-full pl-3 pr-2 py-1.5 text-xs text-[#2b2320] cursor-pointer hover:border-[#2b2320] focus:outline-none">
                <option value="units" className="bg-[#f8f6f2]">By units</option>
                <option value="revenue" className="bg-[#f8f6f2]">By revenue</option>
              </select>
            </div>
          </div>
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byProduct} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: "#5c3e2b" }} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: "#5c3e2b" }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => topSort === "units" ? v : formatINR(v)} />
                <Bar dataKey={topSort} fill="#395439" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Table */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">Breakdown</h2>
          <div className="flex gap-2">
            {["category", "product"].map((k) => (
              <button key={k} onClick={() => setTableView(k)}
                className={`text-xs px-4 py-2 rounded-full border transition-colors ${tableView === k ? "bg-[#2b2320] text-[#f8f6f2] border-[#2b2320]" : "border-[#2b2320]/25 text-[#2b2320]/70 hover:border-[#2b2320]"}`}>
                {k === "category" ? "By category" : "By product"}
              </button>
            ))}
          </div>
        </div>
        <DataTable
          rows={tableRows}
          rowKey={(r) => tableView === "category" ? r.category : r.product_id}
          searchable={false}
          pageSize={25}
          emptyMessage="No sales in this range."
          columns={tableView === "category"
            ? [
                { key: "category", header: "Category", render: (r) => <span className="font-medium">{r.category}</span> },
                { key: "revenue", header: "Revenue", render: (r) => <span>{formatINR(r.revenue)}</span> },
              ]
            : [
                { key: "name", header: "Product", render: (r) => <span className="font-medium">{r.name}</span> },
                { key: "units", header: "Units", render: (r) => <span>{r.units}</span> },
                { key: "revenue", header: "Revenue", render: (r) => <span>{formatINR(r.revenue)}</span> },
              ]}
        />
      </section>
    </div>
  );
}

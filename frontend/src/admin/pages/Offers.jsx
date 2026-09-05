import { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/admin/AdminAuth";
import DataTable from "@/admin/primitives/DataTable";
import EditorPanel from "@/admin/primitives/EditorPanel";
import FormField from "@/admin/primitives/FormField";
import ConfirmDialog from "@/admin/primitives/ConfirmDialog";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const emptyForm = () => ({
  id: "", name: "", category_ids: [], discount_percent: 0, active: true, starts_at: "", ends_at: "",
});

export default function Offers() {
  const { authHeaders } = useAdminAuth();
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [isEdit, setIsEdit] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetch = async () => {
    try {
      const [o, c] = await Promise.all([
        axios.get(`${API}/admin/offers`, { headers: authHeaders }),
        axios.get(`${API}/admin/categories`, { headers: authHeaders }),
      ]);
      setRows(o.data);
      setCategories(c.data);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not load offers");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetch(); }, []);

  const catTitle = (id) => categories.find((c) => c.id === id)?.title || id;
  const catTitles = (ids) => (ids || []).map(catTitle).join(", ") || "—";

  const toggleCategory = (id) => {
    setForm((p) => {
      const ids = p.category_ids || [];
      return { ...p, category_ids: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id] };
    });
  };

  const openNew = () => { setForm(emptyForm()); setIsEdit(false); setOpen(true); };

  const openEdit = (o) => {
    setForm({
      id: o.id, name: o.name, category_ids: o.category_ids || [], discount_percent: o.discount_percent,
      active: o.active, starts_at: o.starts_at || "", ends_at: o.ends_at || "",
    });
    setIsEdit(true);
    setOpen(true);
  };

  const toggleActive = async (o) => {
    try {
      await axios.put(`${API}/admin/offers/${o.id}`, { ...o, active: !o.active }, { headers: authHeaders });
      fetch();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Toggle failed");
    }
  };

  const save = async () => {
    if (!form.name?.trim()) { toast.error("Name is required"); return; }
    if (!form.category_ids?.length) { toast.error("Select at least one category"); return; }
    const payload = {
      name: form.name,
      category_ids: form.category_ids || [],
      discount_percent: Number(form.discount_percent) || 0,
      active: !!form.active,
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
    };
    try {
      if (isEdit) {
        await axios.put(`${API}/admin/offers/${form.id}`, { ...payload, id: form.id }, { headers: authHeaders });
        toast.success("Offer updated");
      } else {
        await axios.post(`${API}/admin/offers`, payload, { headers: authHeaders });
        toast.success("Offer created");
      }
      setOpen(false);
      fetch();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Save failed");
    }
  };

  const doDelete = async () => {
    try {
      await axios.delete(`${API}/admin/offers/${deleting.id}`, { headers: authHeaders });
      toast.success("Offer deleted");
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
          <p className="text-[10px] tracking-[0.24em] uppercase text-[#5c3e2b]">Merchandising</p>
          <h1 className="font-display text-5xl mt-2 leading-none">Seasonal Offers</h1>
          <p className="text-[#5c3e2b]/80 mt-3 text-sm max-w-lg">Category-wide percentage discounts with an on/off switch.</p>
        </div>
        <button onClick={openNew}
          className="shrink-0 inline-flex items-center gap-2 text-sm bg-[#2b2320] text-[#f8f6f2] rounded-full px-5 py-2.5 hover:bg-[#395439] transition-colors">
          <Plus size={15} /> Add offer
        </button>
      </div>

      <div className="mt-10">
        <DataTable
          rows={rows}
          rowKey={(r) => r.id}
          emptyMessage={loading ? "Loading…" : "No offers yet."}
          columns={[
            { key: "name", header: "Offer", render: (r) => <span className="font-medium">{r.name}</span> },
            { key: "category", header: "Categories", render: (r) => <span className="text-[#2b2320]/70">{catTitles(r.category_ids)}</span> },
            { key: "discount", header: "Discount", render: (r) => <span>{r.discount_percent}%</span> },
            { key: "window", header: "Window", render: (r) => <span className="text-[#2b2320]/60 text-xs">{r.starts_at || "—"} → {r.ends_at || "—"}</span> },
            { key: "active", header: "Active", render: (r) => (
              <button onClick={() => toggleActive(r)} role="switch" aria-checked={!!r.active}
                className={`relative h-6 w-11 rounded-full transition-colors ${r.active ? "bg-[#395439]" : "bg-[#2b2320]/20"}`}>
                <span className={`absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${r.active ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            ) },
          ]}
          actions={(r) => (
            <div className="inline-flex items-center gap-1">
              <button onClick={() => openEdit(r)} aria-label={`Edit ${r.name}`} className="h-8 w-8 rounded-full hover:bg-[#2b2320]/8 flex items-center justify-center"><Pencil size={14} /></button>
              <button onClick={() => setDeleting(r)} aria-label={`Delete ${r.name}`} className="h-8 w-8 rounded-full hover:bg-[#9a3b2e]/10 flex items-center justify-center text-[#9a3b2e]"><Trash2 size={14} /></button>
            </div>
          )}
        />
      </div>

      <EditorPanel
        open={open}
        onClose={() => setOpen(false)}
        kicker="Merchandising"
        title={isEdit ? "Edit offer" : "New offer"}
        footer={
          <>
            <button onClick={() => setOpen(false)} className="text-sm border border-[#2b2320]/25 rounded-full px-5 py-2 hover:border-[#2b2320]">Cancel</button>
            <button onClick={save} className="text-sm bg-[#2b2320] text-[#f8f6f2] rounded-full px-6 py-2 hover:bg-[#395439]">Save</button>
          </>
        }
      >
        <div className="space-y-6">
          <FormField label="Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} required />
          <div>
            <label className="text-xs tracking-[0.14em] uppercase text-[#5c3e2b]">Categories</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {categories.map((c) => (
                <button key={c.id} type="button" onClick={() => toggleCategory(c.id)}
                  className={`text-sm px-4 py-2 rounded-full border transition-colors ${form.category_ids?.includes(c.id) ? "bg-[#2b2320] text-[#f8f6f2] border-[#2b2320]" : "border-[#2b2320]/25 text-[#2b2320]/70 hover:border-[#2b2320]"}`}>
                  {c.title}
                </button>
              ))}
            </div>
          </div>
          <FormField label="Discount %" as="number" value={form.discount_percent} onChange={(v) => setForm((p) => ({ ...p, discount_percent: v }))} min={0} max={90} hint="0–90" />
          <div className="grid grid-cols-2 gap-6">
            <FormField label="Starts at" as="date" value={form.starts_at} onChange={(v) => setForm((p) => ({ ...p, starts_at: v }))} />
            <FormField label="Ends at" as="date" value={form.ends_at} onChange={(v) => setForm((p) => ({ ...p, ends_at: v }))} />
          </div>
          <FormField label="Active" as="toggle" checked={form.active} onChange={(v) => setForm((p) => ({ ...p, active: v }))} />
        </div>
      </EditorPanel>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={doDelete}
        title="Delete this offer?"
        description={`"${deleting?.name}" will stop applying to ${catTitles(deleting?.category_ids)}.`}
      />
    </div>
  );
}

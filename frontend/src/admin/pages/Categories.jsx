import { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, ArrowUp, ArrowDown, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/admin/AdminAuth";
import DataTable from "@/admin/primitives/DataTable";
import EditorPanel from "@/admin/primitives/EditorPanel";
import FormField from "@/admin/primitives/FormField";
import ConfirmDialog from "@/admin/primitives/ConfirmDialog";
import SubCategoryEditor, { slugify } from "@/admin/primitives/SubCategoryEditor";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Categories() {
  const { authHeaders } = useAdminAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(null); // { id, title, tagline, subcategories, isEdit, idTouched }
  const [deleting, setDeleting] = useState(null);

  const fetch = async () => {
    try {
      const { data } = await axios.get(`${API}/admin/categories`, { headers: authHeaders });
      setRows(data);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not load categories");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetch(); }, []);

  const openNew = () => {
    setForm({ id: "", title: "", tagline: "", subcategories: [], isEdit: false, idTouched: false });
    setOpen(true);
  };

  const openEdit = (c) => {
    setForm({ id: c.id, title: c.title, tagline: c.tagline, subcategories: c.subcategories || [], isEdit: true, idTouched: true });
    setOpen(true);
  };

  const deriveId = (title) => {
    const base = slugify(title);
    if (!base) return "";
    let id = base;
    let n = 2;
    const used = new Set(rows.map((r) => r.id));
    while (used.has(id)) id = `${base}-${n++}`;
    return id;
  };

  const onTitle = (title) => setForm((p) => ({ ...p, title, id: p.idTouched ? p.id : deriveId(title) }));

  const save = async () => {
    if (!form?.title?.trim()) { toast.error("Title is required"); return; }
    const payload = {
      title: form.title,
      tagline: form.tagline || "",
      subcategories: form.subcategories || [],
    };
    try {
      if (form.isEdit) {
        await axios.put(`${API}/admin/categories/${form.id}`, payload, { headers: authHeaders });
        toast.success("Category updated");
      } else {
        await axios.post(`${API}/admin/categories`, { ...payload, id: form.id }, { headers: authHeaders });
        toast.success("Category created");
      }
      setOpen(false);
      fetch();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Save failed");
    }
  };

  const doDelete = async () => {
    try {
      await axios.delete(`${API}/admin/categories/${deleting.id}`, { headers: authHeaders });
      toast.success("Category deleted");
      setDeleting(null);
      fetch();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Delete failed");
      setDeleting(null);
    }
  };

  const move = async (id, dir) => {
    const idx = rows.findIndex((r) => r.id === id);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= rows.length) return;
    const next = rows.slice();
    [next[idx], next[j]] = [next[j], next[idx]];
    setRows(next);
    try {
      await axios.put(`${API}/admin/categories/reorder`, { ids: next.map((r) => r.id) }, { headers: authHeaders });
    } catch (e) {
      toast.error("Reorder failed");
      fetch();
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.24em] uppercase text-[#5c3e2b]">Catalogue</p>
          <h1 className="font-display text-5xl mt-2 leading-none">Categories</h1>
          <p className="text-[#5c3e2b]/80 mt-3 text-sm max-w-lg">The sections shown on the Shop page, in order. Move a row to change where it appears.</p>
        </div>
        <button onClick={openNew}
          className="shrink-0 inline-flex items-center gap-2 text-sm bg-[#2b2320] text-[#f8f6f2] rounded-full px-5 py-2.5 hover:bg-[#395439] transition-colors">
          <Plus size={15} /> Add category
        </button>
      </div>

      <div className="mt-10">
        <DataTable
          rows={rows}
          rowKey={(r) => r.id}
          emptyMessage={loading ? "Loading…" : "No categories yet."}
          columns={[
            { key: "title", header: "Category", render: (r) => <span className="font-medium">{r.title}</span> },
            { key: "tagline", header: "Tagline", render: (r) => <span className="text-[#2b2320]/60">{r.tagline}</span> },
            { key: "product_count", header: "Products", render: (r) => <span>{r.product_count}</span> },
            { key: "subcategories", header: "Sub-categories", render: (r) => <span>{r.subcategories?.length || 0}</span> },
          ]}
          actions={(r) => (
            <div className="inline-flex items-center gap-1">
              <button onClick={() => move(r.id, -1)} aria-label={`Move ${r.title} up`} className="h-8 w-8 rounded-full hover:bg-[#2b2320]/8 flex items-center justify-center"><ArrowUp size={14} /></button>
              <button onClick={() => move(r.id, 1)} aria-label={`Move ${r.title} down`} className="h-8 w-8 rounded-full hover:bg-[#2b2320]/8 flex items-center justify-center"><ArrowDown size={14} /></button>
              <button onClick={() => openEdit(r)} aria-label={`Edit ${r.title}`} className="h-8 w-8 rounded-full hover:bg-[#2b2320]/8 flex items-center justify-center"><Pencil size={14} /></button>
              <button onClick={() => setDeleting(r)} aria-label={`Delete ${r.title}`} className="h-8 w-8 rounded-full hover:bg-[#9a3b2e]/10 flex items-center justify-center text-[#9a3b2e]"><Trash2 size={14} /></button>
            </div>
          )}
        />
      </div>

      <EditorPanel
        open={open}
        onClose={() => setOpen(false)}
        kicker="Catalogue"
        title={form?.isEdit ? "Edit category" : "New category"}
        footer={
          <>
            <button onClick={() => setOpen(false)} className="text-sm border border-[#2b2320]/25 rounded-full px-5 py-2 hover:border-[#2b2320]">Cancel</button>
            <button onClick={save} className="text-sm bg-[#2b2320] text-[#f8f6f2] rounded-full px-6 py-2 hover:bg-[#395439]">Save</button>
          </>
        }
      >
        {form && (
          <div className="space-y-6">
            <FormField label="Title" value={form.title} onChange={onTitle} required />
            <FormField
              label="Slug"
              value={form.id}
              disabled={form.isEdit}
              onChange={(v) => setForm((p) => ({ ...p, id: v, idTouched: true }))}
              hint={form.isEdit ? "The slug cannot be changed after creation." : "Auto-derived from the title. Used in the Shop URL."}
            />
            <FormField label="Tagline" value={form.tagline} onChange={(v) => setForm((p) => ({ ...p, tagline: v }))} />
            <SubCategoryEditor value={form.subcategories || []} onChange={(v) => setForm((p) => ({ ...p, subcategories: v }))} />
          </div>
        )}
      </EditorPanel>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={doDelete}
        title="Delete this category?"
        description={`"${deleting?.title}" will be removed. This is blocked if any products still use it.`}
      />
    </div>
  );
}

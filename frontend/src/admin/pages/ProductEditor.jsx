import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAdminAuth } from "@/admin/AdminAuth";
import EditorPanel from "@/admin/primitives/EditorPanel";
import FormField from "@/admin/primitives/FormField";
import StringArrayEditor from "@/admin/primitives/StringArrayEditor";
import ImageDropzone from "@/admin/primitives/ImageDropzone";
import VariantEditor from "@/admin/primitives/VariantEditor";
import { slugify } from "@/admin/primitives/SubCategoryEditor";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TABS = [
  { id: "details", label: "Details" },
  { id: "variants", label: "Variants" },
  { id: "ritual", label: "Ritual" },
];

const emptyForm = () => ({
  id: "", name: "", collection: "", category: "", subcategory: "",
  mrp: 0, sp: 0, desc: "", long_desc: "",
  fragrances: [], images: [], includes: [], draft: true,
  variants: [], ritual: { title: "", steps: [] },
  isEdit: false, idTouched: false,
});

export default function ProductEditor({ open, product, categories, onClose, onSaved }) {
  const { authHeaders, key: adminKey } = useAdminAuth();
  const [form, setForm] = useState(emptyForm());
  const [tab, setTab] = useState("details");

  useEffect(() => {
    if (!open) return;
    setTab("details");
    if (product) {
      setForm({
        ...emptyForm(),
        ...product,
        isEdit: true,
        idTouched: true,
        mrp: product.mrp ?? 0,
        sp: product.sp ?? 0,
        images: product.images || [],
        fragrances: product.fragrances || [],
        includes: product.includes || [],
        variants: product.variants || [],
        ritual: product.ritual || { title: "", steps: [] },
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, product]);

  const set = (patch) => setForm((p) => ({ ...p, ...patch }));

  const categoryObj = categories.find((c) => c.id === form.category);
  const subOptions = (categoryObj?.subcategories || []).map((s) => ({ value: s.id, label: s.title }));

  const onName = (name) => set({ name, id: form.idTouched ? form.id : slugify(name) });
  const onCategory = (category) => set({ category, subcategory: "" });

  const save = async () => {
    if (!form.name?.trim()) { toast.error("Name is required"); return; }
    if (!form.category) { toast.error("Category is required"); return; }
    const payload = {
      id: form.id,
      name: form.name,
      collection: form.collection || "",
      category: form.category,
      subcategory: form.subcategory || null,
      mrp: Number(form.mrp) || 0,
      sp: Number(form.sp) || 0,
      desc: form.desc || "",
      long_desc: form.long_desc || "",
      fragrances: form.fragrances || [],
      images: form.images || [],
      includes: form.includes || [],
      draft: !!form.draft,
      variants: form.variants || [],
      ritual: form.ritual?.title ? form.ritual : null,
    };
    try {
      if (form.isEdit) {
        await axios.put(`${API}/admin/products/${form.id}`, payload, { headers: authHeaders });
        toast.success("Product updated");
      } else {
        await axios.post(`${API}/admin/products`, payload, { headers: authHeaders });
        toast.success("Product created");
      }
      onSaved?.();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Save failed");
    }
  };

  return (
    <EditorPanel
      open={open}
      onClose={onClose}
      kicker="Catalogue"
      title={form.isEdit ? "Edit product" : "New product"}
      width={760}
      footer={
        <>
          <button onClick={onClose} className="text-sm border border-[#2b2320]/25 rounded-full px-5 py-2 hover:border-[#2b2320]">Cancel</button>
          <button onClick={save} className="text-sm bg-[#2b2320] text-[#f8f6f2] rounded-full px-6 py-2 hover:bg-[#395439]">Save</button>
        </>
      }
    >
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm rounded-full border transition-colors ${
              tab === t.id ? "bg-[#2b2320] text-[#f8f6f2] border-[#2b2320]" : "border-[#2b2320]/25 text-[#2b2320]/70 hover:border-[#2b2320]"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "details" && (
        <div className="space-y-6">
          <FormField label="Name" value={form.name} onChange={onName} required />
          <FormField
            label="Slug"
            value={form.id}
            disabled={form.isEdit}
            onChange={(v) => set({ id: v, idTouched: true })}
            hint={form.isEdit ? "The slug cannot be changed after creation." : "Auto-derived from the name."}
          />
          <div className="grid grid-cols-2 gap-6">
            <FormField label="Collection" value={form.collection} onChange={(v) => set({ collection: v })} />
            <FormField label="Category" as="select" value={form.category} onChange={onCategory}
              options={categories.map((c) => ({ value: c.id, label: c.title }))} required />
          </div>
          {subOptions.length > 0 && (
            <FormField label="Sub-category" as="select" value={form.subcategory || ""} onChange={(v) => set({ subcategory: v })}
              options={subOptions} placeholder="None" />
          )}
          <div className="grid grid-cols-2 gap-6">
            <FormField label="MRP (₹)" as="number" value={form.mrp} onChange={(v) => set({ mrp: v })} min={0} />
            <FormField label="SP (₹)" as="number" value={form.sp} onChange={(v) => set({ sp: v })} min={0} />
          </div>
          <FormField label="Card description" as="textarea" value={form.desc} onChange={(v) => set({ desc: v })} rows={2} />
          <FormField label="Long description" as="textarea" value={form.long_desc} onChange={(v) => set({ long_desc: v })} rows={4} />
          <FormField label="Live" as="toggle" checked={!form.draft} onChange={(v) => set({ draft: !v })} hint="If off, the product is a draft and hidden from the store." />
          <StringArrayEditor label="Fragrances" value={form.fragrances} onChange={(v) => set({ fragrances: v })} placeholder="Type a fragrance, press Enter" />
          <StringArrayEditor label="What's inside (includes)" as="list" value={form.includes} onChange={(v) => set({ includes: v })} />
          <ImageDropzone label="Images" value={form.images} onChange={(v) => set({ images: v })} multiple endpoint="/admin/upload" adminKey={adminKey} />
        </div>
      )}

      {tab === "variants" && <VariantEditor value={form.variants} onChange={(v) => set({ variants: v })} adminKey={adminKey} />}

      {tab === "ritual" && (
        <div className="space-y-6">
          <FormField label="Ritual title" value={form.ritual?.title || ""}
            onChange={(v) => set({ ritual: { ...(form.ritual || { steps: [] }), title: v } })} />
          <StringArrayEditor label="Ritual steps" as="list" newItemText="New step" value={form.ritual?.steps || []}
            onChange={(v) => set({ ritual: { ...(form.ritual || { title: "" }), steps: v } })} />
        </div>
      )}
    </EditorPanel>
  );
}

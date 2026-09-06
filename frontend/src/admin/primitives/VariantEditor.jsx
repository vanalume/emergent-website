import { Plus, Trash2 } from "lucide-react";
import ImageDropzone from "@/admin/primitives/ImageDropzone";

const inputCls =
  "w-full bg-transparent border-b border-[#2b2320]/25 focus:border-[#2b2320] outline-none py-2 text-sm placeholder:text-[#2b2320]/25";

/**
 * VariantEditor — add/remove/edit variant rows ({ label, sku, mrp, sp, images }).
 * Each variant carries its own multi-image dropzone.
 */
export default function VariantEditor({ value = [], onChange, adminKey }) {
  const update = (i, patch) => onChange?.(value.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  const remove = (i) => onChange?.(value.filter((_, idx) => idx !== i));
  const add = () => onChange?.([...value, { label: "", sku: "", mrp: null, sp: null, images: [], stock: 0 }]);
  const num = (v) => (v === "" || v == null ? null : Number(v));
  const stockNum = (v) => Math.max(0, Number(v) || 0);

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs tracking-[0.14em] uppercase text-[#5c3e2b]">Variants</label>
        <button type="button" onClick={add} className="inline-flex items-center gap-1 text-xs text-[#395439] hover:text-[#2b2320]">
          <Plus size={13} /> Add variant
        </button>
      </div>

      <div className="mt-3 space-y-4">
        {value.map((v, i) => (
          <div key={i} className="rounded-sm border border-[#2b2320]/12 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input value={v.label ?? ""} onChange={(e) => update(i, { label: e.target.value })} placeholder="Label (e.g. Midnight Blue · Oudh)" className={inputCls} />
                  <input value={v.sku ?? ""} onChange={(e) => update(i, { sku: e.target.value })} placeholder="SKU (optional)" className={inputCls} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input type="number" value={v.mrp ?? ""} onChange={(e) => update(i, { mrp: num(e.target.value) })} placeholder="MRP" className={inputCls} />
                  <input type="number" value={v.sp ?? ""} onChange={(e) => update(i, { sp: num(e.target.value) })} placeholder="SP" className={inputCls} />
                  <input type="number" value={v.stock ?? 0} onChange={(e) => update(i, { stock: stockNum(e.target.value) })} placeholder="Stock" className={inputCls} />
                </div>
              </div>
              <button type="button" onClick={() => remove(i)} aria-label="Remove variant"
                className="h-8 w-8 rounded-full hover:bg-[#9a3b2e]/10 text-[#9a3b2e] flex items-center justify-center shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
            <input value={v.desc ?? ""} onChange={(e) => update(i, { desc: e.target.value })} placeholder="Description (optional)" className={`${inputCls} mt-3`} />
            <ImageDropzone value={v.images || []} onChange={(imgs) => update(i, { images: imgs })} multiple endpoint="/admin/upload" adminKey={adminKey} label="Variant images" />
          </div>
        ))}
        {value.length === 0 && <p className="text-xs text-[#5c3e2b]/60">No variants — leave empty if this product has no selectable variants.</p>}
      </div>
    </div>
  );
}

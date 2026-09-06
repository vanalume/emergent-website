import { Plus, Trash2 } from "lucide-react";
import SingleImagePicker from "@/admin/primitives/SingleImagePicker";

const inputCls =
  "w-full bg-transparent border-b border-[#2b2320]/25 focus:border-[#2b2320] outline-none py-2 text-sm placeholder:text-[#2b2320]/25";

/**
 * ListEditor — add/remove/edit a list of objects.
 *
 * Props:
 *  - value: array of objects
 *  - onChange
 *  - schema: [{ key, label, as: "text" | "textarea" }] — field definitions
 *  - label
 */
export default function ListEditor({ value = [], onChange, schema = [], label = "Items", adminKey }) {
  const update = (i, patch) => onChange?.(value.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));
  const remove = (i) => onChange?.(value.filter((_, idx) => idx !== i));
  const add = () => onChange?.([...value, Object.fromEntries(schema.map((f) => [f.key, ""]))]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs tracking-[0.14em] uppercase text-[#5c3e2b]">{label}</label>
        <button type="button" onClick={add} className="inline-flex items-center gap-1 text-xs text-[#395439] hover:text-[#2b2320]">
          <Plus size={13} /> Add
        </button>
      </div>

      <div className="mt-3 space-y-4">
        {value.map((item, i) => (
          <div key={i} className="rounded-sm border border-[#2b2320]/12 p-4">
            <div className="flex items-start gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                {schema.map((f) => (
                  <div key={f.key} className={f.as === "textarea" || f.as === "image" ? "sm:col-span-2" : ""}>
                    <label className="text-[10px] tracking-[0.1em] uppercase text-[#5c3e2b]/70">{f.label}</label>
                    {f.as === "image" ? (
                      <SingleImagePicker
                        value={item[f.key] ?? ""}
                        onChange={(url) => update(i, { [f.key]: url })}
                        adminKey={adminKey}
                      />
                    ) : f.as === "textarea" ? (
                      <textarea value={item[f.key] ?? ""} onChange={(e) => update(i, { [f.key]: e.target.value })} rows={3} className={`${inputCls} mt-1 resize-none`} />
                    ) : (
                      <input value={item[f.key] ?? ""} onChange={(e) => update(i, { [f.key]: e.target.value })} className={`${inputCls} mt-1`} />
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => remove(i)} aria-label="Remove"
                className="h-8 w-8 rounded-full hover:bg-[#9a3b2e]/10 text-[#9a3b2e] flex items-center justify-center shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {value.length === 0 && <p className="text-xs text-[#5c3e2b]/60">No items yet.</p>}
      </div>
    </div>
  );
}

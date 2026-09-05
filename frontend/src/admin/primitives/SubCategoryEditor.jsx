import { Plus, Trash2 } from "lucide-react";

export const slugify = (s) =>
  (s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const inputCls =
  "w-full bg-transparent border-b border-[#2b2320]/25 focus:border-[#2b2320] outline-none py-2 text-sm placeholder:text-[#2b2320]/25";

/**
 * SubCategoryEditor — add/remove/edit sub-category rows ({ id, title, tagline }).
 * The slug `id` is auto-derived from the title unless the user edits it directly.
 */
export default function SubCategoryEditor({ value = [], onChange, label = "Sub-categories" }) {
  const update = (i, patch) => onChange?.(value.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const remove = (i) => onChange?.(value.filter((_, idx) => idx !== i));
  const add = () => onChange?.([...value, { id: "", title: "", tagline: "" }]);

  const onTitle = (i, title) => {
    const prev = value[i];
    update(i, { title, id: prev.id ? prev.id : slugify(title) });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs tracking-[0.14em] uppercase text-[#5c3e2b]">{label}</label>
        <button type="button" onClick={add}
          className="inline-flex items-center gap-1 text-xs text-[#395439] hover:text-[#2b2320]">
          <Plus size={13} /> Add
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {value.map((s, i) => (
          <div key={i} className="rounded-sm border border-[#2b2320]/12 p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={s.title} onChange={(e) => onTitle(i, e.target.value)} placeholder="Title"
                className={inputCls} />
              <input value={s.id} onChange={(e) => update(i, { id: e.target.value })} placeholder="slug (auto)"
                className={inputCls} />
            </div>
            <div className="flex items-end gap-3 mt-3">
              <input value={s.tagline} onChange={(e) => update(i, { tagline: e.target.value })} placeholder="Tagline"
                className={`${inputCls} flex-1`} />
              <button type="button" onClick={() => remove(i)} aria-label="Remove sub-category"
                className="h-8 w-8 rounded-full hover:bg-[#9a3b2e]/10 flex items-center justify-center text-[#9a3b2e] shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {value.length === 0 && (
          <p className="text-xs text-[#5c3e2b]/60">No sub-categories. This category will render as a single section.</p>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { X, Plus } from "lucide-react";

/**
 * StringArrayEditor — chip-style editor for arrays of short strings.
 * Used for `fragrances`, `ritual.steps`, sub-category ids, etc.
 *
 * Two visual modes:
 *  - default (compact): chips inline; press Enter or click + to add.
 *  - as="list": one item per row with a text/textarea (better for ritual.steps).
 */
export default function StringArrayEditor({
  label,
  value = [],
  onChange,
  placeholder = "Type and press Enter",
  as = "chips",
  rowsPerItem = 2,
  className = "",
}) {
  const [draft, setDraft] = useState("");

  const setAt = (i, v) => {
    const next = value.slice();
    next[i] = v;
    onChange?.(next);
  };
  const removeAt = (i) => onChange?.(value.filter((_, idx) => idx !== i));
  const push = (v) => {
    const trimmed = v.trim();
    if (!trimmed) return;
    onChange?.([...value, trimmed]);
    setDraft("");
  };

  return (
    <div className={className}>
      {label && (
        <label className="text-xs tracking-[0.14em] uppercase text-[#5c3e2b]">{label}</label>
      )}

      {as === "list" ? (
        <div className="mt-2 space-y-2">
          {value.map((item, i) => (
            <div key={i} className="flex gap-2">
              <span className="font-display text-2xl text-[#e6b980] leading-none shrink-0 pt-1">
                {String(i + 1).padStart(2, "0")}
              </span>
              <textarea
                rows={rowsPerItem}
                value={item}
                onChange={(e) => setAt(i, e.target.value)}
                className="flex-1 bg-transparent border-b border-[#2b2320]/20 focus:border-[#2b2320] outline-none py-1.5 text-sm resize-none"
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label="Remove"
                className="text-[#2b2320]/40 hover:text-[#9a3b2e] p-1"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => push("New step")}
            className="mt-1 inline-flex items-center gap-1 text-xs tracking-[0.14em] uppercase text-[#5c3e2b] hover:text-[#2b2320]"
          >
            <Plus size={14} /> Add item
          </button>
        </div>
      ) : (
        <div className="mt-2">
          <div className="flex flex-wrap gap-2">
            {value.map((chip, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 bg-[#f2ebdd] text-[#2b2320] rounded-full pl-3 pr-1 py-1 text-sm">
                {chip}
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label={`Remove ${chip}`}
                  className="h-5 w-5 rounded-full hover:bg-[#2b2320]/10 flex items-center justify-center text-[#5c3e2b]/70"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") { e.preventDefault(); push(draft); }
                if (e.key === "Backspace" && !draft && value.length) removeAt(value.length - 1);
              }}
              placeholder={placeholder}
              className="flex-1 bg-transparent border-b border-[#2b2320]/20 focus:border-[#2b2320] outline-none py-1.5 text-sm placeholder:text-[#2b2320]/25"
            />
            <button
              type="button"
              onClick={() => push(draft)}
              className="text-xs tracking-[0.14em] uppercase text-[#5c3e2b] hover:text-[#2b2320] flex items-center gap-1"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

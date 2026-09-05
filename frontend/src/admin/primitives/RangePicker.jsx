import { useMemo, useState } from "react";
import { Calendar } from "lucide-react";

const PRESETS = [
  { key: "all", label: "All time" },
  { key: "week", label: "Last week" },
  { key: "month", label: "Last month" },
  { key: "quarter", label: "Last quarter" },
  { key: "custom", label: "Custom" },
];

const dayMs = 86_400_000;

function iso(d) { return d?.toISOString().slice(0, 10) ?? ""; }

/**
 * RangePicker — preset + custom date range selector.
 *
 * Value shape: { preset: "all"|"week"|"month"|"quarter"|"custom", from?: "YYYY-MM-DD", to?: "YYYY-MM-DD" }
 * onChange returns the same shape, with `from`/`to` resolved to ISO dates for every preset.
 */
export default function RangePicker({ value = { preset: "all" }, onChange }) {
  const [open, setOpen] = useState(false);

  const resolved = useMemo(() => {
    const now = new Date();
    const to = new Date();
    let from;
    if (value.preset === "week") from = new Date(now.getTime() - 7 * dayMs);
    else if (value.preset === "month") from = new Date(now.getTime() - 30 * dayMs);
    else if (value.preset === "quarter") from = new Date(now.getTime() - 90 * dayMs);
    return { from: from ? iso(from) : "", to: iso(to) };
  }, [value.preset]);

  const pick = (preset) => {
    if (preset === "custom") { setOpen(true); onChange?.({ ...value, preset }); return; }
    if (preset === "all") { onChange?.({ preset: "all" }); return; }
    onChange?.({ preset, ...resolved });
  };

  return (
    <div data-testid="range-picker" className="flex flex-wrap items-center gap-2">
      {PRESETS.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => pick(p.key)}
          className={`text-xs px-4 py-2 rounded-full border transition-colors ${
            value.preset === p.key
              ? "bg-[#2b2320] text-[#f8f6f2] border-[#2b2320]"
              : "border-[#2b2320]/20 text-[#2b2320]/75 hover:border-[#2b2320]"
          }`}
        >
          {p.key === "custom" ? (<span className="inline-flex items-center gap-1.5"><Calendar size={12} /> {p.label}</span>) : p.label}
        </button>
      ))}

      {(value.preset === "custom" || open) && (
        <div className="w-full mt-2 flex flex-wrap gap-3 bg-[#faf7f1] border border-[#2b2320]/10 rounded-sm p-3">
          <label className="text-xs text-[#5c3e2b] flex items-center gap-2">
            From
            <input type="date" value={value.from || ""} max={value.to || undefined}
              onChange={(e) => onChange?.({ ...value, preset: "custom", from: e.target.value })}
              className="bg-transparent border-b border-[#2b2320]/25 focus:border-[#2b2320] outline-none py-1 text-sm text-[#2b2320]" />
          </label>
          <label className="text-xs text-[#5c3e2b] flex items-center gap-2">
            To
            <input type="date" value={value.to || ""} min={value.from || undefined}
              onChange={(e) => onChange?.({ ...value, preset: "custom", to: e.target.value })}
              className="bg-transparent border-b border-[#2b2320]/25 focus:border-[#2b2320] outline-none py-1 text-sm text-[#2b2320]" />
          </label>
        </div>
      )}
    </div>
  );
}

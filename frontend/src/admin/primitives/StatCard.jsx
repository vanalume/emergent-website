import { TrendingUp, TrendingDown } from "lucide-react";

/**
 * StatCard — the KPI card used across the analytics dashboard.
 *
 * Props:
 *  - kicker: small uppercase label (e.g. "Revenue")
 *  - value: primary big number (already formatted)
 *  - sub?: secondary line (e.g. "vs last month")
 *  - delta?: number percent — positive shows green up arrow, negative shows red down arrow
 *  - icon?: lucide icon component
 *  - accent?: hex color for the icon chip (default gold)
 */
export default function StatCard({ kicker, value, sub, delta, icon: Icon, accent = "#d4a574" }) {
  const positive = typeof delta === "number" && delta >= 0;
  return (
    <div data-testid="stat-card" className="bg-[#faf7f1] rounded-sm border border-[#2b2320]/10 p-6 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-[10px] tracking-[0.18em] uppercase text-[#5c3e2b]">{kicker}</p>
        {Icon && (
          <span
            className="h-9 w-9 rounded-full flex items-center justify-center"
            style={{ background: `${accent}25`, color: accent }}
          >
            <Icon size={16} />
          </span>
        )}
      </div>
      <p className="font-display text-4xl leading-none text-[#2b2320]">{value}</p>
      <div className="flex items-center gap-2 text-xs">
        {typeof delta === "number" && (
          <span className={`inline-flex items-center gap-0.5 font-medium ${positive ? "text-[#395439]" : "text-[#9a3b2e]"}`}>
            {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        {sub && <span className="text-[#5c3e2b]/70">{sub}</span>}
      </div>
    </div>
  );
}

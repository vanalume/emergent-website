import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/admin/AdminAuth";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const UNITS = ["rem", "px", "em"];

const parseSize = (v) => {
  const m = /^(\d+(?:\.\d+)?)(rem|em|px)$/.exec(v || "");
  return m ? { num: m[1], unit: m[2] } : { num: "", unit: "rem" };
};

export default function TypographyEditor() {
  const { authHeaders } = useAdminAuth();
  const [breakpoints, setBreakpoints] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [bp, setBp] = useState("mobile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    try {
      const { data } = await axios.get(`${API}/admin/typography`, { headers: authHeaders });
      setBreakpoints(data.breakpoints || []);
      setTokens(data.tokens || []);
      if (bp && !(data.breakpoints || []).some((b) => b.key === bp)) {
        setBp((data.breakpoints || [])[0]?.key || "mobile");
      }
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not load typography");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetch(); }, []);

  const setSize = (key, value) => {
    setTokens((prev) => prev.map((t) => (t.key === key ? { ...t, sizes: { ...t.sizes, [bp]: value } } : t)));
  };

  const save = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/typography`, { tokens }, { headers: authHeaders });
      toast.success("Typography saved");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const groups = useMemo(() => {
    const m = new Map();
    for (const t of tokens) {
      if (!m.has(t.group)) m.set(t.group, []);
      m.get(t.group).push(t);
    }
    return [...m.entries()];
  }, [tokens]);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] tracking-[0.24em] uppercase text-[#5c3e2b]">Design</p>
          <h1 className="font-display text-5xl mt-2 leading-none">Typography</h1>
          <p className="text-[#5c3e2b]/80 mt-3 text-sm max-w-lg">Control font sizes across the site. Each token has a size per breakpoint.</p>
        </div>
        <button onClick={save} disabled={saving || loading}
          className="shrink-0 inline-flex items-center gap-2 text-sm bg-[#2b2320] text-[#f8f6f2] rounded-full px-5 py-2.5 hover:bg-[#395439] transition-colors disabled:opacity-50">
          <Save size={15} /> {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {/* Breakpoint toggle */}
      <div className="flex flex-wrap gap-2 mt-8">
        {breakpoints.map((b) => (
          <button key={b.key} onClick={() => setBp(b.key)}
            className={`text-sm px-5 py-2 rounded-full border transition-colors ${
              bp === b.key ? "bg-[#2b2320] text-[#f8f6f2] border-[#2b2320]" : "border-[#2b2320]/25 text-[#2b2320]/70 hover:border-[#2b2320]"
            }`}>
            {b.label}
          </button>
        ))}
      </div>

      {/* Token list grouped by area */}
      {loading ? (
        <p className="text-sm text-[#5c3e2b]/60 mt-8">Loading…</p>
      ) : (
        <div className="mt-8 space-y-10 max-w-2xl">
          {groups.map(([group, groupTokens]) => (
            <div key={group}>
              <p className="text-[10px] tracking-[0.18em] uppercase text-[#5c3e2b]/60 mb-3">{group}</p>
              <div className="space-y-2">
                {groupTokens.map((t) => {
                  const { num, unit } = parseSize(t.sizes?.[bp]);
                  return (
                    <div key={t.key} className="flex items-center gap-4 bg-[#faf7f1] rounded-sm border border-[#2b2320]/10 px-4 py-3">
                      <span className="flex-1 text-sm text-[#2b2320]">{t.label}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.05"
                          min="0"
                          value={num}
                          onChange={(e) => setSize(t.key, `${e.target.value === "" ? "" : Number(e.target.value)}${unit}`)}
                          className="w-20 bg-transparent border-b border-[#2b2320]/25 focus:border-[#2b2320] outline-none py-1 text-sm text-right text-[#2b2320]"
                        />
                        <select
                          value={unit}
                          onChange={(e) => setSize(t.key, `${num || 0}${e.target.value}`)}
                          className="bg-transparent border border-[#2b2320]/25 rounded-full px-2 py-1 text-xs text-[#2b2320]"
                        >
                          {UNITS.map((u) => <option key={u} value={u} className="bg-[#f8f6f2]">{u}</option>)}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

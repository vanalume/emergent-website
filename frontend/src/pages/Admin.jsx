import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Lock, RefreshCw, Mail, Inbox } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const KEY_STORE = "vanalume_admin_key";

function fmt(iso) {
  try {
    return new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function Admin() {
  const [key, setKey] = useState(() => localStorage.getItem(KEY_STORE) || "");
  const [input, setInput] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState({ inquiries: [], newsletter: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("inquiries");

  const load = useCallback(async (k) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`${API}/admin/data`, { headers: { "X-Admin-Key": k } });
      setData(data);
      setAuthed(true);
      localStorage.setItem(KEY_STORE, k);
      setKey(k);
    } catch {
      setError("Incorrect access key.");
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (key) load(key);
  }, [key, load]);

  const logout = () => {
    localStorage.removeItem(KEY_STORE);
    setKey("");
    setAuthed(false);
    setData({ inquiries: [], newsletter: [] });
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f1ea] px-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 text-[#5c3e2b] mb-6"><Lock size={16} /><span className="text-xs tracking-[0.24em] uppercase">Vanalume Admin</span></div>
          <h1 className="font-display text-4xl mb-8">Inquiries</h1>
          <form onSubmit={(e) => { e.preventDefault(); load(input); }} className="space-y-4">
            <input
              data-testid="admin-key-input"
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Access key"
              className="w-full bg-transparent border-b border-[#2b2320]/25 focus:border-[#2b2320] outline-none py-3 text-lg"
            />
            {error && <p className="text-sm text-[#9a3b2e]">{error}</p>}
            <button data-testid="admin-login-btn" type="submit" disabled={loading} className="w-full bg-[#2b2320] text-[#f8f6f2] rounded-full py-3.5 text-sm tracking-wide hover:bg-[#395439] transition-colors disabled:opacity-50">
              {loading ? "Checking…" : "Enter"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const { inquiries, newsletter } = data;

  return (
    <div className="min-h-screen bg-[#f5f1ea] px-4 md:px-10 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <span className="text-xs tracking-[0.24em] uppercase text-[#5c3e2b]">Vanalume Admin</span>
            <h1 className="font-display text-4xl mt-1">Submissions</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => load(key)} className="inline-flex items-center gap-2 text-sm border border-[#2b2320]/25 rounded-full px-4 py-2 hover:border-[#2b2320] transition-colors"><RefreshCw size={14} /> Refresh</button>
            <button onClick={logout} className="text-sm text-[#5c3e2b] underline">Log out</button>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab("inquiries")} data-testid="admin-tab-inquiries" className={`inline-flex items-center gap-2 text-sm px-5 py-2 rounded-full border transition-colors ${tab === "inquiries" ? "bg-[#2b2320] text-[#f8f6f2] border-[#2b2320]" : "border-[#2b2320]/20 hover:border-[#2b2320]"}`}><Inbox size={14} /> Inquiries ({inquiries.length})</button>
          <button onClick={() => setTab("newsletter")} data-testid="admin-tab-newsletter" className={`inline-flex items-center gap-2 text-sm px-5 py-2 rounded-full border transition-colors ${tab === "newsletter" ? "bg-[#2b2320] text-[#f8f6f2] border-[#2b2320]" : "border-[#2b2320]/20 hover:border-[#2b2320]"}`}><Mail size={14} /> Newsletter ({newsletter.length})</button>
        </div>

        {tab === "inquiries" ? (
          inquiries.length === 0 ? (
            <p className="text-[#2b2320]/50 py-16 text-center">No inquiries yet.</p>
          ) : (
            <div className="space-y-4" data-testid="admin-inquiries">
              {inquiries.map((q) => (
                <div key={q.id} className="bg-white rounded-sm p-6 border border-[#2b2320]/10">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-3">
                      <h3 className="font-display text-2xl">{q.name}</h3>
                      {q.inquiry_type && <span className="text-xs tracking-[0.14em] uppercase text-[#f8f6f2] bg-[#395439] rounded-full px-3 py-1">{q.inquiry_type}</span>}
                    </div>
                    <span className="text-xs text-[#2b2320]/50">{fmt(q.created_at)}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-sm text-[#5c3e2b]">
                    <a href={`mailto:${q.email}`} className="underline">{q.email}</a>
                    {q.phone && <span>{q.phone}</span>}
                    {q.company && <span>{q.company}</span>}
                  </div>
                  <p className="mt-4 text-[#2b2320]/85 leading-relaxed whitespace-pre-wrap">{q.message}</p>
                </div>
              ))}
            </div>
          )
        ) : (
          newsletter.length === 0 ? (
            <p className="text-[#2b2320]/50 py-16 text-center">No subscribers yet.</p>
          ) : (
            <div className="bg-white rounded-sm border border-[#2b2320]/10 divide-y divide-[#2b2320]/10" data-testid="admin-newsletter">
              {newsletter.map((n) => (
                <div key={n.id} className="flex items-center justify-between px-6 py-4">
                  <a href={`mailto:${n.email}`} className="text-[#2b2320] underline">{n.email}</a>
                  <span className="text-xs text-[#2b2320]/50">{fmt(n.created_at)}</span>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

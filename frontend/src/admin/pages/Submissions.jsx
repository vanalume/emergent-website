import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Mail, Inbox, RefreshCw } from "lucide-react";
import { useAdminAuth } from "@/admin/AdminAuth";
import DataTable from "@/admin/primitives/DataTable";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function fmt(iso) {
  try {
    return new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
}

export default function Submissions() {
  const { authHeaders } = useAdminAuth();
  const [data, setData] = useState({ inquiries: [], newsletter: [] });
  const [tab, setTab] = useState("inquiries");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/admin/data`, { headers: authHeaders });
      setData(data);
    } finally { setLoading(false); }
  }, [authHeaders]);

  useEffect(() => { load(); }, [load]);

  const { inquiries, newsletter } = data;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.24em] uppercase text-[#5c3e2b]">Enquiries &amp; newsletter</p>
          <h1 className="font-display text-5xl md:text-6xl mt-2 leading-none">Submissions</h1>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 text-sm border border-[#2b2320]/25 rounded-full px-4 py-2 hover:border-[#2b2320] transition-colors">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="flex gap-2 mt-8">
        <button onClick={() => setTab("inquiries")} data-testid="tab-inquiries" className={`inline-flex items-center gap-2 text-sm px-5 py-2 rounded-full border transition-colors ${tab === "inquiries" ? "bg-[#2b2320] text-[#f8f6f2] border-[#2b2320]" : "border-[#2b2320]/20 hover:border-[#2b2320]"}`}>
          <Inbox size={14} /> Inquiries ({inquiries.length})
        </button>
        <button onClick={() => setTab("newsletter")} data-testid="tab-newsletter" className={`inline-flex items-center gap-2 text-sm px-5 py-2 rounded-full border transition-colors ${tab === "newsletter" ? "bg-[#2b2320] text-[#f8f6f2] border-[#2b2320]" : "border-[#2b2320]/20 hover:border-[#2b2320]"}`}>
          <Mail size={14} /> Newsletter ({newsletter.length})
        </button>
      </div>

      <div className="mt-6">
        {tab === "inquiries" ? (
          <DataTable
            rows={inquiries}
            rowKey={(r) => r.id}
            emptyMessage="No enquiries yet."
            searchPlaceholder="Search by name, email, message"
            columns={[
              { key: "name", header: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
              { key: "email", header: "Email", render: (r) => <a href={`mailto:${r.email}`} className="underline text-[#5c3e2b]">{r.email}</a> },
              { key: "inquiry_type", header: "Type", render: (r) => r.inquiry_type ? <span className="text-xs bg-[#395439] text-[#f8f6f2] rounded-full px-2 py-0.5">{r.inquiry_type}</span> : <span className="text-[#5c3e2b]/40">—</span> },
              { key: "message", header: "Message", render: (r) => <span className="line-clamp-2 text-[#2b2320]/80">{r.message}</span> },
              { key: "created_at", header: "When", render: (r) => <span className="text-[#5c3e2b]/70 whitespace-nowrap">{fmt(r.created_at)}</span> },
            ]}
          />
        ) : (
          <DataTable
            rows={newsletter}
            rowKey={(r) => r.id || r.email}
            emptyMessage="No subscribers yet."
            searchPlaceholder="Search by email"
            columns={[
              { key: "email", header: "Email", render: (r) => <a href={`mailto:${r.email}`} className="underline text-[#5c3e2b]">{r.email}</a> },
              { key: "created_at", header: "Subscribed", render: (r) => <span className="text-[#5c3e2b]/70">{fmt(r.created_at)}</span> },
            ]}
          />
        )}
      </div>
    </div>
  );
}

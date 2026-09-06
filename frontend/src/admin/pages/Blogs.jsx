import { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, Eye } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/admin/AdminAuth";
import DataTable from "@/admin/primitives/DataTable";
import ConfirmDialog from "@/admin/primitives/ConfirmDialog";
import BlogEditor from "@/admin/pages/BlogEditor";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Blogs() {
  const { authHeaders } = useAdminAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetch = async () => {
    try {
      const { data } = await axios.get(`${API}/admin/blogs`, { headers: authHeaders });
      setRows(data);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not load blogs");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetch(); }, []);

  const closeEditor = () => { setCreating(false); setEditing(null); };

  const doDelete = async () => {
    try {
      await axios.delete(`${API}/admin/blogs/${deleting.id}`, { headers: authHeaders });
      toast.success("Blog deleted");
      setDeleting(null);
      fetch();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Delete failed");
      setDeleting(null);
    }
  };

  if (creating || editing) {
    return (
      <BlogEditor
        blog={editing}
        existingIds={rows.map((r) => r.id)}
        onClose={closeEditor}
        onSaved={fetch}
      />
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.24em] uppercase text-[#5c3e2b]">Journal</p>
          <h1 className="font-display text-5xl mt-2 leading-none">Blogs</h1>
          <p className="text-[#5c3e2b]/80 mt-3 text-sm max-w-lg">Write and publish the stories that appear on the site.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setCreating(true); }}
          className="shrink-0 inline-flex items-center gap-2 text-sm bg-[#2b2320] text-[#f8f6f2] rounded-full px-5 py-2.5 hover:bg-[#395439] transition-colors"
        >
          <Plus size={15} /> New blog
        </button>
      </div>

      <div className="mt-10">
        <DataTable
          rows={rows}
          rowKey={(r) => r.id}
          emptyMessage={loading ? "Loading…" : "No blogs yet."}
          columns={[
            { key: "title", header: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
            { key: "author", header: "Author", render: (r) => <span className="text-[#2b2320]/60">{r.author || "—"}</span> },
            {
              key: "published",
              header: "Status",
              render: (r) => (
                <span className={`text-[11px] tracking-wide px-3 py-1 rounded-full ${r.published ? "bg-[#395439]/12 text-[#395439]" : "bg-[#2b2320]/8 text-[#2b2320]/60"}`}>
                  {r.published ? "Published" : "Draft"}
                </span>
              ),
            },
          ]}
          actions={(r) => (
            <div className="inline-flex items-center gap-1">
              <a href={`/blog/${r.id}`} target="_blank" rel="noreferrer" aria-label={`View ${r.title}`} className="h-8 w-8 rounded-full hover:bg-[#2b2320]/8 flex items-center justify-center">
                <Eye size={14} />
              </a>
              <button onClick={() => { setCreating(false); setEditing(r); }} aria-label={`Edit ${r.title}`} className="h-8 w-8 rounded-full hover:bg-[#2b2320]/8 flex items-center justify-center">
                <Pencil size={14} />
              </button>
              <button onClick={() => setDeleting(r)} aria-label={`Delete ${r.title}`} className="h-8 w-8 rounded-full hover:bg-[#9a3b2e]/10 flex items-center justify-center text-[#9a3b2e]">
                <Trash2 size={14} />
              </button>
            </div>
          )}
        />
      </div>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={doDelete}
        title="Delete this blog?"
        description={`"${deleting?.title}" will be permanently removed.`}
      />
    </div>
  );
}

import { useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/admin/AdminAuth";
import FormField from "@/admin/primitives/FormField";
import SingleImagePicker from "@/admin/primitives/SingleImagePicker";
import RichTextEditor from "@/admin/primitives/RichTextEditor";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const slugify = (s) =>
  (s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const EXT = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

const EMPTY = { id: "", title: "", excerpt: "", cover_image: "", content: "", author: "", published: false };

export default function BlogEditor({ blog, existingIds = [], onClose, onSaved }) {
  const { authHeaders, key: adminKey } = useAdminAuth();
  const isEdit = !!blog;
  const [form, setForm] = useState(() =>
    blog
      ? {
          id: blog.id,
          title: blog.title || "",
          excerpt: blog.excerpt || "",
          cover_image: blog.cover_image || "",
          content: blog.content || "",
          author: blog.author || "",
          published: !!blog.published,
        }
      : { ...EMPTY },
  );
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const deriveId = (title) => {
    const base = slugify(title);
    if (!base) return "";
    let id = base;
    let n = 2;
    const used = new Set(existingIds);
    while (used.has(id)) id = `${base}-${n++}`;
    return id;
  };

  const onTitle = (title) => {
    set("title", title);
    if (!isEdit) set("id", deriveId(title));
  };

  const uploadImageBytes = async (bytes, contentType, folder) => {
    const ext = EXT[contentType] || "png";
    const file = new File([bytes], `image.${ext}`, { type: contentType });
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await axios.post(
      `${API}/admin/upload?folder=${encodeURIComponent(folder)}`,
      fd,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(adminKey ? { "X-Admin-Key": adminKey } : {}),
        },
      },
    );
    return data.url || data.path;
  };

  // Take the base64/blob images embedded in the Quill HTML, upload each to S3
  // under `folder`, and rewrite the `src` to the returned public URL. Returns the
  // original HTML untouched when there is nothing to relocate.
  const relocateImages = async (html, folder) => {
    if (!html || !/<img\b[^>]*(?:data:image\/|blob:)/i.test(html)) return html;
    const doc = new DOMParser().parseFromString(html, "text/html");
    let changed = false;
    for (const img of Array.from(doc.querySelectorAll("img"))) {
      const src = img.getAttribute("src") || "";
      let bytes;
      let contentType;
      if (src.startsWith("data:image/")) {
        const m = /^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i.exec(src);
        if (!m) continue;
        contentType = m[1];
        const bin = atob(m[2]);
        bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      } else if (src.startsWith("blob:")) {
        const blob = await fetch(src).then((r) => r.blob());
        bytes = new Uint8Array(await blob.arrayBuffer());
        contentType = blob.type || "image/png";
      } else {
        continue;
      }
      const url = await uploadImageBytes(bytes, contentType, folder);
      img.setAttribute("src", url);
      changed = true;
    }
    return changed ? doc.body.innerHTML : html;
  };

  const save = async () => {
    if (!form.title?.trim()) { toast.error("Title is required"); return; }
    if (!form.id?.trim()) { toast.error("Could not derive a slug from the title"); return; }
    setSaving(true);
    try {
      const content = await relocateImages(form.content, `blog/${form.id}`);
      const payload = { ...form, content };
      if (isEdit) {
        await axios.put(`${API}/admin/blogs/${form.id}`, payload, { headers: authHeaders });
        toast.success("Blog updated");
      } else {
        await axios.post(`${API}/admin/blogs`, payload, { headers: authHeaders });
        toast.success("Blog created");
      }
      onSaved?.();
      onClose?.();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-testid="blog-editor">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.24em] uppercase text-[#5c3e2b]">Journal</p>
          <h1 className="font-display text-5xl mt-2 leading-none">{isEdit ? "Edit blog" : "New blog"}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 text-sm bg-[#2b2320] text-[#f8f6f2] rounded-full px-6 py-2.5 hover:bg-[#395439] transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            onClick={onClose}
            aria-label="Close"
            data-testid="blog-editor-close"
            className="h-10 w-10 rounded-full border border-[#2b2320]/25 flex items-center justify-center text-[#2b2320]/60 hover:text-[#2b2320] hover:border-[#2b2320] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="mt-10 max-w-4xl space-y-6">
        <FormField
          label="Title"
          value={form.title}
          onChange={onTitle}
          required
          hint={form.id ? `URL: /blog/${form.id}` : "The URL slug is auto-derived from the title."}
        />
        <FormField label="Excerpt" as="textarea" rows={2} value={form.excerpt} onChange={(v) => set("excerpt", v)} hint="A short summary shown on the blog card." />
        <FormField label="Author" value={form.author} onChange={(v) => set("author", v)} />
        <SingleImagePicker label="Cover image" value={form.cover_image} onChange={(v) => set("cover_image", v)} adminKey={adminKey} />
        <FormField as="toggle" label="Published" checked={form.published} onChange={(v) => set("published", v)} hint="Only published blogs appear on the public site." />
        <div>
          <label className="text-xs tracking-[0.14em] uppercase text-[#5c3e2b]">Story</label>
          <p className="text-[11px] text-[#5c3e2b]/60 mt-0.5 mb-2">Images are uploaded to S3 when you save.</p>
          <RichTextEditor
            key={isEdit ? blog.id : "new"}
            value={form.content}
            onChange={(html) => set("content", html)}
          />
        </div>
      </div>
    </div>
  );
}

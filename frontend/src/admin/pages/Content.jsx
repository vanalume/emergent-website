import { useEffect, useState } from "react";
import axios from "axios";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/admin/AdminAuth";
import FormField from "@/admin/primitives/FormField";
import StringArrayEditor from "@/admin/primitives/StringArrayEditor";
import SingleImagePicker from "@/admin/primitives/SingleImagePicker";
import ListEditor from "@/admin/primitives/ListEditor";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PAGES = [
  { slug: "home", label: "Home" },
  { slug: "shop", label: "Shop" },
  { slug: "about", label: "About" },
  { slug: "contact", label: "Contact" },
  { slug: "footer", label: "Footer" },
  { slug: "navbar", label: "Navbar" },
];

const LIST_SCHEMAS = {
  hero_slides: [
    { key: "id", label: "Id", as: "text" },
    { key: "image", label: "Image", as: "image" },
    { key: "alt", label: "Alt", as: "text" },
  ],
  senses: [
    { key: "key", label: "Title", as: "text" },
    { key: "desc", label: "Body", as: "textarea" },
    { key: "icon", label: "Icon", as: "text" },
  ],
  founders: [
    { key: "name", label: "Name", as: "text" },
    { key: "role", label: "Role", as: "text" },
    { key: "img", label: "Image", as: "image" },
    { key: "bio", label: "Bio", as: "textarea" },
  ],
  beginning: [
    { key: "text", label: "Paragraph", as: "textarea" },
  ],
  quick_links: [
    { key: "label", label: "Label", as: "text" },
    { key: "to", label: "Route", as: "text" },
  ],
  links: [
    { key: "label", label: "Label", as: "text" },
    { key: "to", label: "Route", as: "text" },
  ],
};

const prettify = (key) => key.replace(/_/g, " ");

export default function Content() {
  const { authHeaders, key: adminKey } = useAdminAuth();
  const [slug, setSlug] = useState("home");
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPage = async (s) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/admin/content/pages/${s}`, { headers: authHeaders });
      setSections(data.sections || []);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not load page");
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchPage(slug); }, [slug]);

  const setSection = (key, value) => {
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)));
  };

  const save = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/content/pages/${slug}`, { slug, sections }, { headers: authHeaders });
      toast.success("Content saved");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const renderSection = (s) => {
    switch (s.type) {
      case "text":
        return <FormField label={prettify(s.key)} value={s.value ?? ""} onChange={(v) => setSection(s.key, v)} />;
      case "richtext":
        return <FormField label={prettify(s.key)} as="textarea" value={s.value ?? ""} onChange={(v) => setSection(s.key, v)} rows={5} />;
      case "image":
        return (
          <SingleImagePicker
            label={prettify(s.key)}
            value={s.value ?? ""}
            onChange={(url) => setSection(s.key, url)}
            adminKey={adminKey}
          />
        );
      case "list_of_text":
        return <StringArrayEditor label={prettify(s.key)} value={s.value || []} onChange={(v) => setSection(s.key, v)} />;
      case "toggle":
        return <FormField label={prettify(s.key)} as="toggle" checked={!!s.value} onChange={(v) => setSection(s.key, v)} />;
      case "list":
        return <ListEditor label={prettify(s.key)} value={s.value || []} onChange={(v) => setSection(s.key, v)} schema={LIST_SCHEMAS[s.key] || []} adminKey={adminKey} />;
      default:
        return <FormField label={prettify(s.key)} as="textarea" value={JSON.stringify(s.value)} onChange={() => {}} />;
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] tracking-[0.24em] uppercase text-[#5c3e2b]">Website</p>
          <h1 className="font-display text-5xl mt-2 leading-none">Content</h1>
          <p className="text-[#5c3e2b]/80 mt-3 text-sm max-w-lg">Edit the copy and imagery across the site without redeploying.</p>
        </div>
        <button onClick={save} disabled={saving || loading}
          className="shrink-0 inline-flex items-center gap-2 text-sm bg-[#2b2320] text-[#f8f6f2] rounded-full px-5 py-2.5 hover:bg-[#395439] transition-colors disabled:opacity-50">
          <Save size={15} /> {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {/* Page selector */}
      <div className="flex flex-wrap gap-2 mt-8">
        {PAGES.map((p) => (
          <button key={p.slug} onClick={() => setSlug(p.slug)}
            className={`text-sm px-5 py-2 rounded-full border transition-colors ${
              slug === p.slug ? "bg-[#2b2320] text-[#f8f6f2] border-[#2b2320]" : "border-[#2b2320]/25 text-[#2b2320]/70 hover:border-[#2b2320]"
            }`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="mt-8 space-y-6 max-w-3xl">
        {loading ? (
          <p className="text-sm text-[#5c3e2b]/60">Loading…</p>
        ) : (
          sections.map((s) => (
            <div key={s.key} className="bg-[#faf7f1] rounded-sm border border-[#2b2320]/10 p-5">
              <span className="text-[10px] tracking-[0.16em] uppercase text-[#5c3e2b]/60">{s.type}</span>
              <div className="mt-3">{renderSection(s)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

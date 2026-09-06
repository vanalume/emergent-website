import { useRef, useState } from "react";
import axios from "axios";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/**
 * SingleImagePicker — a compact single-image uploader (thumbnail + upload +
 * remove). Uploads to `/admin/upload` and emits the returned URL.
 *
 * Props:
 *  - value: string (image URL)
 *  - onChange: (url) => void
 *  - adminKey: string
 *  - label?: string
 *  - endpoint?: string (default "/admin/upload")
 *  - maxSizeMb?: number (default 8)
 */
export default function SingleImagePicker({
  value = "",
  onChange,
  adminKey,
  label = "",
  endpoint = "/admin/upload",
  maxSizeMb = 8,
}) {
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const upload = async (file) => {
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`${file.name} is over ${maxSizeMb} MB`);
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await axios.post(`${API}${endpoint}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(adminKey ? { "X-Admin-Key": adminKey } : {}),
        },
      });
      onChange?.(data.url || data.path);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (f) upload(f);
    e.target.value = "";
  };

  return (
    <div>
      {label && <label className="text-xs tracking-[0.14em] uppercase text-[#5c3e2b]">{label}</label>}

      <div className="mt-2 flex items-start gap-4">
        {value ? (
          <div className="relative h-24 w-24 rounded-sm overflow-hidden bg-[#ece3d4] border border-[#2b2320]/10 shrink-0">
            <img src={value} alt="" className="h-full w-full object-cover" />
            <button type="button" onClick={() => onChange?.("")} aria-label="Remove image"
              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-[#f8f6f2]/90 flex items-center justify-center text-[#9a3b2e] hover:bg-[#f8f6f2]">
              <X size={13} />
            </button>
          </div>
        ) : (
          <div className="h-24 w-24 rounded-sm bg-[#ece3d4] border border-dashed border-[#2b2320]/25 flex items-center justify-center text-[#5c3e2b]/40 shrink-0">
            <Upload size={18} />
          </div>
        )}

        <div className="flex-1">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-2 text-sm border border-[#2b2320]/25 rounded-full px-5 py-2 hover:border-[#2b2320] disabled:opacity-50 transition-colors"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {value ? "Replace image" : "Upload image"}
          </button>
          <p className="text-[11px] text-[#5c3e2b]/60 mt-2">PNG / JPG / WEBP · up to {maxSizeMb} MB</p>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
    </div>
  );
}

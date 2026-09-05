import { useCallback, useRef, useState } from "react";
import axios from "axios";
import { Upload, X, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/**
 * ImageDropzone — drag/drop OR click-to-upload for one or many images.
 *
 * Props:
 *  - value: string[] (URLs, in display order)
 *  - onChange: (nextUrls) => void
 *  - multiple: boolean (default true)
 *  - maxSizeMb: number (default 8)
 *  - endpoint: string (default `/admin/upload`) — Phase 2 supplies this
 *
 * When endpoint is empty (Phase 1) it falls back to a local object URL so the
 * component is fully interactive in the kitchensink before storage is wired.
 */
export default function ImageDropzone({
  value = [],
  onChange,
  multiple = true,
  maxSizeMb = 8,
  endpoint,
  adminKey,
  label = "Images",
  className = "",
}) {
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const uploadOne = useCallback(async (file) => {
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`${file.name} is over ${maxSizeMb} MB`);
      return null;
    }
    if (!endpoint) {
      // Phase 1 fallback — preview only, no upload
      return URL.createObjectURL(file);
    }
    const form = new FormData();
    form.append("file", file);
    const { data } = await axios.post(`${API}${endpoint}`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(adminKey ? { "X-Admin-Key": adminKey } : {}),
      },
    });
    return data.url || data.path;
  }, [endpoint, adminKey, maxSizeMb]);

  const handleFiles = useCallback(async (files) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;
    setBusy(true);
    try {
      const urls = [];
      for (const f of (multiple ? list : list.slice(0, 1))) {
        const u = await uploadOne(f);
        if (u) urls.push(u);
      }
      onChange?.(multiple ? [...value, ...urls] : urls);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Upload failed");
    } finally { setBusy(false); }
  }, [uploadOne, value, onChange, multiple]);

  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const remove = (i) => onChange?.(value.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = value.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange?.(next);
  };

  return (
    <div className={className}>
      {label && <label className="text-xs tracking-[0.14em] uppercase text-[#5c3e2b]">{label}</label>}

      <div className={`mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 ${value.length ? "" : "hidden"}`}>
        {value.map((src, i) => (
          <div key={`${src}-${i}`} className="group relative aspect-[4/5] rounded-sm overflow-hidden bg-[#ece3d4] border border-[#2b2320]/10">
            <img src={src} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2b2320]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
              <div className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                  className="h-7 w-7 rounded-full bg-[#f8f6f2]/90 flex items-center justify-center disabled:opacity-30" aria-label="Move up">
                  <ArrowUp size={13} />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1}
                  className="h-7 w-7 rounded-full bg-[#f8f6f2]/90 flex items-center justify-center disabled:opacity-30" aria-label="Move down">
                  <ArrowDown size={13} />
                </button>
              </div>
              <button type="button" onClick={() => remove(i)}
                className="h-7 w-7 rounded-full bg-[#f8f6f2]/90 flex items-center justify-center text-[#9a3b2e]" aria-label="Remove">
                <X size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`mt-3 w-full border-2 border-dashed rounded-sm py-8 flex flex-col items-center justify-center gap-2 transition-colors ${
          dragOver ? "border-[#395439] bg-[#e8ddc9]/60" : "border-[#2b2320]/25 hover:border-[#2b2320]/50"
        }`}
      >
        {busy ? (
          <><Loader2 className="animate-spin text-[#5c3e2b]" size={22} /><span className="text-sm text-[#5c3e2b]">Uploading…</span></>
        ) : (
          <>
            <Upload size={22} className="text-[#5c3e2b]" />
            <span className="text-sm text-[#2b2320]">Drop {multiple ? "images" : "an image"} here, or click to browse</span>
            <span className="text-[11px] text-[#5c3e2b]/70">PNG / JPG / WEBP · up to {maxSizeMb} MB each</span>
          </>
        )}
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
        className="hidden"
      />
    </div>
  );
}

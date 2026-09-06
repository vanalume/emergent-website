import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

/**
 * RichTextEditor — a Quill.js WYSIWYG wrapper, themed to the site.
 *
 * The stored value is the editor's semantic HTML (headings, paragraphs, lists,
 * bold/italic, links and images). Images inserted or pasted are held as base64
 * data URIs by Quill; the parent is responsible for relocating them to S3 and
 * rewriting the `src` before saving (see BlogEditor).
 *
 * Props:
 *  - value: string (initial HTML)
 *  - onChange: (html) => void
 *
 * NOTE: Quill is browser-only, so mount it via a ref/effect (no react-quill,
 * which is incompatible with React 19). Re-key the component from the parent to
 * load a different document.
 */
export default function RichTextEditor({ value = "", onChange }) {
  const containerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const quill = new Quill(container, {
      theme: "snow",
      placeholder: "Write your story…",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote", "link"],
          ["image"],
          ["clean"],
        ],
      },
    });

    if (value) {
      const delta = quill.clipboard.convert({ html: value });
      quill.setContents(delta, "silent");
    }

    quill.on("text-change", () => {
      onChangeRef.current?.(quill.root.innerHTML);
    });

    return () => {
      // Quill inserts the toolbar as a *sibling* of `container`, so it must be
      // removed explicitly (clearing innerHTML alone leaves it behind and, under
      // React StrictMode's double-invoke, produces a second toolbar).
      quill.getModule("toolbar")?.container?.remove();
      container.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="vl-quill-editor" />;
}

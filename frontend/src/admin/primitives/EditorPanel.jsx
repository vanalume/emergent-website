import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

/**
 * EditorPanel — the right-hand Sheet used for every add/edit form in the admin.
 * Wraps a form so CRUD screens don't rebuild the same overlay + close + z-index.
 *
 * Props:
 *  - open, onClose
 *  - title, kicker (small uppercase eyebrow)
 *  - width (default 640)
 *  - children (the form body)
 *  - footer (usually the primary save button + secondary cancel/delete)
 */
export default function EditorPanel({
  open, onClose, title, kicker, width = 640, footer, children,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-[#2b2320]/40 backdrop-blur-sm"
          />
          <motion.aside
            data-testid="editor-panel"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ width }}
            className="fixed top-0 right-0 z-[71] h-full max-w-full bg-[#f8f6f2] flex flex-col shadow-2xl"
          >
            <div className="flex items-start justify-between px-8 py-6 border-b border-[#2b2320]/10">
              <div>
                {kicker && <p className="text-[10px] tracking-[0.18em] uppercase text-[#5c3e2b]">{kicker}</p>}
                <h2 className="font-display text-3xl mt-1 leading-tight">{title}</h2>
              </div>
              <button onClick={onClose} aria-label="Close" className="p-2 -mr-2 text-[#2b2320]/60 hover:text-[#2b2320]">
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto vl-hide-scrollbar px-8 py-6" data-lenis-prevent>
              {children}
            </div>

            {footer && (
              <div className="border-t border-[#2b2320]/10 px-8 py-5 flex items-center justify-end gap-3 bg-[#faf7f1]">
                {footer}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

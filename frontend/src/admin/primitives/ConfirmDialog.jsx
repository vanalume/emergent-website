import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

/**
 * ConfirmDialog — one-message destructive confirmation modal.
 *
 * Props:
 *  - open, onClose, onConfirm
 *  - title, description
 *  - confirmLabel (default "Delete"), cancelLabel ("Cancel")
 *  - tone: "danger" | "neutral"
 */
export default function ConfirmDialog({
  open, onClose, onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Delete", cancelLabel = "Cancel",
  tone = "danger",
}) {
  const btnBg = tone === "danger" ? "bg-[#9a3b2e] hover:bg-[#7c2f25]" : "bg-[#2b2320] hover:bg-[#395439]";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-[#2b2320]/50 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            data-testid="confirm-dialog"
            className="fixed z-[81] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4 bg-[#f8f6f2] rounded-sm shadow-2xl overflow-hidden"
          >
            <div className="px-8 pt-8 pb-6">
              {tone === "danger" && (
                <div className="h-12 w-12 rounded-full bg-[#9a3b2e]/10 flex items-center justify-center text-[#9a3b2e] mb-5">
                  <AlertTriangle size={22} />
                </div>
              )}
              <h3 className="font-display text-2xl">{title}</h3>
              <p className="text-sm text-[#2b2320]/70 mt-3 leading-relaxed">{description}</p>
            </div>
            <div className="bg-[#faf7f1] px-8 py-4 flex justify-end gap-3 border-t border-[#2b2320]/10">
              <button onClick={onClose} className="text-sm border border-[#2b2320]/25 rounded-full px-5 py-2 hover:border-[#2b2320]">
                {cancelLabel}
              </button>
              <button
                onClick={() => { onConfirm?.(); onClose?.(); }}
                className={`text-sm text-[#f8f6f2] rounded-full px-5 py-2 transition-colors ${btnBg}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { glowStyle } from "@/lib/style";
import { useI18n } from "@/lib/i18n";

/** Full-screen module view: background blur + HUD entry animation. */
export function PanelOverlay({
  open,
  title,
  glow = "var(--neon)",
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  glow?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/70 p-0 backdrop-blur-xl sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
            style={glowStyle(glow)}
            className="os-panel scroll-hidden relative max-h-[92dvh] w-full max-w-5xl overflow-y-auto p-4 sm:p-6"
          >
            <span className="hud-frame opacity-80" aria-hidden />
            <header className="relative mb-4 flex items-center justify-between gap-3">
              <h2 className="text-glow font-display text-base tracking-[0.18em] uppercase sm:text-lg">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={t("common.close")}
                className="grid h-9 w-9 place-items-center rounded-lg border border-border/70 bg-surface-2/60 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="relative">{children}</div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

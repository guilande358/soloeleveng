import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Sparkle } from "lucide-react";

import { CARDS } from "@/data/game";
import { useHud } from "@/lib/hud-state";
import { useI18n } from "@/lib/i18n";

/** Upgrade button: summons an animated magic card that lands in the centre banner. */
export function UpgradeButton({ onSummoned }: { onSummoned: (cardId: string) => void }) {
  const { t } = useI18n();
  const { activeCardId } = useHud();
  const [summoning, setSummoning] = useState(false);

  const nextCard = (() => {
    const index = CARDS.findIndex((c) => c.id === activeCardId);
    return CARDS[Math.min(index + 1, CARDS.length - 1)] ?? CARDS[5];
  })();

  function summon() {
    if (summoning) return;
    setSummoning(true);
    window.setTimeout(() => {
      setSummoning(false);
      onSummoned(nextCard.id);
    }, 1250);
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={summon}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="relative inline-flex items-center gap-2 overflow-hidden rounded-lg border border-primary/60 bg-primary/25 px-5 py-3 font-display text-sm tracking-[0.16em] uppercase"
      >
        <span className="hud-frame" aria-hidden />
        <Sparkle className="relative h-4 w-4 text-neon-cyan" />
        <span className="text-glow relative">{t("hero.cta")}</span>
      </motion.button>

      <AnimatePresence>
        {summoning && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-background/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            {Array.from({ length: 14 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute h-1.5 w-1.5 rounded-full bg-neon-cyan"
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                animate={{
                  opacity: [0, 1, 0],
                  x: Math.cos((i / 14) * Math.PI * 2) * 160,
                  y: Math.sin((i / 14) * Math.PI * 2) * 160,
                  scale: [0.4, 1.2, 0.2],
                }}
                transition={{ duration: 1.1, ease: "easeOut" }}
              />
            ))}
            <motion.div
              style={{ "--glow": nextCard.glow } as React.CSSProperties}
              className="hud-panel relative h-64 w-44 overflow-hidden"
              initial={{ rotateY: 180, scale: 0.3, opacity: 0, y: 120 }}
              animate={{ rotateY: 0, scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.6, opacity: 0, y: -60 }}
              transition={{ type: "spring", stiffness: 160, damping: 16 }}
            >
              <span className="hud-frame" aria-hidden />
              <div
                className="flex h-full flex-col items-center justify-center gap-3"
                style={{
                  background:
                    "radial-gradient(120% 80% at 50% 0%, color-mix(in oklab, var(--glow) 55%, transparent), transparent 70%)",
                }}
              >
                <span
                  className="h-16 w-16 rotate-45 rounded-md"
                  style={{
                    background: "var(--glow)",
                    boxShadow: "0 0 40px color-mix(in oklab, var(--glow) 80%, transparent)",
                  }}
                />
                <span className="font-display text-glow text-base tracking-[0.16em] uppercase">
                  {nextCard.name}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import { motion } from "motion/react";

import type { GameCard } from "@/data/game";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function GameCardTile({
  card,
  active,
  featured,
  onClick,
}: {
  card: GameCard;
  active?: boolean;
  featured?: boolean;
  onClick?: () => void;
}) {
  const { t } = useI18n();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      style={{ "--glow": card.glow } as React.CSSProperties}
      className={cn(
        "hud-panel relative block w-[9.5rem] shrink-0 overflow-hidden p-0 text-left",
        featured && "w-[11rem]",
        active && "ring-1 ring-[var(--glow)]",
      )}
      aria-label={`${card.name} ${t("cards.card")}`}
    >
      <span className="hud-frame" aria-hidden />
      <div
        className="relative aspect-[3/4.3] w-full"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, color-mix(in oklab, var(--glow) 45%, transparent), transparent 70%), linear-gradient(180deg, color-mix(in oklab, var(--surface-2) 90%, transparent), var(--background))",
        }}
      >
        <div className="absolute inset-3 rounded-lg border border-[color-mix(in_oklab,var(--glow)_45%,transparent)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <span
            className="h-14 w-14 rotate-45 rounded-md"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklab, var(--glow) 90%, transparent), color-mix(in oklab, var(--glow) 25%, transparent))",
              boxShadow: "0 0 28px color-mix(in oklab, var(--glow) 70%, transparent)",
            }}
          />
          <span className="font-display text-glow text-sm tracking-[0.14em] uppercase">
            {card.name}
          </span>
          <span className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
            {t("cards.card")}
          </span>
        </div>
        {active && (
          <span className="absolute top-2 left-2 rounded-sm bg-[var(--glow)] px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-background uppercase">
            {t("cards.active")}
          </span>
        )}
      </div>
      <div className="relative flex items-center justify-between border-t border-border/70 px-3 py-2">
        <span className="text-xs font-semibold">{card.price.toFixed(2)} USD</span>
        <span className="text-[10px] text-muted-foreground">{card.targetRank}</span>
      </div>
    </motion.button>
  );
}

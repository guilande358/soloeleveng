import { motion } from "motion/react";
import { Award, Clock, Medal, Percent, ShieldCheck, Target, Users, Cpu } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { BENEFITS, type GameCard } from "@/data/game";
import { useI18n } from "@/lib/i18n";
import { glowStyle } from "@/lib/style";

export function CardShowcase({ card }: { card: GameCard }) {
  const { t, lang } = useI18n();

  const stats = [
    { Icon: Award, label: t("card.currentRank"), value: card.currentRank },
    { Icon: Target, label: t("card.targetRank"), value: card.targetRank },
    { Icon: Medal, label: t("card.medals"), value: String(card.medals) },
    { Icon: Clock, label: t("card.time"), value: `${card.days} ${t("card.days")}` },
    { Icon: Percent, label: t("card.success"), value: `${card.success}%` },
    {
      Icon: card.support === "llm" ? Cpu : Users,
      label: t("card.support"),
      value: card.support === "llm" ? t("card.support.llm") : t("card.support.human"),
    },
  ];

  return (
    <div className="hud-panel overflow-hidden p-4" style={glowStyle(card.glow)}>
      <span className="hud-frame" aria-hidden />
      <div className="relative grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <motion.div
          key={card.id}
          initial={{ opacity: 0, scale: 0.9, rotateY: -25 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 20 }}
          className="relative mx-auto flex aspect-[3/4] w-full max-w-[16rem] items-center justify-center rounded-xl border border-[color-mix(in_oklab,var(--glow)_50%,transparent)]"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 0%, color-mix(in oklab, var(--glow) 45%, transparent), transparent 72%), linear-gradient(180deg, var(--surface-2), var(--background))",
          }}
        >
          <motion.span
            className="h-24 w-24 rotate-45 rounded-lg"
            animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklab, var(--glow) 95%, transparent), color-mix(in oklab, var(--glow) 30%, transparent))",
              boxShadow: "0 0 60px color-mix(in oklab, var(--glow) 70%, transparent)",
            }}
          />
          <span className="absolute bottom-4 font-display text-glow text-lg tracking-[0.18em] uppercase">
            {card.name}
          </span>
        </motion.div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            {stats.map(({ Icon, label, value }) => (
              <div key={label} className="rounded-lg border border-border/70 bg-surface-2/60 p-2.5">
                <div className="flex items-center gap-1.5 text-[10px] tracking-widest text-muted-foreground uppercase">
                  <Icon className="h-3.5 w-3.5 text-[var(--glow)]" />
                  {label}
                </div>
                <p className="mt-1 font-display text-sm">{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border/70 bg-surface-2/60 p-3">
            <p className="mb-2 text-[10px] tracking-widest text-muted-foreground uppercase">
              {t("card.benefits")}
            </p>
            <ul className="grid grid-cols-2 gap-1.5 text-xs">
              {BENEFITS[lang].map((b) => (
                <li key={b} className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-neon-green" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3">
            <span className="font-display text-xl text-glow">{card.price.toFixed(2)} USD</span>
            <Link
              to="/checkout"
              className="rounded-lg bg-primary px-4 py-2.5 font-display text-xs tracking-[0.16em] text-primary-foreground uppercase transition-opacity hover:opacity-90"
            >
              {t("cards.buy")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

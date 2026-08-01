import { Crown, Handshake, Check } from "lucide-react";
import { motion } from "motion/react";

import { useHud } from "@/lib/hud-state";
import { useI18n } from "@/lib/i18n";
import { glowStyle } from "@/lib/style";
import { cn } from "@/lib/utils";

export function ModeSelector() {
  const { t } = useI18n();
  const { mode, setMode } = useHud();

  const modes = [
    {
      id: "friendly" as const,
      Icon: Handshake,
      glow: "var(--neon-green)",
      title: t("modes.friendly"),
      desc: t("modes.friendly.desc"),
      perks: ["0%", "Free"],
    },
    {
      id: "pro" as const,
      Icon: Crown,
      glow: "var(--neon)",
      title: t("modes.pro"),
      desc: t("modes.pro.desc"),
      perks: ["20%", "PRO"],
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {modes.map((m) => {
        const active = mode === m.id;
        return (
          <motion.button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            style={glowStyle(m.glow)}
            className={cn(
              "hud-panel relative overflow-hidden p-4 text-left",
              active && "ring-1 ring-[var(--glow)]",
            )}
          >
            {active && <span className="hud-frame" aria-hidden />}
            <div className="relative flex items-start gap-3">
              <m.Icon className="mt-0.5 h-6 w-6 text-[var(--glow)]" />
              <div className="flex-1">
                <h3 className="font-display text-glow text-sm tracking-[0.14em] uppercase">
                  {m.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">{m.desc}</p>
                <div className="mt-3 flex items-center gap-2">
                  {m.perks.map((p) => (
                    <span
                      key={p}
                      className="rounded-sm border border-[color-mix(in_oklab,var(--glow)_50%,transparent)] px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase"
                    >
                      {p}
                    </span>
                  ))}
                  {active && (
                    <span className="ml-auto flex items-center gap-1 text-[10px] tracking-wider text-[var(--glow)] uppercase">
                      <Check className="h-3 w-3" />
                      {t("modes.activeMode")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

import { Gift, Medal, Target } from "lucide-react";

import { HudPanel } from "@/components/hud/hud-panel";
import { useI18n } from "@/lib/i18n";

export function ProgressPanel() {
  const { t } = useI18n();
  const xp = 12450;
  const xpMax = 18000;
  const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return (
    <HudPanel title={t("progress.title")} glow="var(--neon-gold)">
      <div className="flex items-center gap-4">
        <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full border border-neon-gold/60">
          <span className="font-display text-lg text-glow">82</span>
          <span className="absolute -bottom-2 rounded-sm bg-surface-2 px-1.5 text-[9px] tracking-wider text-muted-foreground uppercase">
            {t("progress.level")}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between text-[10px] tracking-widest text-muted-foreground uppercase">
            <span>XP</span>
            <span>
              {fmt(xp)} / {fmt(xpMax)}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-linear-to-r from-primary to-neon-cyan"
              style={{ width: `${(xp / xpMax) * 100}%` }}
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Stat Icon={Medal} label={t("card.medals")} value="245" />
            <Stat Icon={Target} label={t("progress.missions")} value="18/20" />
            <Stat Icon={Gift} label={t("progress.reward")} value="+500 XP" />
          </div>
        </div>
      </div>
    </HudPanel>
  );
}

function Stat({ Icon, label, value }: { Icon: typeof Medal; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-surface-2/50 p-2">
      <Icon className="mx-auto h-3.5 w-3.5 text-neon-gold" />
      <p className="mt-1 font-display text-xs">{value}</p>
      <p className="truncate text-[9px] tracking-wider text-muted-foreground uppercase">{label}</p>
    </div>
  );
}

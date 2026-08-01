import { FileText } from "lucide-react";

import { HudPanel } from "@/components/hud/hud-panel";
import { CONTRACTS } from "@/data/game";
import { useHud } from "@/lib/hud-state";
import { useI18n } from "@/lib/i18n";

export function ContractsPanel() {
  const { t } = useI18n();
  const { mode } = useHud();

  return (
    <HudPanel title={t("contracts.title")}>
      <p className="mb-2 text-[10px] tracking-widest text-muted-foreground uppercase">
        {t("checkout.mode")}: {mode === "pro" ? t("modes.pro") : t("modes.friendly")}
      </p>
      <ul className="space-y-2">
        {CONTRACTS.map((c) => (
          <li
            key={c.id}
            className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-surface-2/50 p-2.5"
          >
            <FileText className="h-4 w-4 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{c.card}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {c.objective} · {c.time}
              </p>
            </div>
            <span
              className={
                c.status === "running"
                  ? "rounded-sm border border-neon-green/60 px-1.5 py-0.5 text-[9px] tracking-wider text-neon-green uppercase"
                  : "rounded-sm border border-border px-1.5 py-0.5 text-[9px] tracking-wider text-muted-foreground uppercase"
              }
            >
              {c.status === "running" ? t("contracts.running") : t("contracts.done")}
            </span>
          </li>
        ))}
      </ul>
    </HudPanel>
  );
}

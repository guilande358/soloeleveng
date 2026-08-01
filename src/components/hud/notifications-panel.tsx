import { Bell } from "lucide-react";

import { HudPanel } from "@/components/hud/hud-panel";
import { NOTIFICATIONS } from "@/data/game";
import { useI18n } from "@/lib/i18n";

export function NotificationsPanel({ limit }: { limit?: number }) {
  const { t, lang } = useI18n();
  const items = limit ? NOTIFICATIONS.slice(0, limit) : NOTIFICATIONS;

  return (
    <HudPanel title={t("notif.title")} glow="var(--neon-cyan)">
      <ul className="space-y-2">
        {items.map((n) => (
          <li
            key={n.id}
            className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-surface-2/50 p-2.5"
          >
            <span className="mt-0.5 rounded-md bg-primary/25 p-1.5">
              <Bell className="h-3.5 w-3.5 text-neon-cyan" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{lang === "pt" ? n.titlePt : n.titleEn}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {lang === "pt" ? n.bodyPt : n.bodyEn}
              </p>
            </div>
            <span className="text-[10px] text-muted-foreground">{n.time}</span>
          </li>
        ))}
      </ul>
    </HudPanel>
  );
}

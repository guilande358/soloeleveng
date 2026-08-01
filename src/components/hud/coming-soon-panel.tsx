import { Coffee, MessagesSquare, Radio } from "lucide-react";

import { HudPanel } from "@/components/hud/hud-panel";
import { useI18n } from "@/lib/i18n";

export function ComingSoonPanel() {
  const { t } = useI18n();
  const items = [
    { Icon: Radio, label: t("soon.lives") },
    { Icon: MessagesSquare, label: t("soon.chat") },
    { Icon: Coffee, label: t("soon.coffee") },
  ];

  return (
    <HudPanel title={t("soon.title")} glow="var(--neon-pink)">
      <ul className="grid gap-2 sm:grid-cols-3">
        {items.map(({ Icon, label }) => (
          <li
            key={label}
            className="flex items-center gap-2 rounded-lg border border-dashed border-border/80 bg-surface-2/40 p-3"
          >
            <Icon className="h-4 w-4 text-neon-pink" />
            <span className="text-xs text-muted-foreground">{label}</span>
          </li>
        ))}
      </ul>
    </HudPanel>
  );
}

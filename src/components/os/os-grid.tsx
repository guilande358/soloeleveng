import { useState } from "react";

import { PanelOverlay } from "@/components/os/panel-overlay";
import { PanelShell } from "@/components/os/panel-shell";
import { PANELS, pick } from "@/components/os/panels";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Smart grid: every module is a button; opening one expands it full screen. */
export function OsGrid() {
  const { lang } = useI18n();
  const [openId, setOpenId] = useState<string | null>(null);
  const active = PANELS.find((p) => p.id === openId);

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[minmax(11rem,auto)]">
        {PANELS.map((p) => (
          <PanelShell
            key={p.id}
            title={pick(p.title, lang)}
            hint={lang === "pt" ? "abrir" : "open"}
            glow={p.glow}
            Icon={p.Icon}
            className={cn(p.span)}
            onOpen={() => setOpenId(p.id)}
          >
            <p.Widget />
          </PanelShell>
        ))}
      </div>

      <PanelOverlay
        open={active !== undefined}
        title={active ? pick(active.title, lang) : ""}
        glow={active?.glow ?? "var(--neon)"}
        onClose={() => setOpenId(null)}
      >
        {active ? <active.Full /> : null}
      </PanelOverlay>
    </>
  );
}

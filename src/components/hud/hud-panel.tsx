import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function HudPanel({
  title,
  action,
  glow,
  className,
  children,
}: {
  title?: string;
  action?: ReactNode;
  glow?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn("hud-panel overflow-hidden p-4", className)}
      style={glow ? ({ "--glow": glow } as React.CSSProperties) : undefined}
    >
      <span className="hud-frame opacity-70" aria-hidden />
      {(title || action) && (
        <header className="relative mb-3 flex items-center justify-between gap-2">
          {title && (
            <h2 className="font-display text-xs tracking-[0.2em] text-muted-foreground uppercase">
              {title}
            </h2>
          )}
          {action}
        </header>
      )}
      <div className="relative">{children}</div>
    </section>
  );
}

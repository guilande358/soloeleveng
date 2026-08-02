import type { ReactNode } from "react";

import { glowStyle } from "@/lib/style";
import { cn } from "@/lib/utils";

export function Chip({ children, glow }: { children: ReactNode; glow?: string }) {
  return (
    <span
      style={glow ? glowStyle(glow) : undefined}
      className="rounded-sm border border-border/70 bg-surface-2/70 px-1.5 py-0.5 font-display text-[9px] tracking-[0.14em] text-foreground/90 uppercase"
    >
      {children}
    </span>
  );
}

export function Meter({ value, max, glow = "var(--neon)" }: { value: number; max: number; glow?: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.min(100, (value / max) * 100)}%`,
          background: `linear-gradient(90deg, ${glow}, var(--neon-cyan))`,
          boxShadow: `0 0 12px ${glow}`,
        }}
      />
    </div>
  );
}

export function Avatar({ name, glow = "var(--neon)", size = "sm" }: { name: string; glow?: string | undefined; size?: "sm" | "lg" }) {
  return (
    <span
      style={{ boxShadow: `0 0 14px -2px ${glow}`, borderColor: glow }}
      className={cn(
        "grid shrink-0 place-items-center rounded-full border bg-surface-2 font-display",
        size === "lg" ? "h-14 w-14 text-base" : "h-8 w-8 text-[11px]",
      )}
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}

export function Row({
  label,
  value,
  glow,
}: {
  label: ReactNode;
  value: ReactNode;
  glow?: string | undefined;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/40 py-1.5 last:border-0">
      <span className="truncate text-[11px] text-muted-foreground">{label}</span>
      <span
        style={glow ? { color: glow } : undefined}
        className="shrink-0 font-display text-[11px] tracking-wide"
      >
        {value}
      </span>
    </div>
  );
}

export function StatTile({ label, value, glow = "var(--neon-cyan)" }: { label: string; value: string; glow?: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-surface-2/40 p-2 text-center">
      <p style={{ color: glow }} className="font-display text-sm">
        {value}
      </p>
      <p className="truncate text-[9px] tracking-[0.14em] text-muted-foreground uppercase">{label}</p>
    </div>
  );
}

export function Sparkline({ data, glow = "var(--neon-cyan)" }: { data: number[]; glow?: string }) {
  return (
    <div className="flex h-12 items-end gap-1">
      {data.map((v, i) => (
        <span
          key={i}
          className="flex-1 rounded-t-sm"
          style={{ height: `${v}%`, background: `linear-gradient(180deg, ${glow}, transparent)` }}
        />
      ))}
    </div>
  );
}

export function ActionButton({
  children,
  onClick,
  variant = "primary",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-4 py-2 font-display text-[11px] tracking-[0.16em] uppercase transition-transform active:scale-95",
        variant === "primary"
          ? "bg-primary text-primary-foreground shadow-[0_0_22px_-6px_var(--neon)]"
          : "border border-border/70 text-foreground",
      )}
    >
      {children}
    </button>
  );
}

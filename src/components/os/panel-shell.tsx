import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { ReactNode } from "react";

import { glowStyle } from "@/lib/style";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  hint?: string;
  glow?: string;
  Icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  onOpen: () => void;
  children: ReactNode;
};

/** Living module: hover 3D tilt, neon border, particles. The panel itself is the button. */
export function PanelShell({
  title,
  hint,
  glow = "var(--neon)",
  Icon,
  className,
  onOpen,
  children,
}: Props) {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-6, 6]), {
    stiffness: 220,
    damping: 22,
  });
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [5, -5]), {
    stiffness: 220,
    damping: 22,
  });

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={title}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width - 0.5);
        py.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        px.set(0);
        py.set(0);
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      style={{ ...glowStyle(glow), rotateX, rotateY, transformPerspective: 1200 }}
      className={cn(
        "os-panel group relative isolate cursor-pointer overflow-hidden p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <span className="os-sheen" aria-hidden />
      <span className="os-particles" aria-hidden />
      <span
        className="hud-frame opacity-0 transition-opacity duration-300 group-hover:opacity-90"
        aria-hidden
      />

      <header className="relative mb-2.5 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {Icon && (
            <Icon className="h-3.5 w-3.5 shrink-0 text-foreground/80 drop-shadow-[0_0_8px_var(--glow)]" />
          )}
          <h2 className="truncate font-display text-[11px] tracking-[0.2em] uppercase">{title}</h2>
        </div>
        {hint && (
          <span className="shrink-0 text-[9px] tracking-[0.18em] text-muted-foreground uppercase opacity-0 transition-opacity group-hover:opacity-100">
            {hint}
          </span>
        )}
      </header>

      <div className="relative">{children}</div>
    </motion.div>
  );
}

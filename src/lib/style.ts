import type { CSSProperties } from "react";
import type { MotionStyle } from "motion/react";

/** CSS custom property helper that satisfies both React and Motion style types. */
export function glowStyle(value: string): CSSProperties & MotionStyle {
  return { "--glow": value } as unknown as CSSProperties & MotionStyle;
}

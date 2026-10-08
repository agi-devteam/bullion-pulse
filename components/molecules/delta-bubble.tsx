"use client";

import {
  DELTA_TONE_BG_CLASS,
  type DeltaTone,
} from "@/lib/motion/delta-sentiment";
import { cn } from "@/lib/utils";

export type DeltaBubblePlacement = "above" | "below" | "inline";

export interface DeltaBubbleProps {
  label: string;
  tone: DeltaTone;
  placement?: DeltaBubblePlacement;
  exiting?: boolean;
  className?: string;
}

export function DeltaBubble({
  label,
  tone,
  placement = "below",
  exiting = false,
  className,
}: DeltaBubbleProps) {
  if (tone === "neutral") {
    return null;
  }

  return (
    <span
      className={cn(
        "pointer-events-none z-10 rounded-md px-2.5 font-mono font-semibold leading-none whitespace-nowrap shadow-sm",
        DELTA_TONE_BG_CLASS[tone],
        placement === "inline"
          ? cn(
              "relative py-0.5 text-[1rem]",
              exiting ? "delta-bubble-inline-out" : "delta-bubble-inline",
            )
          : cn(
              "absolute text-[0.75rem]",
              placement === "above"
                ? exiting
                  ? "delta-bubble-above-out left-0 top-0 py-0.5"
                  : "delta-bubble-above left-0 top-0 py-0.5"
                : exiting
                  ? "delta-bubble-below-out left-0 top-full py-1"
                  : "delta-bubble-below left-0 top-full py-1",
            ),
        className,
      )}
      aria-hidden="true"
    >
      {label}
    </span>
  );
}

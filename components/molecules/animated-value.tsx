"use client";

import { useEffect } from "react";
import {
  DeltaBubble,
  type DeltaBubblePlacement,
} from "@/components/molecules/delta-bubble";
import {
  DELTA_TONE_TEXT_CLASS,
  toneForDelta,
  type DeltaSentiment,
} from "@/lib/motion/delta-sentiment";
import { useAnimatedNumber } from "@/lib/motion/use-animated-number";
import { useBubblePresence } from "@/lib/motion/use-bubble-presence";
import { formatNumber } from "@/lib/format/money";
import { cn } from "@/lib/utils";

export interface AnimatedValueProps {
  value: number | null;
  sentiment?: DeltaSentiment;
  format?: (value: number) => string;
  emptyLabel?: string;
  showBubble?: boolean;
  bubblePlacement?: DeltaBubblePlacement;
  formatDelta?: (delta: number) => string;
  onDeltaChange?: (delta: number) => void;
  className?: string;
  bubbleClassName?: string;
}

function defaultFormatDelta(delta: number): string {
  const sign = delta > 0 ? "+" : "";
  return `${sign}${formatNumber(delta)}`;
}

export function AnimatedValue({
  value,
  sentiment = "good-up",
  format = formatNumber,
  emptyLabel = "—",
  showBubble = true,
  bubblePlacement = "below",
  formatDelta = defaultFormatDelta,
  onDeltaChange,
  className,
  bubbleClassName,
}: AnimatedValueProps) {
  const { display, delta, flashing } = useAnimatedNumber(value);
  const tone = toneForDelta(delta, sentiment);
  const active = showBubble && delta !== 0 && tone !== "neutral";
  const bubble = useBubblePresence(
    active,
    active ? formatDelta(delta) : "",
    active ? tone : "neutral",
  );

  useEffect(() => {
    onDeltaChange?.(delta);
  }, [delta, onDeltaChange]);

  return (
    <span className={cn("relative inline-flex items-baseline", className)}>
      {bubble ? (
        <DeltaBubble
          label={bubble.label}
          tone={bubble.tone}
          placement={bubblePlacement}
          exiting={bubble.exiting}
          className={bubbleClassName}
        />
      ) : null}
      <span
        className={cn(
          "transition-colors duration-500",
          flashing && tone !== "neutral" ? DELTA_TONE_TEXT_CLASS[tone] : null,
        )}
      >
        {display == null || !Number.isFinite(display)
          ? emptyLabel
          : format(display)}
      </span>
    </span>
  );
}

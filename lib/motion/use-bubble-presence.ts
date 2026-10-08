"use client";

import { useEffect, useRef, useState } from "react";
import type { DeltaTone } from "@/lib/motion/delta-sentiment";

export const BUBBLE_EXIT_MS = 350;

export interface BubblePresence {
  label: string;
  tone: DeltaTone;
  exiting: boolean;
}

export function useBubblePresence(
  active: boolean,
  label: string,
  tone: DeltaTone,
): BubblePresence | null {
  const [bubble, setBubble] = useState<BubblePresence | null>(null);
  const bubbleRef = useRef(bubble);
  bubbleRef.current = bubble;

  useEffect(() => {
    if (active && tone !== "neutral") {
      setBubble({ label, tone, exiting: false });
      return;
    }

    const current = bubbleRef.current;
    if (!current || current.exiting) {
      return;
    }

    setBubble({ ...current, exiting: true });
    const timer = window.setTimeout(() => {
      setBubble(null);
    }, BUBBLE_EXIT_MS);

    return () => window.clearTimeout(timer);
  }, [active, label, tone]);

  return bubble;
}

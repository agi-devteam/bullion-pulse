"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/motion/prefers-reduced-motion";

const DEFAULT_DURATION_MS = 850;
const BUBBLE_MS = 3_000;

export interface AnimatedNumberState {
  display: number | null;
  delta: number;
  flashing: boolean;
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function useAnimatedNumber(
  target: number | null,
  options?: { durationMs?: number; bubbleMs?: number; instant?: boolean },
): AnimatedNumberState {
  const durationMs = options?.durationMs ?? DEFAULT_DURATION_MS;
  const bubbleMs = options?.bubbleMs ?? BUBBLE_MS;
  const instant = options?.instant ?? false;
  const reducedMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState<number | null>(target);
  const [delta, setDelta] = useState(0);
  const [flashing, setFlashing] = useState(false);
  const previousTarget = useRef<number | null>(target);
  const displayRef = useRef<number | null>(target);
  const hasMounted = useRef(false);

  useEffect(() => {
    displayRef.current = display;
  }, [display]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      previousTarget.current = target;
      displayRef.current = target;
      setDisplay(target);
      return;
    }

    if (instant) {
      previousTarget.current = target;
      displayRef.current = target;
      setDisplay(target);
      setDelta(0);
      setFlashing(false);
      return;
    }

    if (target == null || !Number.isFinite(target)) {
      previousTarget.current = null;
      displayRef.current = null;
      setDisplay(null);
      setDelta(0);
      setFlashing(false);
      return;
    }

    const priorTarget = previousTarget.current;
    previousTarget.current = target;

    if (priorTarget == null || !Number.isFinite(priorTarget)) {
      displayRef.current = target;
      setDisplay(target);
      setDelta(0);
      setFlashing(false);
      return;
    }

    const change = target - priorTarget;
    if (change === 0) {
      displayRef.current = target;
      setDisplay(target);
      return;
    }

    const startValue =
      displayRef.current != null && Number.isFinite(displayRef.current)
        ? displayRef.current
        : priorTarget;

    setDelta(change);
    setFlashing(true);

    if (reducedMotion) {
      displayRef.current = target;
      setDisplay(target);
      const flashTimer = window.setTimeout(() => setFlashing(false), 400);
      const bubbleTimer = window.setTimeout(() => setDelta(0), bubbleMs);
      return () => {
        window.clearTimeout(flashTimer);
        window.clearTimeout(bubbleTimer);
      };
    }

    let frame = 0;
    const startedAt = performance.now();
    const travel = target - startValue;

    function tick(now: number) {
      const progress = Math.min(1, (now - startedAt) / durationMs);
      const next = startValue + travel * easeOutCubic(progress);
      const resolved = progress >= 1 ? target : next;
      displayRef.current = resolved;
      setDisplay(resolved);
      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    }

    frame = window.requestAnimationFrame(tick);
    const flashTimer = window.setTimeout(
      () => setFlashing(false),
      Math.max(durationMs, 1_200),
    );
    const bubbleTimer = window.setTimeout(() => setDelta(0), bubbleMs);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(flashTimer);
      window.clearTimeout(bubbleTimer);
    };
  }, [target, durationMs, bubbleMs, reducedMotion, instant]);

  return { display, delta, flashing };
}

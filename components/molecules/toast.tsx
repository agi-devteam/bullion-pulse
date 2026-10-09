"use client";

import { useEffect, useRef, useState } from "react";
import type { ToastState, ToastTone } from "@/stores/use-ui-store";
import { usePrefersReducedMotion } from "@/lib/motion/prefers-reduced-motion";
import { cn } from "@/lib/utils";

export interface ToastProps {
  id?: number;
  message: string;
  tone?: ToastTone;
}

type Phase = "hidden" | "enter" | "shown" | "exit";

const HOLD_MS = 5000;
const ENTER_MS = 320;
const EXIT_MS = 280;

export function Toast({
  id = 0,
  message,
  tone = "default",
}: ToastProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [active, setActive] = useState<ToastState | null>(null);
  const [phase, setPhase] = useState<Phase>("hidden");
  const pendingRef = useRef<ToastState | null>(null);
  const phaseRef = useRef<Phase>("hidden");
  const activeIdRef = useRef(0);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  phaseRef.current = phase;
  activeIdRef.current = active?.id ?? 0;

  function clearTimers() {
    if (holdTimerRef.current != null) clearTimeout(holdTimerRef.current);
    if (exitTimerRef.current != null) clearTimeout(exitTimerRef.current);
    holdTimerRef.current = undefined;
    exitTimerRef.current = undefined;
  }

  function showNow(next: ToastState) {
    clearTimers();
    pendingRef.current = null;
    setActive(next);
    if (reducedMotion) {
      setPhase("shown");
      holdTimerRef.current = setTimeout(() => {
        setPhase("hidden");
        setActive(null);
      }, HOLD_MS);
      return;
    }
    setPhase("enter");
    holdTimerRef.current = setTimeout(() => {
      setPhase("shown");
      holdTimerRef.current = setTimeout(startExit, HOLD_MS);
    }, ENTER_MS);
  }

  function finishExit() {
    clearTimers();
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (pending?.message) {
      showNow(pending);
      return;
    }
    setActive(null);
    setPhase("hidden");
  }

  function startExit() {
    clearTimers();
    if (reducedMotion || phaseRef.current === "hidden") {
      finishExit();
      return;
    }
    setPhase("exit");
    exitTimerRef.current = setTimeout(finishExit, EXIT_MS);
  }

  useEffect(() => {
    if (!message || id === 0) {
      if (phaseRef.current === "hidden") return;
      pendingRef.current = null;
      startExit();
      return;
    }

    const next: ToastState = { id, message, tone };

    if (phaseRef.current === "hidden") {
      showNow(next);
      return;
    }

    if (activeIdRef.current === id) return;

    pendingRef.current = next;
    if (phaseRef.current !== "exit") {
      startExit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, message, tone, reducedMotion]);

  useEffect(() => () => clearTimers(), []);

  if (phase === "hidden" || !active?.message) {
    return null;
  }

  return (
    <div
      className="fixed bottom-6 left-1/2 z-100 max-w-[calc(100vw-32px)] -translate-x-1/2"
      aria-live="polite"
    >
      <div
        role="status"
        className={cn(
          "rounded-md px-5 py-3.5 text-[0.9375rem] shadow-[0_8px_24px_#0002]",
          active.tone === "error"
            ? "bg-hold-bg text-hold-t"
            : "bg-ink text-surface",
          !reducedMotion && phase === "enter" && "toast-slide-in",
          !reducedMotion && phase === "exit" && "toast-slide-out",
        )}
      >
        {active.message}
      </div>
    </div>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { BootScreen } from "@/components/templates/boot-screen";
import { fetchUserInfo } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/http";
import { getAuthToken } from "@/lib/auth/token";
import { handleUnauthorized } from "@/lib/auth/unauthorized";
import { queryKeys } from "@/lib/query/keys";
import { bootstrapAppData } from "@/lib/query/bootstrap";
import { usePrefersReducedMotion } from "@/lib/motion/prefers-reduced-motion";
import { useAuthStore } from "@/stores/use-auth-store";
import { useSettingsStore } from "@/stores/use-settings-store";

const BOOT_MIN_MS = 1600;
const BOOT_EXIT_MS = 480;

type BootPhase = "booting" | "exiting" | "done" | "error";

function waitForSettingsHydration(): Promise<void> {
  if (useSettingsStore.persist.hasHydrated()) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const unsub = useSettingsStore.persist.onFinishHydration(() => {
      unsub();
      resolve();
    });
  });
}

function sleep(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function BootGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  const queryClient = useQueryClient();
  const reducedMotion = usePrefersReducedMotion();
  const reducedMotionRef = useRef(reducedMotion);
  const [phase, setPhase] = useState<BootPhase>(isLogin ? "done" : "booting");
  const generationRef = useRef(0);

  reducedMotionRef.current = reducedMotion;

  const runBootstrap = useCallback(async () => {
    if (isLogin) {
      generationRef.current += 1;
      setPhase("done");
      return;
    }

    const generation = ++generationRef.current;
    setPhase("booting");
    const startedAt = Date.now();

    try {
      await waitForSettingsHydration();
      if (generation !== generationRef.current) return;

      if (!getAuthToken()) {
        handleUnauthorized();
        return;
      }

      const user = await fetchUserInfo();
      if (generation !== generationRef.current) return;
      useAuthStore.getState().setSession(user);
      queryClient.setQueryData(queryKeys.auth.user, user);

      const { theme, language } = useSettingsStore.getState();
      await bootstrapAppData(queryClient, { theme, language });
      if (generation !== generationRef.current) return;

      const minMs = reducedMotionRef.current ? 0 : BOOT_MIN_MS;
      await sleep(minMs - (Date.now() - startedAt));
      if (generation !== generationRef.current) return;

      setPhase("exiting");
    } catch (error) {
      if (generation !== generationRef.current) return;
      if (error instanceof ApiError && error.status === 401) {
        handleUnauthorized();
        return;
      }
      setPhase("error");
    }
  }, [isLogin, queryClient]);

  useEffect(() => {
    void runBootstrap();
  }, [runBootstrap]);

  useEffect(() => {
    if (phase !== "exiting") return;
    const exitMs = reducedMotionRef.current ? 0 : BOOT_EXIT_MS;
    const timer = window.setTimeout(() => setPhase("done"), exitMs);
    return () => window.clearTimeout(timer);
  }, [phase]);

  return (
    <>
      {children}
      {phase !== "done" ? (
        <BootScreen
          exiting={phase === "exiting"}
          reducedMotion={reducedMotion}
          error={phase === "error"}
          onRetry={() => void runBootstrap()}
        />
      ) : null}
    </>
  );
}

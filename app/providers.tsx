"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { createQueryClient } from "@/lib/query/client";
import { useSettingsStore } from "@/stores/use-settings-store";

function applyDocumentSettings() {
  const { theme, language } = useSettingsStore.getState();
  const resolved =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;

  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.lang = language;
}

function ThemeSync() {
  const theme = useSettingsStore((state) => state.theme);
  const language = useSettingsStore((state) => state.language);

  useEffect(() => {
    applyDocumentSettings();
    const unsub = useSettingsStore.persist.onFinishHydration(
      applyDocumentSettings,
    );
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", applyDocumentSettings);
    return () => {
      unsub();
      media.removeEventListener("change", applyDocumentSettings);
    };
  }, [theme, language]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeSync />
      {children}
    </QueryClientProvider>
  );
}

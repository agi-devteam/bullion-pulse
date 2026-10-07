"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Language, Segment, Theme } from "@/domain/primitives";
import type { PolicyDraft } from "@/domain/settings";

export interface SettingsState {
  theme: Theme;
  language: Language;
  segment: Segment;
  draft: PolicyDraft | null;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  setSegment: (segment: Segment) => void;
  setDraft: (draft: PolicyDraft | null) => void;
}

const defaultSettings: Pick<
  SettingsState,
  "theme" | "language" | "segment" | "draft"
> = {
  theme: "system",
  language: "id",
  segment: "all",
  draft: null,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setSegment: (segment) => set({ segment }),
      setDraft: (draft) => set({ draft }),
    }),
    {
      name: "bullion-pulse.settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (
        state,
      ): Pick<SettingsState, "theme" | "language"> => ({
        theme: state.theme,
        language: state.language,
      }),
    },
  ),
);

"use client";

import { create } from "zustand";
import type { ActionStatus } from "@/domain/actions";
import type { SettingsTab } from "@/domain/settings";
import type { DialogPayload } from "@/domain/ui";

export interface UIState {
  dialog: DialogPayload | null;
  setDialog: (dialog: DialogPayload | null) => void;
  actionStatuses: Record<string, ActionStatus>;
  setActionStatus: (id: string, status: ActionStatus) => void;
  toast: string;
  showToast: (message: string) => void;
  clearToast: () => void;
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
  settingsTab: SettingsTab;
  setSettingsTab: (tab: SettingsTab) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  dialog: null,
  setDialog: (dialog) => set({ dialog }),
  actionStatuses: {},
  setActionStatus: (id, status) =>
    set((state) => ({
      actionStatuses: { ...state.actionStatuses, [id]: status },
    })),
  toast: "",
  showToast: (message) => set({ toast: message }),
  clearToast: () => set({ toast: "" }),
  navOpen: false,
  setNavOpen: (open) => set({ navOpen: open }),
  settingsTab: "dashboard",
  setSettingsTab: (tab) => set({ settingsTab: tab }),
}));

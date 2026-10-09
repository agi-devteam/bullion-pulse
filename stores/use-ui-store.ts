"use client";

import { create } from "zustand";
import type { ActionStatus } from "@/domain/actions";
import type { SettingsTab } from "@/domain/settings";
import type { DialogPayload } from "@/domain/ui";

export type ToastTone = "default" | "error";

export interface ToastState {
  id: number;
  message: string;
  tone: ToastTone;
}

export interface UIState {
  dialog: DialogPayload | null;
  setDialog: (dialog: DialogPayload | null) => void;
  actionStatuses: Record<string, ActionStatus>;
  setActionStatus: (id: string, status: ActionStatus) => void;
  toast: ToastState;
  showToast: (message: string, tone?: ToastTone) => void;
  clearToast: () => void;
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
  settingsTab: SettingsTab;
  setSettingsTab: (tab: SettingsTab) => void;
}

const emptyToast: ToastState = { id: 0, message: "", tone: "default" };

export const useUIStore = create<UIState>()((set) => ({
  dialog: null,
  setDialog: (dialog) => set({ dialog }),
  actionStatuses: {},
  setActionStatus: (id, status) =>
    set((state) => ({
      actionStatuses: { ...state.actionStatuses, [id]: status },
    })),
  toast: emptyToast,
  showToast: (message, tone = "default") =>
    set({
      toast: {
        id: Date.now(),
        message,
        tone,
      },
    }),
  clearToast: () => set({ toast: emptyToast }),
  navOpen: false,
  setNavOpen: (open) => set({ navOpen: open }),
  settingsTab: "dashboard",
  setSettingsTab: (tab) => set({ settingsTab: tab }),
}));

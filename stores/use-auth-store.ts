"use client";

import { create } from "zustand";
import type { AuthStatus, UserInfo } from "@/domain/auth";

export interface AuthState {
  status: AuthStatus;
  user: UserInfo | null;
  permissions: string[];
  setSession: (user: UserInfo) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: "unknown",
  user: null,
  permissions: [],
  setSession: (user) =>
    set({
      status: "authenticated",
      user,
      permissions: user.permissions,
    }),
  clearSession: () =>
    set({
      status: "unauthenticated",
      user: null,
      permissions: [],
    }),
}));

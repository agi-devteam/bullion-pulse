"use client";

import type { ReactNode } from "react";
import type { Permission } from "@/domain/auth";
import { hasPermission } from "@/domain/auth";
import { useAuthStore } from "@/stores/use-auth-store";

export function usePermissions(): readonly string[] {
  return useAuthStore((state) => state.permissions);
}

export function usePermission(permission: Permission): boolean {
  const permissions = usePermissions();
  return hasPermission(permissions, permission);
}

export function Can({
  permission,
  children,
}: {
  permission: Permission;
  children: ReactNode;
}) {
  const allowed = usePermission(permission);
  if (!allowed) return null;
  return children;
}

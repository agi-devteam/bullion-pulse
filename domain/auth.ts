import type { SettingsTab } from "@/domain/settings";

export const PERMISSION = {
  VIEW_INVENTORY: "VIEW_INVENTORY",
  VIEW_SUPPLIER: "VIEW_SUPPLIER",
  VIEW_PRICELIST: "VIEW_PRICELIST",
  VIEW_MARGIN_POLICY: "VIEW_MARGIN_POLICY",
  UPDATE_MARGIN_POLICY: "UPDATE_MARGIN_POLICY",
  VIEW_ROUTE_POLICY: "VIEW_ROUTE_POLICY",
  UPDATE_ROUTE_POLICY: "UPDATE_ROUTE_POLICY",
  VIEW_SUPPLIER_POLICY: "VIEW_SUPPLIER_POLICY",
  UPDATE_SUPPLIER_POLICY: "UPDATE_SUPPLIER_POLICY",
  VIEW_SYSTEM_POLICY: "VIEW_SYSTEM_POLICY",
  UPDATE_SYSTEM_POLICY: "UPDATE_SYSTEM_POLICY",
} as const;

export type Permission = (typeof PERMISSION)[keyof typeof PERMISSION];

export interface UserInfo {
  id: number;
  name: string;
  image: string | null;
  permissions: string[];
}

export type AuthStatus = "unknown" | "authenticated" | "unauthenticated";

export const SETTINGS_TAB_VIEW = {
  margin: PERMISSION.VIEW_MARGIN_POLICY,
  route: PERMISSION.VIEW_ROUTE_POLICY,
  supplier: PERMISSION.VIEW_SUPPLIER_POLICY,
  system: PERMISSION.VIEW_SYSTEM_POLICY,
} as const satisfies Partial<Record<SettingsTab, Permission>>;

export const SETTINGS_TAB_UPDATE = {
  margin: PERMISSION.UPDATE_MARGIN_POLICY,
  route: PERMISSION.UPDATE_ROUTE_POLICY,
  supplier: PERMISSION.UPDATE_SUPPLIER_POLICY,
  system: PERMISSION.UPDATE_SYSTEM_POLICY,
} as const satisfies Partial<Record<SettingsTab, Permission>>;

export function hasPermission(
  permissions: readonly string[],
  required: Permission,
): boolean {
  return permissions.includes(required);
}

export function hasAnyPermission(
  permissions: readonly string[],
  required: readonly Permission[],
): boolean {
  return required.some((code) => hasPermission(permissions, code));
}

export function canViewSettingsTab(
  tab: SettingsTab,
  permissions: readonly string[],
): boolean {
  if (tab === "dashboard") return true;
  const required = SETTINGS_TAB_VIEW[tab as keyof typeof SETTINGS_TAB_VIEW];
  return required == null || hasPermission(permissions, required);
}

export function canUpdateSettingsTab(
  tab: SettingsTab,
  permissions: readonly string[],
): boolean {
  if (tab === "dashboard") return false;
  const required = SETTINGS_TAB_UPDATE[tab as keyof typeof SETTINGS_TAB_UPDATE];
  return required != null && hasPermission(permissions, required);
}

import { PERMISSION, type Permission, hasPermission } from "@/domain/auth";

export const NAV_ITEMS = {
  home: { href: "/" },
  inventory: { href: "/inventory" },
  pricing: { href: "/pricing" },
  suppliers: { href: "/suppliers" },
  actions: { href: "/actions" },
  settings: { href: "/settings" },
} as const;

export type NavItemId = keyof typeof NAV_ITEMS;

export const NAV_PERMISSIONS: Partial<Record<NavItemId, Permission>> = {
  inventory: PERMISSION.VIEW_INVENTORY,
  pricing: PERMISSION.VIEW_PRICELIST,
  suppliers: PERMISSION.VIEW_SUPPLIER,
};

const NAV_FALLBACK_ORDER: readonly NavItemId[] = [
  "home",
  "inventory",
  "pricing",
  "suppliers",
  "actions",
  "settings",
];

export function canAccessNavItem(
  id: NavItemId,
  permissions: readonly string[],
): boolean {
  const required = NAV_PERMISSIONS[id];
  if (!required) return true;
  return hasPermission(permissions, required);
}

export function firstAccessibleNavHref(permissions: readonly string[]): string {
  for (const id of NAV_FALLBACK_ORDER) {
    if (canAccessNavItem(id, permissions)) {
      return NAV_ITEMS[id].href;
    }
  }
  return NAV_ITEMS.home.href;
}

export const NAV_GROUPS = [
  { id: "main", titleKey: "main", items: ["home"] },
  {
    id: "operations",
    titleKey: "operations",
    items: ["inventory", "pricing", "suppliers"],
  },
  { id: "system", titleKey: "system", items: ["settings"] },
] as const satisfies {
  id: string;
  titleKey: "main" | "operations" | "system";
  items: readonly NavItemId[];
}[];

export function visibleNavGroups(permissions: readonly string[]) {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((id) => canAccessNavItem(id, permissions)),
  })).filter((group) => group.items.length > 0);
}

export function isNavItemActive(href: string, pathname: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function navItemIdFromPathname(pathname: string): NavItemId {
  if (pathname === "/") {
    return "home";
  }

  for (const [id, item] of Object.entries(NAV_ITEMS) as [
    NavItemId,
    (typeof NAV_ITEMS)[NavItemId],
  ][]) {
    if (item.href !== "/" && isNavItemActive(item.href, pathname)) {
      return id;
    }
  }

  return "home";
}

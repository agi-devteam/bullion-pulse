export const NAV_ITEMS = {
  home: { href: "/", label: "Bullion Pulse" },
  inventory: { href: "/inventory", label: "Inventory" },
  pricing: { href: "/pricing", label: "Pricing" },
  suppliers: { href: "/suppliers", label: "Suppliers" },
  actions: { href: "/actions", label: "Actions & Alerts" },
  settings: { href: "/settings", label: "Settings" },
} as const;

export type NavItemId = keyof typeof NAV_ITEMS;

export const NAV_GROUPS = [
  { id: "main", title: "Main", items: ["home"] },
  {
    id: "operations",
    title: "Operations",
    items: ["inventory", "pricing", "suppliers", "actions"],
  },
  { id: "system", title: "System", items: ["settings"] },
] as const satisfies {
  id: string;
  title: string;
  items: readonly NavItemId[];
}[];

export function isNavItemActive(href: string, pathname: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function titleFromPathname(pathname: string): string {
  if (pathname === "/") {
    return NAV_ITEMS.home.label;
  }

  for (const item of Object.values(NAV_ITEMS)) {
    if (item.href !== "/" && isNavItemActive(item.href, pathname)) {
      return item.label;
    }
  }

  return NAV_ITEMS.home.label;
}

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import {
  canAccessNavItem,
  firstAccessibleNavHref,
  navItemIdFromPathname,
} from "@/domain/navigation";
import { useAuthStore } from "@/stores/use-auth-store";

export function RoutePermissionGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const permissions = useAuthStore((state) => state.permissions);

  useEffect(() => {
    if (status !== "authenticated") return;
    const item = navItemIdFromPathname(pathname);
    if (canAccessNavItem(item, permissions)) return;
    router.replace(firstAccessibleNavHref(permissions));
  }, [status, permissions, pathname, router]);

  return children;
}

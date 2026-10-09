import type { ReactNode } from "react";
import { AppShell } from "@/components/templates/app-shell";
import { RoutePermissionGate } from "@/components/templates/route-permission-gate";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <RoutePermissionGate>
      <AppShell>{children}</AppShell>
    </RoutePermissionGate>
  );
}

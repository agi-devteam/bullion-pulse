"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { Status } from "@/components/atoms/status";
import { NoticeBanner } from "@/components/molecules/notice-banner";
import { WorkspaceStack } from "@/components/molecules/page-toolbar";
import { DataTable } from "@/components/organisms/data-table";
import { getActionAlerts } from "@/lib/mocks/workspace";
import { useUIStore } from "@/stores/use-ui-store";

export function ActionsWorkspace() {
  const showToast = useUIStore((state) => state.showToast);
  const alerts = getActionAlerts();
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  return (
    <WorkspaceStack>
      <NoticeBanner>
        V1 actions: WATCH, REPRICE, HOLD / WAIT, dan data exceptions. Tidak ada
        instruksi LOCK tanpa demand.
      </NoticeBanner>
      <DataTable
        headers={[
          "Severity",
          "Action",
          "Channel / Gram",
          "Quantity",
          "Reason",
          "Owner",
          "Review",
        ]}
        rows={alerts.map((alert) => [
          <Status
            key="severity"
            tone={alert.severity === "attention" ? "route" : "hold"}
          >
            {alert.severity}
          </Status>,
          <Status
            key="action"
            tone={alert.action === "WATCH" ? "route" : "hold"}
          >
            {alert.action}
          </Status>,
          alert.channel
            ? `${alert.channel}${alert.gram ? ` · ${alert.gram}g` : ""}`
            : "—",
          `${alert.quantity} pcs`,
          <span
            key="reason"
            className="block min-w-[230px] max-w-[440px] whitespace-normal"
          >
            {alert.reason}
          </span>,
          alert.owner,
          <div key="review" className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href={alert.href} />}
            >
              Review
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatuses((current) => ({
                  ...current,
                  [alert.id]: "REVIEWED",
                }));
                showToast("Action reviewed.");
              }}
            >
              {statuses[alert.id] === "REVIEWED"
                ? "Reviewed"
                : "Mark reviewed"}
            </Button>
          </div>,
        ])}
      />
    </WorkspaceStack>
  );
}

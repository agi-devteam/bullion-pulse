"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import { Status } from "@/components/atoms/status";
import { WorkspaceStack } from "@/components/molecules/page-toolbar";
import { DataTable } from "@/components/organisms/data-table";
import { getActionAlerts } from "@/lib/mocks/workspace";
import { useUIStore } from "@/stores/use-ui-store";

function actionLabel(
  action: string,
  tCommon: ReturnType<typeof useTranslations<"common">>,
) {
  if (action === "WATCH") return tCommon("actions.watch");
  if (action === "REPRICE") return tCommon("actions.reprice");
  if (action === "REVIEW DATA") return tCommon("actions.reviewData");
  return action;
}

export function ActionsWorkspace() {
  const t = useTranslations("actions");
  const tCommon = useTranslations("common");
  const showToast = useUIStore((state) => state.showToast);
  const alerts = getActionAlerts();
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  return (
    <WorkspaceStack>
      <DataTable
        headers={[
          t("headers.action"),
          t("headers.channelGram"),
          t("headers.quantity"),
          t("headers.reason"),
          t("headers.owner"),
          t("headers.status"),
          t("headers.review"),
        ]}
        rows={alerts.map((alert) => {
          const status = statuses[alert.id] ?? alert.status;

          return [
            <Status
              key="action"
              tone={alert.action === "WATCH" ? "route" : "hold"}
            >
              {actionLabel(alert.action, tCommon)}
            </Status>,
            alert.channel
              ? t("channelGram", {
                  channel: alert.channel,
                  gram: alert.gram ?? "",
                })
              : tCommon("emDash"),
            tCommon("pcs", { count: alert.quantity }),
            <span
              key="reason"
              className="block min-w-57.5 max-w-110 whitespace-normal"
            >
              {t(`reasons.${alert.reasonKey}`)}
            </span>,
            t(`owners.${alert.ownerKey}`),
            status === "REVIEWED"
              ? tCommon("actions.reviewed")
              : tCommon("actions.open"),
            <div key="review" className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href={alert.href} />}
              >
                {tCommon("review")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatuses((current) => ({
                    ...current,
                    [alert.id]: "REVIEWED",
                  }));
                  showToast(t("toastReviewed"));
                }}
              >
                {t("markReviewed")}
              </Button>
            </div>,
          ];
        })}
      />
    </WorkspaceStack>
  );
}

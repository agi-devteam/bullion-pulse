"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import { Status } from "@/components/atoms/status";
import { WorkspaceStack } from "@/components/molecules/page-toolbar";
import { DataTable } from "@/components/organisms/data-table";
import { ActionsWorkspaceSkeleton } from "@/components/screens/actions-workspace-skeleton";
import type { ActionStatus } from "@/domain/actions";
import { formatStamp } from "@/lib/format/datetime";
import { formatNumber } from "@/lib/format/money";
import { useActions } from "@/lib/query/hooks";
import { useUIStore } from "@/stores/use-ui-store";

function statusLabel(
  status: ActionStatus,
  tCommon: ReturnType<typeof useTranslations<"common">>,
) {
  if (status === "WATCHED") return tCommon("actions.watched");
  return tCommon("actions.open");
}

function severityTone(severity: "attention" | "risk") {
  return severity === "risk" ? ("hold" as const) : ("route" as const);
}

export function ActionsWorkspace() {
  const t = useTranslations("actions");
  const tCommon = useTranslations("common");
  const setDialog = useUIStore((state) => state.setDialog);
  const actionStatuses = useUIStore((state) => state.actionStatuses);
  const actionsQuery = useActions();

  if (actionsQuery.isPending) {
    return <ActionsWorkspaceSkeleton />;
  }

  const alerts = actionsQuery.data ?? [];

  return (
    <WorkspaceStack>
      <DataTable
        headers={[
          t("headers.severity"),
          t("headers.action"),
          t("headers.channelGram"),
          t("headers.quantity"),
          t("headers.reason"),
          t("headers.createdAt"),
          t("headers.status"),
          t("headers.evidence"),
        ]}
        rows={alerts.map((alert) => {
          const status = actionStatuses[alert.id] ?? alert.status;
          const watched = status === "WATCHED";

          return [
            <Status key="severity" tone={severityTone(alert.severity)}>
              {t(`severity.${alert.severity}`)}
            </Status>,
            tCommon("actions.watch"),
            t("channelGram", {
              channel: alert.channel,
              gram: alert.gram,
            }),
            tCommon("pcs", { count: formatNumber(alert.quantity) }),
            <span
              key="reason"
              className="block min-w-57.5 max-w-110 whitespace-normal"
            >
              {t(`reasons.${alert.reasonKey}`)}
            </span>,
            formatStamp(alert.createdAt),
            <Status key="status" tone={watched ? "route" : ""}>
              {statusLabel(status, tCommon)}
            </Status>,
            watched ? null : (
              <Button
                key="evidence"
                variant="outline"
                size="sm"
                onClick={() =>
                  setDialog({ kind: "action-alert", alertId: alert.id })
                }
              >
                {tCommon("actions.watch")}
              </Button>
            ),
          ];
        })}
      />
    </WorkspaceStack>
  );
}

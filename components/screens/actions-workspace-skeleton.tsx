"use client";

import { useTranslations } from "next-intl";
import { WorkspaceStack } from "@/components/molecules/page-toolbar";
import { DataTableSkeleton } from "@/components/organisms/data-table-skeleton";

export function ActionsWorkspaceSkeleton() {
  const t = useTranslations("actions");

  return (
    <WorkspaceStack>
      <div aria-busy="true" aria-live="polite">
        <DataTableSkeleton
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
          rowCount={8}
        />
      </div>
    </WorkspaceStack>
  );
}

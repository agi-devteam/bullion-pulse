"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/atoms/skeleton";
import { ChoiceSkeleton } from "@/components/molecules/choice-skeleton";
import {
  PageToolbar,
  WorkspaceStack,
} from "@/components/molecules/page-toolbar";
import { DataTableSkeleton } from "@/components/organisms/data-table-skeleton";

export function SuppliersWorkspaceSkeleton() {
  const t = useTranslations("suppliers");

  return (
    <WorkspaceStack>
      <div aria-busy="true" aria-live="polite">
        <PageToolbar>
          <div className="min-w-40">
            <ChoiceSkeleton />
          </div>
          <Skeleton className="h-11 w-40 rounded-[999px]" />
        </PageToolbar>
      </div>
      <DataTableSkeleton
        headers={[
          t("headers.supplier"),
          t("headers.active"),
          t("headers.gram"),
          t("headers.quoteUnit"),
          t("headers.capacity"),
          t("headers.leadTime"),
          t("headers.quoteTime"),
          t("headers.validUntil"),
          t("headers.lockStatus"),
        ]}
        rowCount={10}
      />
    </WorkspaceStack>
  );
}

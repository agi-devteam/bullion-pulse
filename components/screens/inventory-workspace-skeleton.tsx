"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/atoms/skeleton";
import { ChoiceSkeleton } from "@/components/molecules/choice-skeleton";
import { MetricSkeleton } from "@/components/molecules/metric-skeleton";
import { PageToolbar, WorkspaceStack } from "@/components/molecules/page-toolbar";
import { DataTableSkeleton } from "@/components/organisms/data-table-skeleton";

export function InventoryWorkspaceSkeleton() {
  const t = useTranslations("inventory");

  return (
    <WorkspaceStack>
      <div
        className="grid grid-cols-3 gap-3.5 max-[1100px]:grid-cols-2 max-[700px]:gap-2.5"
        aria-busy="true"
        aria-live="polite"
      >
        <MetricSkeleton />
        <MetricSkeleton />
        <MetricSkeleton />
      </div>
      <PageToolbar>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3.5">
          <div className="min-w-40">
            <ChoiceSkeleton />
          </div>
          <div className="min-w-64">
            <ChoiceSkeleton />
          </div>
          <div className="min-w-52">
            <ChoiceSkeleton />
          </div>
          <Skeleton className="min-h-12 min-w-50 flex-1 rounded-md" />
        </div>
      </PageToolbar>
      <DataTableSkeleton
        headers={[
          t("headers.serialStockId"),
          t("headers.gram"),
          t("headers.channel"),
          t("headers.availability"),
          t("headers.unitCost"),
          t("headers.sellingPrice"),
          t("headers.gpMargin"),
          t("headers.decision"),
          t("headers.evidence"),
        ]}
        rowCount={10}
      />
      <PageToolbar>
        <Skeleton className="h-4 w-48" />
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-11 w-24 rounded-[999px]" />
          <Skeleton className="h-11 w-20 rounded-[999px]" />
        </div>
      </PageToolbar>
      <span className="sr-only">{t("loading")}</span>
    </WorkspaceStack>
  );
}

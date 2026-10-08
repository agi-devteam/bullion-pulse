"use client";

import { useTranslations } from "next-intl";
import { ChoiceSkeleton } from "@/components/molecules/choice-skeleton";
import { NoticeBanner } from "@/components/molecules/notice-banner";
import { PageToolbar, WorkspaceStack } from "@/components/molecules/page-toolbar";
import { DataTableSkeleton } from "@/components/organisms/data-table-skeleton";

export function PricingWorkspaceSkeleton() {
  const t = useTranslations("pricing");

  return (
    <WorkspaceStack>
      <div aria-busy="true" aria-live="polite">
        <NoticeBanner>{t("notice")}</NoticeBanner>
      </div>
      <PageToolbar>
        <div className="flex flex-wrap gap-3.5">
          <div className="min-w-40">
            <ChoiceSkeleton />
          </div>
          <div className="min-w-40">
            <ChoiceSkeleton />
          </div>
        </div>
      </PageToolbar>
      <DataTableSkeleton
        headers={[
          t("headers.channel"),
          t("headers.gram"),
          t("headers.pricelist"),
          t("headers.antam"),
          t("headers.gapVsAntam"),
          t("headers.supplierUnit"),
          t("headers.minProfitable"),
          t("headers.targetMarginPrice"),
          t("headers.policy"),
          t("headers.recommendation"),
        ]}
        rowCount={10}
      />
    </WorkspaceStack>
  );
}

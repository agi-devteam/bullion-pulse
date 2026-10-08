"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Status } from "@/components/atoms/status";
import { Choice } from "@/components/molecules/choice";
import { NoticeBanner } from "@/components/molecules/notice-banner";
import { PageToolbar, WorkspaceStack } from "@/components/molecules/page-toolbar";
import { DataTable } from "@/components/organisms/data-table";
import { GRAMS } from "@/domain/primitives";
import type { PricingFilters } from "@/domain/filters";
import { formatIdr, formatPercent } from "@/lib/format/money";
import { getPricingRows } from "@/lib/mocks/workspace";

function recommendationTone(value: string) {
  if (value === "OK") return "sell" as const;
  if (value === "Unavailable") return "" as const;
  return "hold" as const;
}

function translateRecommendation(
  value: string,
  t: ReturnType<typeof useTranslations<"pricing">>,
) {
  if (value === "OK") return t("recommendation.ok");
  if (value === "Unavailable") return t("recommendation.unavailable");
  if (value === "THIN / REPRICE") return t("recommendation.thinReprice");
  if (value === "REPRICE") return t("recommendation.reprice");
  return value;
}

export function PricingWorkspace() {
  const t = useTranslations("pricing");
  const tCommon = useTranslations("common");
  const allRows = getPricingRows();
  const [channel, setChannel] = useState<PricingFilters["channel"]>("all");
  const [gram, setGram] = useState<PricingFilters["gram"]>("all");

  const rows = useMemo(
    () =>
      allRows.filter((row) => {
        if (channel !== "all" && row.channel !== channel) return false;
        if (gram !== "all" && String(row.gram) !== gram) return false;
        return true;
      }),
    [allRows, channel, gram],
  );

  return (
    <WorkspaceStack>
      <NoticeBanner>{t("notice")}</NoticeBanner>
      <PageToolbar>
        <div className="flex flex-wrap gap-3.5">
          <div className="min-w-40">
            <Choice
              label={t("filters.channel")}
              value={channel}
              onChange={(value) => setChannel(value as PricingFilters["channel"])}
              options={[
                ["all", tCommon("channels.all")],
                ["B2C", tCommon("channels.b2c")],
                ["B2B", tCommon("channels.b2b")],
              ]}
            />
          </div>
          <div className="min-w-40">
            <Choice
              label={t("filters.gram")}
              value={gram}
              onChange={(value) => setGram(value as PricingFilters["gram"])}
              options={[
                ["all", t("filters.allGramasi")],
                ...GRAMS.map(
                  (item) =>
                    [String(item), tCommon("gramsUnit", { value: item })] as [
                      string,
                      string,
                    ],
                ),
              ]}
            />
          </div>
        </div>
      </PageToolbar>
      <DataTable
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
        rows={rows.map((row) => [
          row.channel,
          tCommon("gramsUnit", { value: row.gram }),
          formatIdr(row.pricelist),
          formatIdr(row.antam),
          row.gapVsAntam == null
            ? tCommon("emDash")
            : formatPercent(row.gapVsAntam),
          row.supplierLabel,
          formatIdr(row.minProfitable),
          formatIdr(row.targetMarginPrice),
          formatPercent(row.policy),
          <Status key="rec" tone={recommendationTone(row.recommendation)}>
            {translateRecommendation(row.recommendation, t)}
          </Status>,
        ])}
      />
    </WorkspaceStack>
  );
}

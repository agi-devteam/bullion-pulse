"use client";

import { useMemo, useState } from "react";
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

export function PricingWorkspace() {
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
      <NoticeBanner>
        Minimum profitable price dan target-margin price memakai biaya READY
        tertinggi per channel / gramasi. ANTAM official source: logammulia.com
        saja. XAU tidak menjadi operational pricing benchmark.
      </NoticeBanner>
      <PageToolbar>
        <div className="flex flex-wrap gap-3.5">
          <div className="min-w-[160px]">
            <Choice
              label="Channel pricing"
              value={channel}
              onChange={(value) => setChannel(value as PricingFilters["channel"])}
              options={[
                ["all", "All channels"],
                "B2C",
                "B2B",
              ]}
            />
          </div>
          <div className="min-w-[160px]">
            <Choice
              label="Gramasi pricing"
              value={gram}
              onChange={(value) => setGram(value as PricingFilters["gram"])}
              options={[
                ["all", "All gramasi"],
                ...GRAMS.map((item) => [String(item), `${item}g`] as [string, string]),
              ]}
            />
          </div>
        </div>
      </PageToolbar>
      <DataTable
        headers={[
          "Channel",
          "Gram",
          "Pricelist",
          "ANTAM · Mock",
          "Gap vs ANTAM",
          "Supplier / unit",
          "Min profitable",
          "Target-margin price",
          "Policy",
          "Recommendation",
        ]}
        rows={rows.map((row) => [
          row.channel,
          `${row.gram}g`,
          formatIdr(row.pricelist),
          formatIdr(row.antam),
          row.gapVsAntam == null ? "—" : formatPercent(row.gapVsAntam),
          row.supplierLabel,
          formatIdr(row.minProfitable),
          formatIdr(row.targetMarginPrice),
          formatPercent(row.policy),
          <Status key="rec" tone={recommendationTone(row.recommendation)}>
            {row.recommendation}
          </Status>,
        ])}
      />
    </WorkspaceStack>
  );
}

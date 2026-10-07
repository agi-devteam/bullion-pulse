"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import { Status } from "@/components/atoms/status";
import { Card } from "@/components/molecules/card";
import { NoticeBanner } from "@/components/molecules/notice-banner";
import { WorkspaceStack } from "@/components/molecules/page-toolbar";
import { DataTable } from "@/components/organisms/data-table";
import { formatStamp } from "@/lib/format/datetime";
import { formatIdr, formatNumber } from "@/lib/format/money";
import {
  SUPPLIER_DIRECTORY,
  getSupplierQuotes,
} from "@/lib/mocks/workspace";
import { useUIStore } from "@/stores/use-ui-store";

export function SuppliersWorkspace() {
  const t = useTranslations("suppliers");
  const tCommon = useTranslations("common");
  const quotes = getSupplierQuotes();
  const setSettingsTab = useUIStore((state) => state.setSettingsTab);

  return (
    <WorkspaceStack>
      <NoticeBanner>{t("notice")}</NoticeBanner>
      <DataTable
        headers={[
          t("headers.supplier"),
          t("headers.active"),
          t("headers.gram"),
          t("headers.quoteUnit"),
          t("headers.capacity"),
          t("headers.leadTime"),
          t("headers.quoteTime"),
          t("headers.lockStatus"),
        ]}
        rows={quotes.map((quote) => [
          quote.name,
          <Status key="active" tone={quote.active ? "sell" : ""}>
            {quote.active ? tCommon("active") : tCommon("inactive")}
          </Status>,
          tCommon("gramsUnit", { value: quote.gram }),
          formatIdr(quote.quote_price),
          tCommon("gramsUnit", { value: formatNumber(quote.capacity) }),
          t("leadHours", { hours: quote.lead_time }),
          formatStamp(quote.quote_time),
          t("lockPair", {
            available: quote.lock_available
              ? tCommon("yes")
              : tCommon("no"),
            status: quote.lock_status,
          }),
        ])}
      />
      <Card className="block p-6">
        <h2 className="mt-0 mb-4.5 text-[1.25rem] font-semibold">
          {t("directoryTitle")}
        </h2>
        <p className="m-0 mb-4 text-[0.9375rem] text-muted-text">
          {t("directoryNote", { names: SUPPLIER_DIRECTORY.join(" · ") })}
        </p>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/settings" />}
          onClick={() => setSettingsTab("supplier")}
        >
          {t("policyButton")}
        </Button>
      </Card>
    </WorkspaceStack>
  );
}

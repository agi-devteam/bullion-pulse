"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import { Status } from "@/components/atoms/status";
import { Card } from "@/components/molecules/card";
import { Choice } from "@/components/molecules/choice";
import {
  PageToolbar,
  WorkspaceStack,
} from "@/components/molecules/page-toolbar";
import { DataTable } from "@/components/organisms/data-table";
import { SuppliersWorkspaceSkeleton } from "@/components/screens/suppliers-workspace-skeleton";
import { formatStamp } from "@/lib/format/datetime";
import { formatIdr, formatNumber } from "@/lib/format/money";
import { useSuppliers } from "@/lib/query/hooks";
import { useUIStore } from "@/stores/use-ui-store";

export function SuppliersWorkspace() {
  const t = useTranslations("suppliers");
  const tCommon = useTranslations("common");
  const suppliersQuery = useSuppliers();
  const setSettingsTab = useUIStore((state) => state.setSettingsTab);
  const [supplier, setSupplier] = useState("all");
  const quotes = suppliersQuery.data ?? [];

  const supplierOptions = useMemo(() => {
    const names = [...new Set(quotes.map((quote) => quote.name))].sort();
    return [
      ["all", t("filters.allSuppliers")] as [string, string],
      ...names.map((name) => [name, name] as [string, string]),
    ];
  }, [quotes, t]);

  const rows = useMemo(() => {
    return quotes.filter(
      (quote) => supplier === "all" || quote.name === supplier,
    );
  }, [quotes, supplier]);

  if (suppliersQuery.isError && quotes.length === 0) {
    return (
      <Card className="block gap-0 p-6">
        <p className="m-0 mb-4 text-[0.95rem] text-muted-text">
          {t("loadFailed")}
        </p>
        <Button
          type="button"
          onClick={() => void suppliersQuery.refetch()}
          disabled={suppliersQuery.isFetching}
        >
          {suppliersQuery.isFetching ? t("loading") : tCommon("retry")}
        </Button>
      </Card>
    );
  }

  if (suppliersQuery.isPending) {
    return <SuppliersWorkspaceSkeleton />;
  }

  return (
    <WorkspaceStack>
      <PageToolbar>
        <div className="min-w-40">
          <Choice
            label={t("filters.supplier")}
            value={supplier}
            onChange={setSupplier}
            options={supplierOptions}
          />
        </div>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/settings" />}
          onClick={() => setSettingsTab("supplier")}
        >
          {t("policyButton")}
        </Button>
      </PageToolbar>
      <DataTable
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
        rows={rows.map((quote) => [
          quote.name,
          <Status key="active" tone={quote.active ? "sell" : ""}>
            {quote.active ? tCommon("active") : tCommon("inactive")}
          </Status>,
          tCommon("gramsUnit", { value: quote.gram }),
          formatIdr(quote.quotePrice),
          tCommon("gramsUnit", { value: formatNumber(quote.capacity) }),
          t("leadHours", { hours: quote.leadTime }),
          formatStamp(quote.quoteTime),
          formatStamp(quote.validUntil),
          t("lockPair", {
            available: quote.lockAvailable
              ? tCommon("yes")
              : tCommon("no"),
            status: quote.lockStatus,
          }),
        ])}
      />
    </WorkspaceStack>
  );
}

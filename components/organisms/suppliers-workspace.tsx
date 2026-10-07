"use client";

import Link from "next/link";
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
  const quotes = getSupplierQuotes();
  const setSettingsTab = useUIStore((state) => state.setSettingsTab);

  return (
    <WorkspaceStack>
      <NoticeBanner>
        Supplier quotes adalah mock. Quote tidak sama dengan confirmed lock; GMI
        internal price bukan supplier.
      </NoticeBanner>
      <DataTable
        headers={[
          "Supplier",
          "Active",
          "Gram",
          "Quote / unit",
          "Capacity",
          "Lead time",
          "Quote time",
          "Valid until",
          "Lock available / status",
        ]}
        rows={quotes.map((quote) => [
          quote.name,
          <Status key="active" tone={quote.active ? "sell" : ""}>
            {quote.active ? "ACTIVE" : "INACTIVE"}
          </Status>,
          `${quote.gram}g`,
          formatIdr(quote.quote_price),
          `${formatNumber(quote.capacity)}g`,
          `${quote.lead_time}h`,
          formatStamp(quote.quote_time),
          formatStamp(quote.valid_until),
          `${quote.lock_available ? "Yes" : "No"} / ${quote.lock_status}`,
        ])}
      />
      <Card className="block p-6">
        <h2 className="mt-0 mb-[18px] text-[1.25rem] font-semibold">
          Supplier directory
        </h2>
        <p className="m-0 mb-4 text-[0.9375rem] text-muted-text">
          {SUPPLIER_DIRECTORY.join(" · ")}. Hanya SIMA dan KRISNA memiliki sample
          quote pada snapshot ini.
        </p>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/settings" />}
          onClick={() => setSettingsTab("supplier")}
        >
          Supplier Policy
        </Button>
      </Card>
    </WorkspaceStack>
  );
}

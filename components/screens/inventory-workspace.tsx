"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Status } from "@/components/atoms/status";
import { Card } from "@/components/molecules/card";
import { Choice } from "@/components/molecules/choice";
import { Metric } from "@/components/molecules/metric";
import { PageToolbar, WorkspaceStack } from "@/components/molecules/page-toolbar";
import { DataTable } from "@/components/organisms/data-table";
import type { InventoryAvailabilityFilter } from "@/domain/filters";
import type { InventoryDecision } from "@/domain/primitives";
import { summarizeInventory } from "@/lib/api/inventories";
import { formatIdr, formatNumber, formatPercent } from "@/lib/format/money";
import { useInventoryRecords } from "@/lib/query/hooks";
import { useUIStore } from "@/stores/use-ui-store";

const PAGE_SIZE = 40;

function decisionTone(decision: InventoryDecision | null, valid: boolean) {
  if (!valid) return "" as const;
  if (decision === "SELL READY") return "sell" as const;
  if (decision === "ROUTE ELIGIBLE") return "route" as const;
  if (decision === "HOLD") return "hold" as const;
  return "" as const;
}

export function InventoryWorkspace() {
  const t = useTranslations("inventory");
  const tCommon = useTranslations("common");
  const setDialog = useUIStore((state) => state.setDialog);
  const inventoryQuery = useInventoryRecords();
  const records = inventoryQuery.data ?? [];
  const summary = useMemo(() => summarizeInventory(records), [records]);
  const [channel, setChannel] = useState<"all" | "B2C" | "B2B">("all");
  const [status, setStatus] = useState<InventoryAvailabilityFilter>("READY");
  const [decision, setDecision] = useState<"all" | InventoryDecision>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return records.filter((row) => {
      if (channel !== "all" && row.channel !== channel) return false;
      if (status === "READY" && !row.ready) return false;
      if (status === "EXCLUDED" && (row.ready || !row.valid)) return false;
      if (status === "INVALID" && row.valid) return false;
      if (decision !== "all" && row.decision !== decision) return false;
      if (
        needle &&
        !`${row.serial} ${row.stockId} ${row.gram}g`.toLowerCase().includes(needle)
      ) {
        return false;
      }
      return true;
    });
  }, [records, channel, status, decision, query]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const pageRows = rows.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  if (inventoryQuery.isError && records.length === 0) {
    return (
      <Card className="block gap-0 p-6">
        <p className="m-0 mb-4 text-[0.95rem] text-muted-text">
          {t("loadFailed")}
        </p>
        <Button
          type="button"
          onClick={() => void inventoryQuery.refetch()}
          disabled={inventoryQuery.isFetching}
        >
          {inventoryQuery.isFetching ? t("loading") : tCommon("retry")}
        </Button>
      </Card>
    );
  }

  if (inventoryQuery.isLoading && records.length === 0) {
    return (
      <Card className="block gap-0 p-6">
        <p className="m-0 text-[0.95rem] text-muted-text">{t("loading")}</p>
      </Card>
    );
  }

  return (
    <WorkspaceStack>
      <div className="grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-2 max-[700px]:gap-2.5">
        <Metric
          label={t("metrics.readyPriced")}
          value={`${formatNumber(summary.readyGrams)}g`}
          note={tCommon("pcs", { count: formatNumber(summary.readyPcs) })}
        />
        <Metric
          label={t("metrics.excluded")}
          value={tCommon("pcs", { count: formatNumber(summary.excludedPcs) })}
          note={t("metrics.excludedNote")}
        />
        <Metric
          label={t("metrics.invalid")}
          value={tCommon("pcs", { count: formatNumber(summary.invalidPcs) })}
          note={t("metrics.invalidNote")}
        />
        <Metric
          label={t("metrics.unpricedReady")}
          value={tCommon("pcs", { count: formatNumber(summary.unpricedPcs) })}
          note={t("metrics.unpricedNote")}
        />
      </div>
      <PageToolbar>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3.5">
          <div className="min-w-40">
            <Choice
              label={t("filters.channel")}
              value={channel}
              onChange={(value) => {
                setChannel(value as typeof channel);
                setPage(0);
              }}
              options={[
                ["all", tCommon("channels.all")],
                ["B2C", tCommon("channels.b2c")],
                ["B2B", tCommon("channels.b2b")],
              ]}
            />
          </div>
          <div className="min-w-56">
            <Choice
              label={t("filters.availability")}
              value={status}
              onChange={(value) => {
                setStatus(value as InventoryAvailabilityFilter);
                setPage(0);
              }}
              options={[
                ["READY", t("filters.availabilityReady")],
                ["ALL", t("filters.availabilityAll")],
                ["EXCLUDED", t("filters.availabilityExcluded")],
                ["INVALID", t("filters.availabilityInvalid")],
              ]}
            />
          </div>
          <div className="min-w-52">
            <Choice
              label={t("filters.decision")}
              value={decision}
              onChange={(value) => {
                setDecision(value as typeof decision);
                setPage(0);
              }}
              options={[
                ["all", t("filters.decisionAll")],
                ["SELL READY", tCommon("decisions.sellReady")],
                ["ROUTE ELIGIBLE", tCommon("decisions.routeEligible")],
                ["HOLD", tCommon("decisions.hold")],
              ]}
            />
          </div>
          <Input
            className="min-w-50 flex-1"
            placeholder={t("filters.searchPlaceholder")}
            aria-label={t("filters.searchAria")}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
          />
        </div>
      </PageToolbar>
      <DataTable
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
        rows={pageRows.map((row) => [
          <span key={`${row.stockId}-id`}>
            {row.serial}
            <br />
            <span className="text-[0.95rem] leading-normal text-muted-text">
              {row.stockId}
            </span>
          </span>,
          `${row.gram}g`,
          row.channel,
          <Status key="availability" tone={row.ready ? "sell" : ""}>
            {row.reserved
              ? tCommon("decisions.reserved")
              : row.availabilityStatus}
          </Status>,
          formatIdr(row.unitCost > 0 ? row.unitCost : null),
          row.ready ? formatIdr(row.sellingPrice) : tCommon("emDash"),
          row.ready && row.directGp != null && row.directMargin != null
            ? `${formatIdr(row.directGp)} / ${formatPercent(row.directMargin)}`
            : tCommon("emDash"),
          <Status key="decision" tone={decisionTone(row.decision, row.valid)}>
            {row.decision ??
              (row.valid
                ? tCommon("decisions.excludedUnpriced")
                : tCommon("decisions.invalid"))}
          </Status>,
          <Button
            key="detail"
            variant="outline"
            size="sm"
            onClick={() =>
              setDialog({
                kind: "inventory-unit",
                stockId: row.stockId,
                serial: row.serial,
              })
            }
          >
            {tCommon("detail")}
          </Button>,
        ])}
      />
      <PageToolbar>
        <span className="text-[0.95rem] leading-normal text-muted-text">
          {tCommon("recordsPage", {
            count: formatNumber(rows.length),
            page: current + 1,
            pages,
          })}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
          >
            {tCommon("previous")}
          </Button>
          <Button
            variant="outline"
            disabled={current + 1 >= pages}
            onClick={() => setPage(current + 1)}
          >
            {tCommon("next")}
          </Button>
        </div>
      </PageToolbar>
    </WorkspaceStack>
  );
}

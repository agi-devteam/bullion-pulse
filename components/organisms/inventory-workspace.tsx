"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Status } from "@/components/atoms/status";
import { Choice } from "@/components/molecules/choice";
import { Metric } from "@/components/molecules/metric";
import { PageToolbar, WorkspaceStack } from "@/components/molecules/page-toolbar";
import { DataTable } from "@/components/organisms/data-table";
import type { InventoryAvailabilityFilter } from "@/domain/filters";
import type { InventoryDecision } from "@/domain/primitives";
import { formatIdr, formatNumber, formatPercent } from "@/lib/format/money";
import {
  getInventoryRecords,
  getInventorySummary,
} from "@/lib/mocks/workspace";
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
  const setDialog = useUIStore((state) => state.setDialog);
  const summary = getInventorySummary();
  const records = getInventoryRecords();
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
        !`${row.serial} ${row.stock_id} ${row.gram}g`.toLowerCase().includes(needle)
      ) {
        return false;
      }
      return true;
    });
  }, [records, channel, status, decision, query]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const pageRows = rows.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  return (
    <WorkspaceStack>
      <div className="grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1">
        <Metric
          label="READY / priced"
          value={`${formatNumber(summary.readyGrams)}g`}
          note={`${formatNumber(summary.readyPcs)} pcs`}
        />
        <Metric
          label="Excluded"
          value={`${formatNumber(summary.excludedPcs)} pcs`}
          note="Reserved, incoming, sold dan non-ready"
        />
        <Metric
          label="Invalid"
          value={`${formatNumber(summary.invalidPcs)} pcs`}
          note="Tidak masuk decision pool"
        />
        <Metric
          label="Unpriced READY"
          value={`${formatNumber(summary.unpricedPcs)} pcs`}
          note="Source harus valid"
        />
      </div>
      <PageToolbar>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3.5">
          <div className="min-w-[160px]">
            <Choice
              label="Channel"
              value={channel}
              onChange={(value) => {
                setChannel(value as typeof channel);
                setPage(0);
              }}
              options={[
                ["all", "All channels"],
                "B2C",
                "B2B",
              ]}
            />
          </div>
          <div className="min-w-[160px]">
            <Choice
              label="Availability"
              value={status}
              onChange={(value) => {
                setStatus(value as InventoryAvailabilityFilter);
                setPage(0);
              }}
              options={[
                ["READY", "READY / AVAILABLE"],
                ["ALL", "All physical inventory"],
                ["EXCLUDED", "Excluded inventory"],
                ["INVALID", "Invalid records"],
              ]}
            />
          </div>
          <div className="min-w-[160px]">
            <Choice
              label="Decision"
              value={decision}
              onChange={(value) => {
                setDecision(value as typeof decision);
                setPage(0);
              }}
              options={[
                ["all", "All decisions"],
                "SELL READY",
                "ROUTE ELIGIBLE",
                "HOLD",
              ]}
            />
          </div>
          <Input
            className="min-w-[200px] flex-1"
            placeholder="Serial / stock ID / gramasi"
            aria-label="Cari inventory"
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
          "Serial / Stock ID",
          "Gram",
          "Channel",
          "Availability",
          "Unit cost",
          "Selling price",
          "GP / Margin",
          "Decision",
          "Evidence",
        ]}
        rows={pageRows.map((row) => [
          <span key={`${row.stock_id}-id`}>
            {row.serial}
            <br />
            <small className="text-muted-text">{row.stock_id}</small>
          </span>,
          `${row.gram}g`,
          row.channel,
          <Status key="availability" tone={row.ready ? "sell" : ""}>
            {row.reserved ? "RESERVED" : row.availability_status}
          </Status>,
          formatIdr(row.unit_cost > 0 ? row.unit_cost : null),
          row.ready ? formatIdr(row.selling_price) : "—",
          row.ready && row.direct_gp != null && row.direct_margin != null
            ? `${formatIdr(row.direct_gp)} / ${formatPercent(row.direct_margin)}`
            : "—",
          <Status key="decision" tone={decisionTone(row.decision, row.valid)}>
            {row.decision ?? (row.valid ? "EXCLUDED / UNPRICED" : "INVALID")}
          </Status>,
          <Button
            key="detail"
            variant="outline"
            size="sm"
            onClick={() =>
              setDialog({
                kind: "inventory-unit",
                stockId: row.stock_id,
                serial: row.serial,
              })
            }
          >
            Detail
          </Button>,
        ])}
      />
      <PageToolbar>
        <span className="text-[0.9375rem] text-muted-text">
          {formatNumber(rows.length)} records · halaman {current + 1} / {pages}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            disabled={current + 1 >= pages}
            onClick={() => setPage(current + 1)}
          >
            Berikutnya
          </Button>
        </div>
      </PageToolbar>
    </WorkspaceStack>
  );
}

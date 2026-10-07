"use client";

import Link from "next/link";
import { XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/atoms/button";
import { Evidence } from "@/components/molecules/evidence";
import { Metric } from "@/components/molecules/metric";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/organisms/dialog";
import { BUCKET_EVIDENCE_TITLE } from "@/domain/intelligence";
import { formatIdr, compactRupiah, formatNumber, formatPercent } from "@/lib/format/money";
import { getHomeIntelligence } from "@/lib/mocks/home-intelligence";
import { getInventoryRecord } from "@/lib/mocks/workspace";
import { useSettingsStore } from "@/stores/use-settings-store";
import { useUIStore } from "@/stores/use-ui-store";

function DialogShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const setDialog = useUIStore((state) => state.setDialog);

  return (
    <DialogContent showCloseButton={false} className="w-170">
      <DialogClose
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute top-2 right-2"
            aria-label="Close"
          />
        }
        onClick={() => setDialog(null)}
      >
        <XIcon aria-hidden="true" />
      </DialogClose>
      <DialogHeader>
        <DialogTitle className="text-[1.15rem] font-semibold">{title}</DialogTitle>
        <DialogDescription className="text-base text-muted-text">
          {description}
        </DialogDescription>
      </DialogHeader>
      {children}
    </DialogContent>
  );
}

export function EvidenceDialog() {
  const dialog = useUIStore((state) => state.dialog);
  const setDialog = useUIStore((state) => state.setDialog);
  const segment = useSettingsStore((state) => state.segment);
  const home = getHomeIntelligence(segment);
  const open = dialog != null;
  const bucket = dialog?.kind === "bucket-evidence" ? dialog.bucket : null;
  const profit = bucket ? home.buckets[bucket].profit : home.profit;
  const unit =
    dialog?.kind === "inventory-unit"
      ? getInventoryRecord(dialog.stockId)
      : undefined;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setDialog(null);
        }
      }}
    >
      {dialog?.kind === "inventory-unit" ? (
        <DialogShell
          title={`Inventory evidence · ${dialog.serial ?? dialog.stockId}`}
          description="Perhitungan dan bukti dari snapshot saat ini."
        >
          {unit ? (
            <Evidence
              rows={[
                ["Stock ID", unit.stock_id],
                ["Channel / Gramasi", `${unit.channel} · ${unit.gram}g`],
                [
                  "Production / Keeper",
                  `${unit.production} · ${unit.stock_keeper}`,
                ],
                [
                  "Availability",
                  `${unit.availability_status} · reserved ${unit.reserved ? "Yes" : "No"}`,
                ],
                ["HPP / unit", formatIdr(unit.unit_cost > 0 ? unit.unit_cost : null)],
                ["Harga beli / unit", formatIdr(unit.purchase_price > 0 ? unit.purchase_price : null)],
                ["Selling price", formatIdr(unit.selling_price)],
                [
                  "Total GP / Margin",
                  unit.direct_gp != null && unit.direct_margin != null
                    ? `${formatIdr(unit.direct_gp)} / ${formatPercent(unit.direct_margin)}`
                    : "—",
                ],
                ["Pasar saat beli", formatIdr(unit.market_at_purchase)],
                ["Pasar kini", formatIdr(unit.market_at_sale)],
                ["Prognosa · estimasi", formatIdr(unit.profit.prognosa)],
                ["Investment · estimasi", formatIdr(unit.profit.investment)],
                ["Arbitrage · estimasi", formatIdr(unit.profit.arbitrage)],
                [
                  "Policy",
                  unit.policyMargin == null
                    ? "—"
                    : formatPercent(unit.policyMargin),
                ],
                [
                  "Decision / Action",
                  `${unit.decision ?? "EXCLUDED / UNPRICED"} · ${unit.recommended_action ?? "REVIEW"}`,
                ],
                ["Reason", unit.reason ?? "Non-ready inventory / source belum valid"],
                [
                  "Replacement",
                  unit.supplier
                    ? `${unit.supplier.name} · ${formatIdr(unit.supplier.quote_price)}`
                    : "Unavailable",
                ],
              ]}
            />
          ) : (
            <p className="text-muted-text">Record tidak ditemukan.</p>
          )}
        </DialogShell>
      ) : dialog?.kind === "policy-preview" ? (
        <DialogShell
          title="Preview Policy Impact"
          description="Simulasi sementara. Belum disimpan."
        >
          <div className="grid grid-cols-3 gap-3.5 max-[700px]:grid-cols-1">
            {(["sell", "route", "hold"] as const).map((key) => (
              <Metric
                key={key}
                label={key.toUpperCase()}
                value={`${formatNumber(dialog.next[key])}g`}
                note={`Saat ini ${formatNumber(home.buckets[key].grams)}g`}
              />
            ))}
          </div>
          <p className="m-0 text-[0.9375rem] text-muted-text">
            READY = SELL READY + ROUTE ELIGIBLE + HOLD. Live tanpa source tidak
            menggunakan mock fallback.
          </p>
        </DialogShell>
      ) : dialog?.kind === "ready-inventory" ||
        dialog?.kind === "bucket-evidence" ? (
        <DialogShell
          title={
            bucket
              ? BUCKET_EVIDENCE_TITLE[bucket]
              : "Ready Inventory reconciliation"
          }
          description="Perhitungan dan bukti dari snapshot saat ini."
        >
          <Evidence
            rows={[
              [
                "Ready Inventory",
                `${formatNumber(home.grams)}g · ${formatNumber(home.pcs)} pcs`,
              ],
              ["SELL READY", `${formatNumber(home.buckets.sell.grams)}g`],
              ["ROUTE ELIGIBLE", `${formatNumber(home.buckets.route.grams)}g`],
              ["HOLD", `${formatNumber(home.buckets.hold.grams)}g`],
              ["Prognosa", compactRupiah(profit.prognosa)],
              ["Investment", compactRupiah(profit.investment)],
              ["Arbitrage", compactRupiah(profit.arbitrage)],
              ["Total laba", compactRupiah(profit.total)],
            ]}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/inventory" />}
              onClick={() => setDialog(null)}
            >
              Lihat Inventory
            </Button>
          </div>
        </DialogShell>
      ) : null}
    </Dialog>
  );
}

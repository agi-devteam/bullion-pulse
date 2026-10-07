"use client";

import Link from "next/link";
import { XIcon } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Evidence } from "@/components/molecules/evidence";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/organisms/dialog";
import { BUCKET_EVIDENCE_TITLE } from "@/domain/intelligence";
import { compactRupiah, formatNumber } from "@/lib/format/money";
import { getHomeIntelligence } from "@/lib/mocks/home-intelligence";
import { useSettingsStore } from "@/stores/use-settings-store";
import { useUIStore } from "@/stores/use-ui-store";

export function EvidenceDialog() {
  const dialog = useUIStore((state) => state.dialog);
  const setDialog = useUIStore((state) => state.setDialog);
  const segment = useSettingsStore((state) => state.segment);
  const data = getHomeIntelligence(segment);
  const open =
    dialog?.kind === "ready-inventory" || dialog?.kind === "bucket-evidence";
  const bucket = dialog?.kind === "bucket-evidence" ? dialog.bucket : null;
  const profit = bucket ? data.buckets[bucket].profit : data.profit;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setDialog(null);
        }
      }}
    >
      <DialogContent showCloseButton={false} className="w-[680px]">
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
          <DialogTitle className="text-[1.15rem] font-semibold">
            {bucket
              ? BUCKET_EVIDENCE_TITLE[bucket]
              : "Ready Inventory reconciliation"}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-text">
            Perhitungan dan bukti dari snapshot saat ini.
          </DialogDescription>
        </DialogHeader>
        <Evidence
          rows={[
            [
              "Ready Inventory",
              `${formatNumber(data.grams)}g · ${formatNumber(data.pcs)} pcs`,
            ],
            ["SELL READY", `${formatNumber(data.buckets.sell.grams)}g`],
            ["ROUTE ELIGIBLE", `${formatNumber(data.buckets.route.grams)}g`],
            ["HOLD", `${formatNumber(data.buckets.hold.grams)}g`],
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
      </DialogContent>
    </Dialog>
  );
}

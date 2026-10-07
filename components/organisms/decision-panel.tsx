"use client";

import type { KeyboardEvent } from "react";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { Status } from "@/components/atoms/status";
import { DenominationBarChart } from "@/components/organisms/denomination-bar-chart";
import {
  DECISION_CAPTIONS,
  type BucketData,
  type SupplierSplit,
} from "@/domain/intelligence";
import type { DecisionBucket } from "@/domain/primitives";
import { compactRupiah, formatNumber } from "@/lib/format/money";
import { cn } from "@/lib/utils";

export interface DecisionPanelProps {
  bucket: DecisionBucket;
  data: BucketData;
  supplierSplit?: SupplierSplit[];
  policyFloor?: { b2c: number; b2b: number };
  isComplete: boolean;
  onClick: () => void;
}

function descriptionFor(
  bucket: DecisionBucket,
  data: BucketData,
  isComplete: boolean,
): string {
  if (!isComplete) {
    return "Source belum valid. Periksa Data Health & Audit.";
  }

  if (bucket === "sell") {
    return "Prioritaskan inventory yang memenuhi kebijakan margin.";
  }

  if (bucket === "route") {
    return data.grams
      ? "Replacement profitable tersedia. WATCH · tunggu demand sebelum lock."
      : "Tidak ada ROUTE ELIGIBLE untuk segmen ini.";
  }

  return "Lindungi posisi di bawah policy. Tinjau harga sebelum dijual.";
}

function footerFor(
  bucket: DecisionBucket,
  data: BucketData,
  isComplete: boolean,
  policyFloor?: { b2c: number; b2b: number },
) {
  if (bucket === "sell") {
    return (
      <span>
        Prognosa GP{" "}
        <b className="mono font-bold">
          {isComplete ? compactRupiah(data.profit.prognosa) : "—"}
        </b>
      </span>
    );
  }

  if (bucket === "route") {
    return <span>Waiting for demand · no lock yet</span>;
  }

  return (
    <span>
      Floor B2C{" "}
      <b className="mono font-bold">
        {policyFloor ? policyFloor.b2c.toFixed(2) : "—"}
      </b>
      % · B2B{" "}
      <b className="mono font-bold">
        {policyFloor ? policyFloor.b2b.toFixed(2) : "—"}
      </b>
      %
    </span>
  );
}

export function DecisionPanel({
  bucket,
  data,
  supplierSplit = [],
  policyFloor,
  isComplete,
  onClick,
}: DecisionPanelProps) {
  const gramasiCount = data.denominations.filter((row) => row.grams > 0).length;

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  }

  return (
    <section
      className={cn(
        "flex min-w-0 cursor-pointer flex-col gap-3 px-7 py-6 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-route-f",
        "[&+&]:border-l [&+&]:border-line max-[1000px]:[&+&]:border-t max-[1000px]:[&+&]:border-l-0",
      )}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-label={`Lihat evidence ${bucket.toUpperCase()}`}
    >
      <div className="flex items-center justify-between">
        <Status tone={bucket}>{DECISION_CAPTIONS[bucket]}</Status>
        <ArrowUpRight size={20} aria-hidden="true" />
      </div>
      <h2 className="mt-1.5 text-[clamp(3rem,5vw,4.5rem)] leading-[0.95] font-bold tracking-tighter text-ink">
        {bucket.toUpperCase()}
      </h2>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <div className="inline-flex shrink-0 items-baseline gap-1.5">
          <strong className="mono text-[2.25rem] font-normal tracking-[-0.02em]">
            {isComplete ? formatNumber(data.grams) : "—"}
          </strong>
          <span className="text-base text-muted-text">
            gram
            {bucket !== "route" ? ` · ${gramasiCount} gramasi` : ""}
          </span>
        </div>
        {bucket === "route" && supplierSplit.length > 0 ? (
          <div
            className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5 text-[min(0.9375rem,20px)] leading-[1.4] text-muted-text"
            role="list"
            aria-label="Kandidat supplier ROUTE ELIGIBLE · belum locked"
          >
            {supplierSplit.map((supplier) => (
              <span
                key={supplier.name}
                className="flex items-baseline gap-1.75"
                role="listitem"
              >
                <b className="font-semibold text-route-t">{supplier.name}</b>
                <span className="mono shrink-0 text-ink">
                  {formatNumber(supplier.grams)}g
                </span>
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <p className="m-0 text-base leading-[1.45] text-muted-text">
        {descriptionFor(bucket, data, isComplete)}
      </p>
      <DenominationBarChart
        tone={bucket}
        rows={data.denominations.map((row) => ({
          gram: row.gram,
          value: row.grams,
        }))}
      />
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3.5 text-base">
        {footerFor(bucket, data, isComplete, policyFloor)}
        <ChevronRight size={18} aria-hidden="true" />
      </div>
    </section>
  );
}

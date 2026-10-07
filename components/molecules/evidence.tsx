import type { ReactNode } from "react";

export interface EvidenceProps {
  rows: [string, ReactNode][];
}

export function Evidence({ rows }: EvidenceProps) {
  return (
    <dl className="flex flex-col gap-3.5">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="grid grid-cols-1 gap-1 sm:grid-cols-[1fr_1.6fr] sm:gap-4"
        >
          <dt className="text-muted-text">{label}</dt>
          <dd className="m-0 wrap-anywhere">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

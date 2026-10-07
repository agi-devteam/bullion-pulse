import { Card } from "@/components/molecules/card";

export interface MetricProps {
  label: string;
  value: string;
  note?: string;
}

export function Metric({ label, value, note }: MetricProps) {
  return (
    <Card className="block min-w-0 p-5">
      <div className="text-[0.875rem] font-semibold tracking-[0.06em] text-muted-text uppercase">
        {label}
      </div>
      <strong className="mono my-2.5 block text-[1.8rem] font-medium tracking-tight wrap-anywhere">
        {value}
      </strong>
      {note ? (
        <div className="text-[0.9375rem] leading-normal text-muted-text">{note}</div>
      ) : null}
    </Card>
  );
}

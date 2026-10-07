import type { ReactNode } from "react";
import { Label } from "@/components/atoms/label";
import { cn } from "@/lib/utils";

export interface FormRowProps {
  label: string;
  id?: string;
  note?: string;
  /** Control column width in px. Default 120; Dashboard uses 210. */
  controlWidth?: 120 | 210;
  children: ReactNode;
}

export function FormRow({
  label,
  id,
  note,
  controlWidth = 120,
  children,
}: FormRowProps) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-line py-4 last:border-b-0 max-[700px]:flex-col max-[700px]:items-stretch max-[700px]:gap-2.5">
      <div className="min-w-0">
        <Label
          htmlFor={id}
          className="block text-base font-semibold leading-normal"
        >
          {label}
        </Label>
        {note ? (
          <small className="mt-1.5 block text-[0.9375rem] font-normal leading-normal text-muted-text">
            {note}
          </small>
        ) : null}
      </div>
      <div
        className={cn(
          "flex flex-none items-center justify-end max-[700px]:w-full [&_[data-slot=input]]:w-full [&_[data-slot=select-trigger]]:w-full",
          controlWidth === 210 ? "w-[210px]" : "w-[120px]",
        )}
      >
        {children}
      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import { Label } from "@/components/atoms/label";

export interface FormRowProps {
  label: string;
  id: string;
  note?: string;
  children: ReactNode;
}

export function FormRow({ label, id, note, children }: FormRowProps) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-line py-4 last:border-b-0 max-[700px]:flex-col max-[700px]:items-stretch max-[700px]:gap-2.5">
      <div className="min-w-0">
        <Label htmlFor={id} className="block text-base font-semibold leading-normal">
          {label}
        </Label>
        {note ? (
          <small className="mt-1.5 block text-[0.875rem] font-normal leading-normal text-muted-text">
            {note}
          </small>
        ) : null}
      </div>
      <div className="w-[210px] flex-none max-[700px]:w-full">{children}</div>
    </div>
  );
}

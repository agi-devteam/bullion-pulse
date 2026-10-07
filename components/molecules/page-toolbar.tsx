import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageToolbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function WorkspaceStack({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[22px] max-[700px]:gap-4">{children}</div>
  );
}

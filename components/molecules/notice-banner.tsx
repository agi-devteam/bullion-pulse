import type { ReactNode } from "react";

export function NoticeBanner({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-line px-4.5 py-3.5 text-[0.95rem] leading-normal text-muted-text">
      {children}
    </div>
  );
}

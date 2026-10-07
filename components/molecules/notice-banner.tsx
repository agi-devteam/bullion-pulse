import type { ReactNode } from "react";

export function NoticeBanner({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[12px] border border-line px-[18px] py-3.5 text-[0.9375rem] leading-normal text-muted-text">
      {children}
    </div>
  );
}

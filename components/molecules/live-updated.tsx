"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface LiveUpdatedProps {
  updatedAt: number | undefined;
  className?: string;
}

export function LiveUpdated({ updatedAt, className }: LiveUpdatedProps) {
  const t = useTranslations("home.live");
  const [now, setNow] = useState(() => Date.now());
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 5_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (updatedAt == null) return;
    setPulse(true);
    const timer = window.setTimeout(() => setPulse(false), 1_200);
    return () => window.clearTimeout(timer);
  }, [updatedAt]);

  if (updatedAt == null) {
    return null;
  }

  const seconds = Math.max(0, Math.floor((now - updatedAt) / 1000));
  const relative =
    seconds < 8
      ? t("justNow")
      : seconds < 60
        ? t("secondsAgo", { count: seconds })
        : t("minutesAgo", { count: Math.floor(seconds / 60) });

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[0.8125rem] font-medium tracking-[0.04em] text-muted-text uppercase",
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full bg-sell-f",
          pulse ? "live-pulse" : "opacity-70",
        )}
        aria-hidden="true"
      />
      {t("updated", { relative })}
    </span>
  );
}

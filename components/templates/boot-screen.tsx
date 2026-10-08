"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import heartbeatAnimation from "@/assets/lottie/heartbeat.json";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";

export interface BootScreenProps {
  exiting?: boolean;
  reducedMotion?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

const STATUS_INTERVAL_MS = 5000;

export function BootScreen({
  exiting = false,
  reducedMotion = false,
  error = false,
  onRetry,
}: BootScreenProps) {
  const t = useTranslations("boot");
  const tCommon = useTranslations("common");
  const statusLines = t.raw("statusLines") as string[];
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (error || statusLines.length <= 1) return;

    const timer = window.setInterval(() => {
      if (reducedMotion) {
        setIndex((current) => (current + 1) % statusLines.length);
        return;
      }

      setVisible(false);
      window.setTimeout(() => {
        setIndex((current) => (current + 1) % statusLines.length);
        setVisible(true);
      }, 220);
    }, STATUS_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [error, reducedMotion, statusLines.length]);

  const status = error
    ? t("loadFailed")
    : (statusLines[index] ?? statusLines[0] ?? "");

  return (
    <div
      className={cn(
        "boot-screen fixed inset-0 z-200 flex flex-col items-center justify-center",
        exiting && "boot-screen--exit",
      )}
      role="status"
      aria-live="polite"
      aria-busy={!exiting && !error}
      aria-label={t("aria")}
    >
      <div className="mb-2 w-full max-w-70 max-[700px]:mb-1.5 max-[700px]:max-w-56">
        {reducedMotion || error ? (
          <div className="boot-screen__lottie-fallback" aria-hidden />
        ) : (
          <DotLottieReact
            data={heartbeatAnimation}
            loop
            autoplay
            className="h-auto w-full"
            aria-hidden
          />
        )}
      </div>

      <h1 className="m-0 text-[clamp(2rem,6vw,3.25rem)] leading-none font-bold tracking-[-0.04em] text-white">
        {t("title")}
      </h1>
      <p
        className={cn(
          "boot-screen__status mt-3.5 mb-0 max-w-70 text-center text-[0.95rem] text-neutral-400",
          !error &&
            !reducedMotion &&
            (visible ? "boot-screen__status--in" : "boot-screen__status--out"),
        )}
      >
        {status}
      </p>

      {error && onRetry ? (
        <Button
          type="button"
          className="mt-8 border-0 bg-white text-neutral-950 hover:bg-neutral-200"
          onClick={onRetry}
        >
          {tCommon("retry")}
        </Button>
      ) : null}
    </div>
  );
}

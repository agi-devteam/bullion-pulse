"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import type { Segment } from "@/domain/primitives";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings-store";

const SEGMENT_IDS: Segment[] = ["all", "b2c", "b2b"];

export function ChannelFilter() {
  const t = useTranslations("market");
  const segment = useSettingsStore((state) => state.segment);
  const setSegment = useSettingsStore((state) => state.setSegment);

  const labels: Record<Segment, string> = {
    all: t("segmentAll"),
    b2c: t("segmentB2c"),
    b2b: t("segmentB2b"),
  };

  return (
    <div
      className="flex gap-1 rounded-[999px] bg-track p-1 max-[700px]:p-0.75 max-[480px]:flex-1"
      aria-label={t("segmentLabel")}
    >
      {SEGMENT_IDS.map((id) => {
        const pressed = segment === id;

        return (
          <Button
            key={id}
            variant={pressed ? "default" : "ghost"}
            aria-pressed={pressed}
            onClick={() => setSegment(id)}
            className={cn(
              "min-h-11 min-w-19 px-4.5 tracking-normal",
              !pressed && "text-muted-text",
              "max-[700px]:min-h-10 max-[700px]:min-w-0 max-[700px]:px-3",
              "max-[480px]:flex-1 max-[480px]:px-2",
            )}
          >
            {labels[id]}
          </Button>
        );
      })}
    </div>
  );
}

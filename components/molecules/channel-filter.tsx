"use client";

import { Button } from "@/components/atoms/button";
import type { Segment } from "@/domain/primitives";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings-store";

const SEGMENTS: { id: Segment; label: string }[] = [
  { id: "all", label: "All" },
  { id: "b2c", label: "B2C" },
  { id: "b2b", label: "B2B" },
];

export function ChannelFilter() {
  const segment = useSettingsStore((state) => state.segment);
  const setSegment = useSettingsStore((state) => state.setSegment);

  return (
    <div
      className="flex gap-1 rounded-[999px] bg-track p-1 max-[700px]:p-0.75 max-[480px]:flex-1"
      aria-label="Segmen bisnis"
    >
      {SEGMENTS.map((option) => {
        const pressed = segment === option.id;

        return (
          <Button
            key={option.id}
            variant={pressed ? "default" : "ghost"}
            aria-pressed={pressed}
            onClick={() => setSegment(option.id)}
            className={cn(
              "min-h-11 min-w-19 px-4.5 tracking-normal",
              !pressed && "text-muted-text",
              "max-[700px]:min-h-10 max-[700px]:min-w-0 max-[700px]:px-3",
              "max-[480px]:flex-1 max-[480px]:px-2",
            )}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}

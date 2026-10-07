"use client";

import Link from "next/link";
import { Eye, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/molecules/card";

export interface PriorityActionCardProps {
  action: "WATCH" | "REPRICE";
  title: string;
  subtitle: string;
  href: string;
}

export function PriorityActionCard({
  action,
  title,
  subtitle,
  href,
}: PriorityActionCardProps) {
  const watch = action === "WATCH";

  return (
    <Card className="flex flex-row items-center gap-3.5 rounded-2xl px-5 py-4">
      <span
        aria-hidden="true"
        className={
          watch
            ? "flex size-11 flex-none items-center justify-center rounded-xl bg-route-bg text-route-t"
            : "flex size-11 flex-none items-center justify-center rounded-xl bg-hold-bg text-hold-t"
        }
      >
        {watch ? <Eye size={20} /> : <SlidersHorizontal size={20} />}
      </span>
      <div className="min-w-0 flex-1">
        <b className="block text-[1.0625rem] font-semibold">{title}</b>
        <p className="m-0 text-[0.9375rem] text-muted-text">{subtitle}</p>
      </div>
      <Button
        variant={watch ? "default" : "outline"}
        className="flex-none"
        nativeButton={false}
        render={<Link href={href} />}
      >
        {action}
      </Button>
    </Card>
  );
}

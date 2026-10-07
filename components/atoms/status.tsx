import type { ReactNode } from "react";
import { Badge } from "@/components/atoms/badge";
import { cn } from "@/lib/utils";

export interface StatusProps {
  children: ReactNode;
  tone?: "sell" | "route" | "hold" | "";
}

const toneClassName: Record<Exclude<StatusProps["tone"], undefined>, string> = {
  "": "bg-track text-muted-text",
  sell: "bg-sell-bg text-sell-t",
  route: "bg-route-bg text-route-t",
  hold: "bg-hold-bg text-hold-t",
};

export function Status({ children, tone = "" }: StatusProps) {
  return (
    <Badge variant="secondary" className={cn(toneClassName[tone])}>
      {children}
    </Badge>
  );
}

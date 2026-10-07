import type { Channel, Gram } from "@/domain/primitives";

export type ActionType = "WATCH" | "REPRICE" | "REVIEW DATA";
export type ActionSeverity = "attention" | "risk";

export interface ActionAlert {
  id: string;
  severity: ActionSeverity;
  action: ActionType;
  channel: Channel | null;
  gram: Gram | null;
  quantity: number;
  reasonKey: "watch10" | "watch25" | "reprice50" | "invalidRecord";
  ownerKey: "routeDesk" | "pricing" | "dataHealth";
  status: "OPEN" | "REVIEWED";
  href: string;
}

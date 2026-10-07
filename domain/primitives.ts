export const GRAMS = [1, 2, 3, 5, 10, 25, 50, 100] as const;

export type Gram = (typeof GRAMS)[number];

export type Channel = "B2C" | "B2B";

export type Segment = "all" | "b2c" | "b2b";

export type Theme = "system" | "light" | "dark";

export type Language = "en" | "id";

export type DecisionBucket = "sell" | "route" | "hold";

export type InventoryDecision = "SELL READY" | "ROUTE ELIGIBLE" | "HOLD";

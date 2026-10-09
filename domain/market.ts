export interface XauQuote {
  current: number;
  change: number | null;
}

export interface AntamQuote {
  sell: Partial<Record<number, number>>;
  buyback: number | null;
}

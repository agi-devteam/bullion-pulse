export interface XauQuote {
  current: number;
  change: number;
}

export interface AntamQuote {
  sell: Partial<Record<number, number>>;
  buyback: number;
}

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { MarketPill } from "@/components/molecules/market-pill";
import { formatRupiah, formatUsd } from "@/lib/format/money";
import { useIntelligence } from "@/lib/query/hooks";
import { useSettingsStore } from "@/stores/use-settings-store";

function useWibTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    function tick() {
      const formatted = new Date()
        .toLocaleTimeString("id-ID", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(".", ":");

      setTime(formatted);
    }

    tick();
    const interval = window.setInterval(tick, 15_000);
    return () => window.clearInterval(interval);
  }, []);

  return time;
}

export function MarketStrip() {
  const t = useTranslations("market");
  const segment = useSettingsStore((state) => state.segment);
  const intelligence = useIntelligence(segment);
  const market = intelligence.data?.market;
  const time = useWibTime();
  const unavailable = t("unavailable");

  if (!market) return null;

  return (
    <div className="flex min-w-0 flex-wrap gap-2 min-[701px]:max-[1500px]:col-span-full min-[701px]:max-[1500px]:row-start-2 max-[1500px]:flex-nowrap max-[1500px]:overflow-x-auto max-[1500px]:scrollbar-none max-[700px]:order-3 max-[700px]:w-full [&::-webkit-scrollbar]:hidden">
      {market.xauEnabled && market.xau ? (
        <MarketPill
          label={t("xauLabel")}
          value={formatUsd(market.xau.current)}
          change={market.xau.change ?? undefined}
        />
      ) : null}
      {market.antamSell1g ? (
        <MarketPill
          label={t("antamSell1g")}
          value={formatRupiah(market.antamSell1g.current)}
          change={market.antamSell1g.change ?? undefined}
        />
      ) : null}
      {market.antamBuybackPerGram ? (
        <MarketPill
          label={t("antamBuyback")}
          value={formatRupiah(market.antamBuybackPerGram.current)}
          change={market.antamBuybackPerGram.change ?? undefined}
        />
      ) : null}
      <MarketPill
        value={time ? t("clockWib", { time }) : unavailable}
        muted
      />
    </div>
  );
}

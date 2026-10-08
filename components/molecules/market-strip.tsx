"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { MarketPill } from "@/components/molecules/market-pill";
import { formatRupiah } from "@/lib/format/money";
import { useMarketAntam } from "@/lib/query/hooks";

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
  const antam = useMarketAntam();
  const time = useWibTime();
  const unavailable = t("unavailable");

  return (
    <div className="flex min-w-0 flex-wrap gap-2 min-[701px]:max-[1500px]:col-span-full min-[701px]:max-[1500px]:row-start-2 max-[1500px]:flex-nowrap max-[1500px]:overflow-x-auto max-[1500px]:scrollbar-none max-[700px]:order-3 max-[700px]:w-full [&::-webkit-scrollbar]:hidden">
      <MarketPill
        label={t("antamSell1g")}
        value={
          antam.data?.sell[1] != null
            ? formatRupiah(antam.data.sell[1])
            : unavailable
        }
      />
      <MarketPill
        label={t("antamBuyback")}
        value={
          antam.data?.buyback != null
            ? formatRupiah(antam.data.buyback)
            : unavailable
        }
      />
      <MarketPill
        value={time ? t("clockWib", { time }) : unavailable}
        muted
      />
    </div>
  );
}

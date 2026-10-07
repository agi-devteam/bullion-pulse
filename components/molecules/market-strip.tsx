"use client";

import { useEffect, useState } from "react";
import { MarketPill } from "@/components/molecules/market-pill";
import { formatRupiah, formatUsd } from "@/lib/format/money";
import { useMarketAntam, useMarketXau } from "@/lib/query/hooks";

const MOCK_TITLE = "Mock data · bukan production live";

function useWibClock() {
  const [clock, setClock] = useState<string | null>(null);

  useEffect(() => {
    function tick() {
      const formatted = new Date()
        .toLocaleTimeString("id-ID", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(".", ":");

      setClock(`${formatted} WIB`);
    }

    tick();
    const interval = window.setInterval(tick, 15_000);
    return () => window.clearInterval(interval);
  }, []);

  return clock;
}

export function MarketStrip() {
  const xau = useMarketXau();
  const antam = useMarketAntam();
  const clock = useWibClock();

  return (
    <div className="flex min-w-0 flex-wrap gap-2 min-[701px]:max-[1500px]:col-span-full min-[701px]:max-[1500px]:row-start-2 max-[1500px]:flex-nowrap max-[1500px]:overflow-x-auto max-[1500px]:[scrollbar-width:none] max-[700px]:order-3 max-[700px]:w-full [&::-webkit-scrollbar]:hidden">
      <MarketPill
        label="XAU/USD"
        value={xau.data ? formatUsd(xau.data.current) : "Unavailable"}
        change={xau.data?.change}
        title={MOCK_TITLE}
      />
      <MarketPill
        label="ANTAM Sell 1g"
        value={
          antam.data?.sell[1] != null
            ? formatRupiah(antam.data.sell[1])
            : "Unavailable"
        }
        title={MOCK_TITLE}
      />
      <MarketPill
        label="ANTAM Buyback"
        value={
          antam.data?.buyback != null
            ? formatRupiah(antam.data.buyback)
            : "Unavailable"
        }
        title={MOCK_TITLE}
      />
      <MarketPill value={clock ?? "Unavailable"} muted />
    </div>
  );
}

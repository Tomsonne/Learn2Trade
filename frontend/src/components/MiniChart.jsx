import { useMemo } from "react";
import { useMarketSeries } from "../hooks/useMarketSeries";
import CandleLite from "./CandleLite";

// "BTCUSDT" -> "BTC" ; "ETHUSD" -> "ETH"
const baseSymbol = (s="") => s.replace(/USDT$|USD$/i, "");

export default function MiniChart({ symbol, tf = "15m", height = 120, className = "" }) {
  const sym = baseSymbol(symbol);
  const { data: series = [], loading } = useMarketSeries({ symbol: sym, tf, refreshMs: 60_000 });

  const candles = useMemo(() =>
    series
      .filter(d => [d.ts,d.o,d.h,d.l,d.c].every(Number.isFinite))
      .slice(-60) // 60 dernières bougies pour un mini aperçu
      .map(d => ({ time: Math.floor(d.ts/1000), open:+d.o, high:+d.h, low:+d.l, close:+d.c }))
  , [series]);

  return (
    <div className={`w-full ${className}`}>
      <div className="h-[120px] rounded-md overflow-hidden bg-card/50">
        {candles.length >= 2
          ? <CandleLite key={`${sym}-${tf}`} data={candles} height={height} tf={tf} locale="fr-FR" timeZone="Europe/Paris" />
          : <div className="h-full grid place-items-center text-xs text-muted-foreground">{loading ? "Chargement…" : "Pas de données"}</div>
        }
      </div>
    </div>
  );
}

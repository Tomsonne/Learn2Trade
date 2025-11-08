import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { useMarketSeries } from "../hooks/useMarketSeries.js";
import CandleLite from "./CandleLite.jsx";
import RsiCard from "./cards/RsiCard.jsx";
import MaCard from "./cards/MaCard.jsx";
import { useSpotPrice } from "../hooks/useSpotPrice.js";
import TimeframeToolbar from "./ui/TimeframeToolbar.jsx";
import { getRSISignal, getMASignal } from "../utils/ta-ui.js";

export default function AssetAnalysisModal({ symbol, onClose }) {
  const [tf, setTf] = useState("1h");

  // Nettoyer le symbole: enlever USDT, USD, BUSD, etc.
  const cleanSymbol = symbol?.replace(/USDT|USD|BUSD|USDC/gi, "") || symbol;

  const { price: spot } = useSpotPrice({ symbol: cleanSymbol, refreshMs: 60_000 });

  const { data: series = [], loading, error } = useMarketSeries({
    symbol: cleanSymbol,
    tf,
    refreshMs: 60_000,
    spotPrice: spot,
  });

  const candles = useMemo(
    () =>
      series
        .filter((d) => [d.ts, d.o, d.h, d.l, d.c].every(Number.isFinite))
        .map((d) => ({
          time: Math.floor(d.ts / 1000),
          open: +d.o,
          high: +d.h,
          low: +d.l,
          close: +d.c,
          volume: Number.isFinite(d.v) ? +d.v : 0,
        })),
    [series]
  );

  const last = series.at(-1) ?? {};
  const currentRSI = useMemo(() => {
    for (let i = series.length - 1; i >= 0; i--) {
      const v = series[i]?.rsi;
      if (Number.isFinite(v)) return v;
    }
    return null;
  }, [series]);

  const nf = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
  const fmt = (v) => (v == null ? "—" : nf.format(Number(v)));

  const rsiSignal = useMemo(() => getRSISignal(currentRSI ?? 50), [currentRSI]);
  const maSignal = useMemo(
    () => getMASignal(last?.ma20 ?? 0, last?.ma50 ?? 0),
    [last?.ma20, last?.ma50]
  );

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="max-w-6xl w-full max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-card-foreground">
              Analyse en Temps Réel — {symbol}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Indicateurs techniques et graphique en direct
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-accent hover:bg-muted rounded-full flex items-center justify-center text-card-foreground hover:scale-110 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading && (
            <div className="text-sm text-muted-foreground">
              Mise à jour des données temps réel…
            </div>
          )}
          {error && (
            <div className="text-sm text-red-600">
              Erreur données live : {error}
            </div>
          )}

          {/* Indicateurs RSI et MA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RsiCard
              series={series}
              rsiSignal={rsiSignal}
              currentRSI={currentRSI}
              tf={tf}
            />
            <MaCard
              series={series}
              maSignal={maSignal}
              fmt={fmt}
              tf={tf}
              ma20={last?.ma20 ?? null}
              ma50={last?.ma50 ?? null}
              price={typeof spot === "number" ? spot : null}
            />
          </div>

          {/* Graphique */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-card-foreground">
                Graphique {cleanSymbol}/USD — Chandeliers
              </h3>
              <span className="px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/30">
                Prix spot : {typeof spot === "number" ? fmt(spot) : "—"}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <TimeframeToolbar value={tf} onChange={setTf} />
            </div>

            <div className="h-96">
              {candles.length >= 2 ? (
                <CandleLite
                  key={`${cleanSymbol}-${tf}`}
                  data={candles}
                  height={384}
                  tf={tf}
                  locale="fr-FR"
                  timeZone="Europe/Paris"
                />
              ) : (
                <div className="text-sm text-muted-foreground">Pas d'OHLC</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

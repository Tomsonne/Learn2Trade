import { useState, useMemo } from "react";
import CardBase from "./ui/CardBase";
import { useSpotPrice } from "../hooks/useSpotPrice";
import MiniChart from "./MiniChart";

const baseSymbol = (symbol = "") => {
  const s = String(symbol).toUpperCase();
  // Extraire le symbol de base (retire USDT, USD, etc.)
  const match = s.match(/^([A-Z]+)(?:USDT|USD|BUSD|USDC)?$/);
  if (match) return match[1];
  // Fallback: retourne le symbol original
  return s;
};

const fmtUSD = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("fr-FR", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
};
const fmt2 = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const clamp = (v, min, max) => Math.max(min, Math.min(max, v ?? 0));

export default function PositionCard({ trade, onClose }) {
  const [closeQty, setCloseQty] = useState(0);

  const priceOpen = Number(trade.price_open);
  const qty = Number(trade.quantity);
  const side = trade.side;
  const symbol = trade.symbol || trade.asset?.symbol || `#${trade.asset_id}`;

  const spotKey = baseSymbol(symbol);
  const { price: live } = useSpotPrice({ symbol: symbol, refreshMs: 60_000 });

  const px = Number(live);
  const hasPx = Number.isFinite(px) && px > 0;
  const maxQty = qty > 0 ? qty : 0;

  const pnl = useMemo(() => {
    if (!hasPx || !Number.isFinite(priceOpen)) return null;
    const usedQty = closeQty > 0 ? closeQty : qty;
    const diff = side === "BUY" ? (px - priceOpen) : (priceOpen - px);
    return diff * usedQty;
  }, [hasPx, px, priceOpen, qty, closeQty, side]);

  const pnlPct = useMemo(() => {
    if (!hasPx || !Number.isFinite(priceOpen) || priceOpen === 0) return null;
    const pct = side === "BUY" ? (px - priceOpen) / priceOpen : (priceOpen - px) / priceOpen;
    return pct * 100;
  }, [hasPx, px, priceOpen, side]);

  const pnlClass = pnl == null ? "text-muted-foreground" : pnl >= 0 ? "text-green-600" : "text-red-600";

  return (
    <CardBase className="flex flex-col gap-3 bg-card border border-border rounded-2xl">
      {/* En-tête + mini-chart */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-semibold text-card-foreground">{symbol}</div>
          <div className={`text-sm ${pnlClass}`}>
            {pnl == null ? "—" : `${pnl >= 0 ? "+" : ""}${fmtUSD(pnl)}`}
            {pnlPct == null ? "" : ` (${pnlPct >= 0 ? "+" : ""}${fmt2(pnlPct)}%)`}
          </div>
        </div>
        <div className="w-40 sm:w-48 md:w-56 shrink-0">
          <MiniChart symbol={symbol} tf="15m" height={110} />
        </div>
      </div>

      {/* Détails */}
      <div className="grid grid-cols-2 gap-x-3 text-sm">
        <div className="text-muted-foreground">Côté</div>
        <div className="text-right font-medium text-card-foreground">{side}</div>

        <div className="text-muted-foreground">Quantité</div>
        <div className="text-right text-card-foreground">{fmt2(qty)}</div>

        <div className="text-muted-foreground">Prix d’achat</div>
        <div className="text-right text-card-foreground">{Number.isFinite(priceOpen) ? fmtUSD(priceOpen) : "—"}</div>

        <div className="text-muted-foreground">Prix actuel</div>
        <div className="text-right text-card-foreground">{hasPx ? fmtUSD(px) : "—"}</div>
      </div>

      {/* Slider fermeture */}
      <div className="mt-2">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-card-foreground">Quantité à fermer</span>
          <span className="font-medium text-card-foreground">{fmt2(closeQty)} / {fmt2(maxQty)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={maxQty}
          step={maxQty >= 1 ? 0.001 : maxQty / 100 || 0.000001}
          value={closeQty}
          onChange={(e) => setCloseQty(clamp(Number(e.target.value), 0, maxQty))}
          className="w-full accent-violet"
        />

        <div className="flex gap-2 mt-1">
          {[0, 0.25, 0.5, 0.75, 1].map((p) => {
            const active = Math.abs(closeQty - maxQty * p) < Math.max(maxQty * 0.01, 0.000001);
            return (
              <button
                key={p}
                type="button"
                onClick={() => setCloseQty(Number((maxQty * p).toFixed(6)))}
                className={`flex-1 text-xs ${active ? "chip chip--active" : "chip"}`}
              >
                {p * 100}%
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        disabled={!closeQty || closeQty <= 0}
        onClick={() => onClose(trade.id, closeQty)}
        className="btn btn-violet w-full rounded-2xl mt-1"
      >
        Fermer {fmt2(closeQty)} {symbol}
      </button>
    </CardBase>
  );
}


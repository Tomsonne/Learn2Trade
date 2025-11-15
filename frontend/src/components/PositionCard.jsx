import { useState, useMemo } from "react";
import { Clock } from "lucide-react";
import CardBase from "./ui/CardBase";
import CryptoLogo from "./CryptoLogo";
import ConfirmationModal from "./ConfirmationModal";
import { useSpotPrice } from "../hooks/useSpotPrice";
import MiniChart from "./MiniChart";
import { formatTimeElapsed } from "../utils/timeElapsed";

const fmtUSD = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  // Pour les petits montants (< 1$), afficher plus de décimales
  const decimals = n < 1 ? 6 : n < 100 ? 4 : 2;
  return n.toLocaleString("fr-FR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals
  });
};
const fmt2 = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const clamp = (v, min, max) => Math.max(min, Math.min(max, v ?? 0));

// Convertit BTCUSDT en BTC/USD pour l'affichage
const toUiSymbol = (symbol) => {
  if (!symbol || typeof symbol !== "string") return symbol;
  if (symbol.endsWith("USDT")) return `${symbol.slice(0, -4)}/USD`;
  if (symbol.endsWith("USD") && !symbol.endsWith("/USD")) return `${symbol.slice(0, -3)}/USD`;
  return symbol;
};

export default function PositionCard({ trade, onClose }) {
  const [closeQty, setCloseQty] = useState(0);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  const priceOpen = Number(trade.price_open);
  const qty = Number(trade.quantity);
  const side = trade.side;
  const symbolRaw = trade.symbol || trade.asset?.symbol || `#${trade.asset_id}`;
  const symbol = toUiSymbol(symbolRaw); // Affichage converti (BTC/USD)

  const { price: live } = useSpotPrice({ symbol: symbolRaw, refreshMs: 60_000 });

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
  const timeElapsed = formatTimeElapsed(trade.opened_at);

  return (
    <CardBase className="flex flex-col gap-4 bg-card border border-border rounded-2xl">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CryptoLogo symbol={symbolRaw} size="lg" />
          <div>
            <div className="font-semibold text-2xl text-card-foreground">{symbol}</div>
            <div className={`text-lg font-medium mt-1 ${pnlClass}`}>
              {pnl == null ? "—" : `${pnl >= 0 ? "+" : ""}${fmtUSD(pnl)}`}
              {pnlPct == null ? "" : ` (${pnlPct >= 0 ? "+" : ""}${fmt2(pnlPct)}%)`}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Ouvert depuis {timeElapsed}</span>
            </div>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-lg text-sm font-semibold ${
          side === 'BUY' ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'
        }`}>
          {side}
        </div>
      </div>

      {/* Mini-chart pleine largeur */}
      <div className="w-full bg-accent/30 rounded-xl p-4">
        <div className="text-xs text-muted-foreground mb-3 font-medium">Timeframe: 15min</div>
        <div className="w-full">
          <MiniChart symbol={symbolRaw} tf="15m" height={220} />
        </div>
      </div>

      {/* Détails en 2 colonnes */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-accent rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">Quantité</div>
          <div className="text-lg font-semibold text-card-foreground">{fmt2(qty)}</div>
        </div>
        <div className="bg-accent rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">Prix d'achat</div>
          <div className="text-lg font-semibold text-card-foreground">
            {Number.isFinite(priceOpen) ? fmtUSD(priceOpen) : "—"}
          </div>
        </div>
        <div className="bg-accent rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">Prix actuel</div>
          <div className="text-lg font-semibold text-card-foreground">
            {hasPx ? fmtUSD(px) : "—"}
          </div>
        </div>
        <div className={`rounded-lg p-3 ${
          pnl == null ? 'bg-accent' : pnl >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
        }`}>
          <div className="text-xs text-muted-foreground mb-1">PnL</div>
          <div className={`text-lg font-semibold ${pnlClass}`}>
            {pnl == null ? "—" : `${pnl >= 0 ? "+" : ""}${fmtUSD(pnl)}`}
          </div>
        </div>
      </div>

      {/* Slider fermeture */}
      <div className="mt-2">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-card-foreground">Quantité à fermer</span>
          <span className="font-medium text-card-foreground">{fmt2(closeQty)} / {fmt2(maxQty)}</span>
        </div>
        {closeQty > 0 && hasPx && (
          <div className="text-xs text-muted-foreground mb-1 text-right">
            Valeur: {fmtUSD(closeQty * px)}
          </div>
        )}
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
        onClick={() => setShowCloseConfirmation(true)}
        className="btn btn-violet w-full rounded-2xl mt-1"
      >
        Fermer {fmt2(closeQty)} {symbol}
      </button>

      {/* Modal de confirmation de clôture */}
      <ConfirmationModal
        isOpen={showCloseConfirmation}
        onClose={() => setShowCloseConfirmation(false)}
        onConfirm={() => onClose(trade.id, closeQty)}
        title="Confirmer la clôture"
        type="close"
        details={{
          symbol,
          quantity: closeQty,
          price: px,
          total: closeQty * px,
          pnl,
          pnlPct,
        }}
      />
    </CardBase>
  );
}


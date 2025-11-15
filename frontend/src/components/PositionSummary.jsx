import { useState } from "react";
import { ChevronRight, Clock } from "lucide-react";
import PositionCard from "./PositionCard";
import CryptoLogo from "./CryptoLogo";
import { useSpotPrice } from "../hooks/useSpotPrice";
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

// Convertit BTCUSDT en BTC/USD pour l'affichage
const toUiSymbol = (symbol) => {
  if (!symbol || typeof symbol !== "string") return symbol;
  if (symbol.endsWith("USDT")) return `${symbol.slice(0, -4)}/USD`;
  if (symbol.endsWith("USD") && !symbol.endsWith("/USD")) return `${symbol.slice(0, -3)}/USD`;
  return symbol;
};

export default function PositionSummary({ trade, onClose }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const priceOpen = Number(trade.price_open);
  const qty = Number(trade.quantity);
  const side = trade.side;
  const symbolRaw = trade.symbol || trade.asset?.symbol || `#${trade.asset_id}`;
  const symbol = toUiSymbol(symbolRaw); // Affichage converti (BTC/USD)

  const { price: live } = useSpotPrice({ symbol: symbolRaw, refreshMs: 60_000 });

  const px = Number(live);
  const hasPx = Number.isFinite(px) && px > 0;

  // Calcul de la valeur détenue (quantité × prix actuel)
  const currentValue = hasPx ? qty * px : null;

  // Calcul PnL
  const pnl = hasPx && Number.isFinite(priceOpen)
    ? (side === "BUY" ? (px - priceOpen) : (priceOpen - px)) * qty
    : null;

  const pnlPct = hasPx && Number.isFinite(priceOpen) && priceOpen !== 0
    ? ((side === "BUY" ? (px - priceOpen) : (priceOpen - px)) / priceOpen) * 100
    : null;

  const isProfitable = pnl !== null && pnl >= 0;
  const pnlClass = pnl === null ? "text-muted-foreground" : isProfitable ? "text-green-600" : "text-red-600";
  const bgClass = isProfitable ? "bg-green-500/5" : "bg-red-500/5";
  const borderClass = isProfitable ? "border-green-500/20" : "border-red-500/20";

  const timeElapsed = formatTimeElapsed(trade.opened_at);

  return (
    <>
      {/* Vue résumée - Version compacte */}
      <div
        onClick={() => setIsExpanded(true)}
        className={`group cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] ${bgClass} border ${borderClass} rounded-lg p-2.5`}
      >
        <div className="flex items-center justify-between gap-2">
          {/* Crypto Logo */}
          <CryptoLogo symbol={symbolRaw} size="sm" className="flex-shrink-0" />

          {/* Info principale - plus compact */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-card-foreground">{symbol}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${side === 'BUY' ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
                {side}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className="font-medium text-card-foreground">{timeElapsed}</span>
              </div>
              <div>
                <span className="text-muted-foreground/70">Qté:</span> <span className="font-medium text-card-foreground">{fmt2(qty)}</span>
              </div>
              <div>
                <span className="text-muted-foreground/70">Valeur:</span> <span className="font-medium text-card-foreground">{currentValue !== null ? fmtUSD(currentValue) : "—"}</span>
              </div>
            </div>
          </div>

          {/* PnL - inline */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right">
              <div className={`font-semibold text-sm ${pnlClass}`}>
                {pnl === null ? "—" : `${pnl >= 0 ? "+" : ""}${fmtUSD(pnl)}`}
              </div>
              <div className={`text-xs ${pnlClass}`}>
                {pnlPct === null ? "" : `${pnlPct >= 0 ? "+" : ""}${fmt2(pnlPct)}%`}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </div>
      </div>

      {/* Modal avec la carte complète */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <button
                onClick={() => setIsExpanded(false)}
                className="absolute -top-2 -right-2 w-8 h-8 bg-card border border-border rounded-full flex items-center justify-center text-card-foreground hover:bg-muted hover:scale-110 transition-transform z-10 shadow-lg"
              >
                ✕
              </button>
              <PositionCard trade={trade} onClose={onClose} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

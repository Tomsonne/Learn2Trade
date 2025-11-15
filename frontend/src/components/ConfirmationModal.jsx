import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import CardBase from "./ui/CardBase";

/**
 * Modal de confirmation réutilisable avec détails de l'opération
 * @param {Object} props
 * @param {boolean} props.isOpen - État d'ouverture du modal
 * @param {Function} props.onClose - Fonction de fermeture
 * @param {Function} props.onConfirm - Fonction de confirmation
 * @param {string} props.title - Titre du modal
 * @param {string} props.type - Type d'opération: 'buy' ou 'close'
 * @param {Object} props.details - Détails de l'opération {symbol, quantity, price, total, pnl, pnlPct}
 */
export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  type = "buy",
  details = {}
}) {
  if (!isOpen) return null;

  const { symbol, quantity, price, total, pnl, pnlPct, side } = details;

  const isBuy = type === "buy";
  const isProfit = pnl !== null && pnl !== undefined && pnl >= 0;

  const fmtUSD = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return "—";
    // Pour les petits montants (< 1$), afficher plus de décimales
    const decimals = n < 1 ? 6 : n < 100 ? 4 : 2;
    return n.toLocaleString("fr-FR", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals,
    });
  };

  const fmt2 = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return "—";
    return n.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="max-w-md w-full animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <CardBase className="bg-card border-2 border-border rounded-2xl overflow-hidden">
          {/* Header avec icône */}
          <div className={`p-6 ${isBuy ? 'bg-primary/10' : isProfit ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isBuy ? 'bg-primary/20' : isProfit ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {isBuy ? (
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  ) : (
                    <AlertTriangle className={`w-6 h-6 ${isProfit ? 'text-green-600' : 'text-red-600'}`} />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-card-foreground mb-1">
                    {title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isBuy
                      ? "Vérifiez les détails avant de confirmer votre achat"
                      : "Vérifiez les détails avant de clôturer votre position"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-card-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Détails de l'opération */}
          <div className="p-6 space-y-4">
            {/* Symbole */}
            {symbol && (
              <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <span className="text-sm text-muted-foreground">Actif</span>
                <span className="text-lg font-bold text-card-foreground">{symbol}</span>
              </div>
            )}

            {/* Side (pour l'achat) */}
            {isBuy && side && (
              <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <span className="text-sm text-muted-foreground">Type</span>
                <span className={`text-base font-semibold px-3 py-1 rounded ${
                  side === 'BUY' ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'
                }`}>
                  {side}
                </span>
              </div>
            )}

            {/* Quantité */}
            {quantity !== null && quantity !== undefined && (
              <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <span className="text-sm text-muted-foreground">Quantité</span>
                <span className="text-base font-semibold text-card-foreground">{fmt2(quantity)}</span>
              </div>
            )}

            {/* Prix */}
            {price !== null && price !== undefined && (
              <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <span className="text-sm text-muted-foreground">Prix</span>
                <span className="text-base font-semibold text-card-foreground">{fmtUSD(price)}</span>
              </div>
            )}

            {/* Montant total */}
            {total !== null && total !== undefined && (
              <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                isBuy ? 'bg-primary/10 border-primary/30' : 'bg-accent border-border'
              }`}>
                <span className="text-sm font-medium text-muted-foreground">
                  {isBuy ? "Montant total" : "Valeur de clôture"}
                </span>
                <span className={`text-xl font-bold ${isBuy ? 'text-primary' : 'text-card-foreground'}`}>
                  {fmtUSD(total)}
                </span>
              </div>
            )}

            {/* PnL (pour la clôture) */}
            {!isBuy && pnl !== null && pnl !== undefined && (
              <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                isProfit ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
              }`}>
                <span className="text-sm font-medium text-muted-foreground">
                  Profit/Perte
                </span>
                <div className="text-right">
                  <div className={`text-xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                    {pnl >= 0 ? "+" : ""}{fmtUSD(pnl)}
                  </div>
                  {pnlPct !== null && pnlPct !== undefined && (
                    <div className={`text-sm ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                      {pnlPct >= 0 ? "+" : ""}{fmt2(pnlPct)}%
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-accent hover:bg-accent/80 text-card-foreground font-medium rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-all hover:scale-105 active:scale-95 ${
                isBuy
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  : isProfit
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isBuy ? "Confirmer l'achat" : "Confirmer la clôture"}
            </button>
          </div>
        </CardBase>
      </div>
    </div>
  );
}

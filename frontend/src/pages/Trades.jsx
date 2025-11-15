import { useEffect, useState, useCallback, useMemo } from "react";
import CardBase from "../components/ui/CardBase";
import PositionSummary from "../components/PositionSummary.jsx";
import SmartTradeAssistant from "../components/SmartTradeAssistant";
import AssetAnalysisModal from "../components/AssetAnalysisModal";
import CompactKPIs from "../components/CompactKPIs";
import MiniChart from "../components/MiniChart";
import PortfolioPerformanceChart from "../components/PortfolioPerformanceChart";
import ConfirmationModal from "../components/ConfirmationModal";
import { useSpotPrice } from "../hooks/useSpotPrice";
import { TrendingUp, BarChart3, ShoppingCart, ChevronDown, ChevronUp, Rocket, ArrowUpDown, Filter } from "lucide-react";

const API_URL = window.location.hostname.includes("localhost")
  ? "http://localhost:8000/api/v1"
  : "https://skillvest-production.up.railway.app/api/v1";

export default function TradesPage() {
  const [user, setUser] = useState(null);
  const [positions, setPositions] = useState([]);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [qty, setQty] = useState("");
  const [assets, setAssets] = useState([]);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [isOrderFormExpanded, setIsOrderFormExpanded] = useState(false);
  const [sortBy, setSortBy] = useState("time"); // time, pnl, value, symbol
  const [filterProfitable, setFilterProfitable] = useState("all"); // all, profit, loss
  const [showBuyConfirmation, setShowBuyConfirmation] = useState(false);
  const [pendingOrderSide, setPendingOrderSide] = useState(null);

  // Récupérer le symbole de l'actif sélectionné
  const selectedAsset = useMemo(() => {
    return assets.find(a => a.id === Number(selectedAssetId));
  }, [selectedAssetId, assets]);

  // Hook pour obtenir le prix en temps réel
  const { price: assetPrice } = useSpotPrice({
    symbol: selectedAsset?.symbol || "",
    refreshMs: 60_000
  });

  useEffect(() => {
    fetch(`${API_URL}/auth/check`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setUser(data?.status === "ok" ? data.user : null))
      .catch(() => setUser(null));

    // Load assets
    fetch(`${API_URL}/assets`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setAssets(data?.data || []))
      .catch(() => setAssets([]));
  }, []);

  const fetchOpenTrades = useCallback(async () => {
    if (!user?.id) return;
    try {
      // Récupérer les positions (comme Dashboard) pour avoir les valeurs correctes
      const resPos = await fetch(
        `${API_URL}/position?userId=${user.id}`,
        { credentials: "include" }
      );
      const jsonPos = await resPos.json();
      setPositions(jsonPos.data || []);

      // Récupérer aussi les trades pour l'affichage
      const resTrd = await fetch(
        `${API_URL}/trade?userId=${user.id}&is_closed=false`,
        { credentials: "include" }
      );
      const jsonTrd = await resTrd.json();
      setTrades(jsonTrd?.data?.filter((t) => !t.is_closed) || []);
    } catch (e) {
      console.error("Erreur /trade:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchOpenTrades();
  }, [user, fetchOpenTrades]);

  // Ouvrir le formulaire par défaut s'il n'y a pas de positions
  useEffect(() => {
    if (!loading && trades.length === 0) {
      setIsOrderFormExpanded(true);
    }
  }, [loading, trades.length]);

  const handleBuyClick = (side) => {
    if (!user?.id || !selectedAssetId || !qty) {
      alert("Remplis l'actif et la quantité.");
      return;
    }
    setPendingOrderSide(side);
    setShowBuyConfirmation(true);
  };

  const placeOrder = async () => {
    if (!user?.id || !selectedAssetId || !qty || !pendingOrderSide) return;

    try {
      const r = await fetch(`${API_URL}/trade/open`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          user_id: user.id,
          asset_id: Number(selectedAssetId),
          side: pendingOrderSide,
          quantity: Number(qty),
        }),
      });
      if (!r.ok) throw new Error("Erreur solde insuffisant");
      setQty("");
      setPendingOrderSide(null);
      await fetchOpenTrades();
    } catch (e) {
      alert(e.message);
    }
  };

  const closeTrade = async (tradeId, quantityToClose) => {
    try {
      const r = await fetch(`${API_URL}/trade/${tradeId}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quantity: Number(quantityToClose) }),
      });
      if (!r.ok) throw new Error("Erreur fermeture trade");
      await fetchOpenTrades();
    } catch (e) {
      alert(e.message);
    }
  };

  // Calcul de la valeur totale du portfolio (même méthode que le Dashboard)
  const totalPortfolioValue = useMemo(() => {
    // Utiliser p.value directement (comme dans positionsToKpis)
    const equity = positions.reduce((sum, p) => {
      return sum + Number(p.value ?? 0);
    }, 0);

    const cashAmount = Number(user?.cash || 0);
    const balance = cashAmount + equity;

    console.log('💼 Portfolio calc (Dashboard method):', { equity, cashAmount, balance });

    return balance;
  }, [positions, user?.cash]);

  // Trier et filtrer les trades avec calcul du PnL en temps réel
  const tradesWithPnL = useMemo(() => {
    return trades.map(trade => {
      // Trouver la position correspondante
      const position = positions.find(p => p.asset_id === trade.asset_id);

      return {
        ...trade,
        calculatedPnL: Number(position?.pnl || 0),
        calculatedValue: Number(position?.value || 0)
      };
    });
  }, [trades, positions]);

  const filteredAndSortedTrades = useMemo(() => {
    let result = [...tradesWithPnL];

    console.log('🔍 Filtering trades:', {
      totalTrades: result.length,
      filterProfitable,
      tradesWithPnL: result.map(t => ({ id: t.id, pnl: t.calculatedPnL, value: t.calculatedValue }))
    });

    // Filtre par profit/perte
    if (filterProfitable !== "all") {
      result = result.filter((trade) => {
        const pnl = trade.calculatedPnL;
        if (filterProfitable === "profit") return pnl >= 0;
        if (filterProfitable === "loss") return pnl < 0;
        return true;
      });

      console.log('🔍 After filter:', {
        remainingTrades: result.length,
        filter: filterProfitable
      });
    }

    // Tri
    result.sort((a, b) => {
      if (sortBy === "time") {
        // Plus récent en premier
        return new Date(b.opened_at || 0) - new Date(a.opened_at || 0);
      }

      if (sortBy === "symbol") {
        const symbolA = a.symbol || a.asset?.symbol || "";
        const symbolB = b.symbol || b.asset?.symbol || "";
        return symbolA.localeCompare(symbolB);
      }

      if (sortBy === "pnl") {
        return b.calculatedPnL - a.calculatedPnL; // Plus grand PnL en premier
      }

      if (sortBy === "value") {
        return b.calculatedValue - a.calculatedValue; // Plus grande valeur en premier
      }

      return 0;
    });

    return result;
  }, [tradesWithPnL, sortBy, filterProfitable]);

  if (loading) return <div className="p-6 text-center">Chargement…</div>;
  if (!user)
    return (
      <div className="p-6 text-center text-red-500">
        Vous devez être connecté pour accéder aux trades.
      </div>
    );

  return (
    <div className="p-6 space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Trading</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez vos positions et passez vos ordres
          </p>
        </div>
        {trades.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Positions ouvertes</div>
              <div className="text-lg font-bold text-card-foreground">{trades.length}</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Colonne gauche: Order form + Smart Assistant */}
        <div className="w-full lg:w-[36%] space-y-4">
        {/* Tuile ordre - Version collapsible */}
        <CardBase className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Header cliquable */}
          <div
            onClick={() => setIsOrderFormExpanded(!isOrderFormExpanded)}
            className="cursor-pointer p-4 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-card-foreground">Passer un ordre</h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedAsset ? `${selectedAsset.symbol} sélectionné` : 'Cliquez pour ouvrir'}
                  </p>
                </div>
              </div>
              {isOrderFormExpanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Formulaire dépliable */}
          {isOrderFormExpanded && (
            <div className="px-4 pb-4 space-y-4 animate-slideIn">
              <div className="h-px bg-border" />

              <div>
                <label className="form-label">Actif</label>
                <select
                  className="select"
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                >
                  <option value="">Choisir un actif</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.symbol}
                    </option>
                  ))}
                </select>
              </div>

              {/* Affichage du prix de l'actif */}
              {selectedAsset && assetPrice && (
                <div className="p-3 bg-accent/50 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Prix actuel</span>
                    <span className="text-lg font-semibold text-card-foreground">
                      ${Number(assetPrice).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="form-label">Quantité</label>
                <input
                  type="number"
                  min="0"
                  step="0.000001"
                  className="input"
                  placeholder="Ex: 0.005"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />
              </div>

              {/* Affichage de la valeur totale */}
              {selectedAsset && assetPrice && qty && Number(qty) > 0 && (
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Valeur totale</span>
                    <span className="text-xl font-bold text-primary">
                      ${(Number(qty) * Number(assetPrice)).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={() => handleBuyClick("BUY")}
                className="btn btn-brand w-full rounded-2xl"
              >
                Acheter
              </button>

              {/* Tuile cliquable pour analyser l'actif avec miniature chart */}
              {selectedAsset && (
                <div
                  onClick={() => setShowAnalysisModal(true)}
                  className="group cursor-pointer relative bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-xl overflow-hidden hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 h-24"
                >
                  {/* Mini chart en arrière-plan */}
                  <div className="absolute inset-0 opacity-30 group-hover:opacity-40 transition-opacity">
                    <MiniChart
                      symbol={selectedAsset.symbol}
                      tf="15m"
                      height={96}
                    />
                  </div>

                  {/* Contenu par-dessus */}
                  <div className="relative h-full flex items-center gap-3 p-4 bg-gradient-to-t from-violet-500/20 via-violet-500/10 to-transparent z-10">
                    <div className="w-12 h-12 bg-violet-500/40 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-card-foreground flex items-center gap-2 drop-shadow-sm">
                        Analyser {selectedAsset.symbol}
                        <TrendingUp className="w-4 h-4 text-violet-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <div className="text-sm text-card-foreground/80 drop-shadow-sm">
                        Voir les indicateurs et stratégies
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardBase>

        {/* Smart Trade Assistant */}
        <SmartTradeAssistant positions={positions} totalValue={totalPortfolioValue} />
      </div>

      {/* Colonne droite: KPIs + Positions ouvertes */}
      <div className="flex-1">
        {/* KPIs compacts */}
        <CompactKPIs positions={positions} cash={user?.cash || 0} />

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-card-foreground">
            Mes positions ({filteredAndSortedTrades.length})
          </h2>

          {trades.length > 0 && (
            <div className="flex items-center gap-2">
              {/* Filtre Profit/Perte */}
              <div className="flex items-center gap-1 bg-accent/50 border border-border rounded-lg p-1">
                <button
                  onClick={() => setFilterProfitable("all")}
                  className={`px-2.5 py-1 text-xs rounded transition-colors ${
                    filterProfitable === "all"
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:text-card-foreground"
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setFilterProfitable("profit")}
                  className={`px-2.5 py-1 text-xs rounded transition-colors ${
                    filterProfitable === "profit"
                      ? "bg-green-500 text-white font-medium"
                      : "text-muted-foreground hover:text-card-foreground"
                  }`}
                >
                  Profit
                </button>
                <button
                  onClick={() => setFilterProfitable("loss")}
                  className={`px-2.5 py-1 text-xs rounded transition-colors ${
                    filterProfitable === "loss"
                      ? "bg-red-500 text-white font-medium"
                      : "text-muted-foreground hover:text-card-foreground"
                  }`}
                >
                  Perte
                </button>
              </div>

              {/* Tri */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-accent/50 border border-border rounded-lg px-3 py-1.5 pr-8 text-xs text-card-foreground cursor-pointer hover:bg-accent transition-colors"
                >
                  <option value="time">Plus récent</option>
                  <option value="pnl">PnL (plus grand)</option>
                  <option value="value">Valeur (plus grande)</option>
                  <option value="symbol">Symbole (A-Z)</option>
                </select>
                <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {filteredAndSortedTrades.length === 0 && trades.length > 0 ? (
          <CardBase className="text-center py-12 bg-accent/30 border-2 border-dashed border-border">
            <div className="flex flex-col items-center gap-4">
              <Filter className="w-12 h-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  Aucune position ne correspond aux filtres
                </h3>
                <p className="text-sm text-muted-foreground">
                  Essayez de modifier vos critères de filtrage
                </p>
              </div>
            </div>
          </CardBase>
        ) : trades.length === 0 ? (
          <CardBase className="text-center py-12 bg-gradient-to-br from-primary/5 to-violet-500/5 border-2 border-dashed border-primary/20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Rocket className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  Aucune position ouverte
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Commencez à trader en sélectionnant un actif et en passant votre premier ordre.
                  Le Smart Assistant vous guidera dans vos décisions.
                </p>
              </div>
              <button
                onClick={() => setIsOrderFormExpanded(true)}
                className="btn btn-brand rounded-xl mt-2"
              >
                Passer mon premier ordre
              </button>
            </div>
          </CardBase>
        ) : (
          <div className="space-y-2">
            {filteredAndSortedTrades.map((pos) => (
              <PositionSummary key={pos.id} trade={pos} onClose={closeTrade} />
            ))}
          </div>
        )}
      </div>

      </div>

      {/* Modal d'analyse d'actif */}
      {showAnalysisModal && selectedAsset && (
        <AssetAnalysisModal
          symbol={selectedAsset.symbol}
          onClose={() => setShowAnalysisModal(false)}
        />
      )}

      {/* Modal de confirmation d'achat */}
      <ConfirmationModal
        isOpen={showBuyConfirmation}
        onClose={() => {
          setShowBuyConfirmation(false);
          setPendingOrderSide(null);
        }}
        onConfirm={placeOrder}
        title="Confirmer l'achat"
        type="buy"
        details={{
          symbol: selectedAsset?.symbol || "",
          quantity: Number(qty),
          price: assetPrice,
          total: Number(qty) * Number(assetPrice),
          side: pendingOrderSide,
        }}
      />
    </div>
  );
}

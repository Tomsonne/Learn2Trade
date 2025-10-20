import { useEffect, useMemo, useState, useCallback } from "react";
import CardBase from "../components/ui/CardBase";

const API_URL = "http://localhost:8000/api/v1";

// --------- Petites utils ---------
const fmt2 = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v ?? 0));

// ====== Carte position (avec slider) ======
function PositionCard({ trade, livePrice, onClose }) {
  const [closeQty, setCloseQty] = useState(0);

  const priceOpen = Number(trade.price_open);
  const qty = Number(trade.quantity);
  const side = trade.side;
  const px = Number(livePrice);

  const pnl = useMemo(() => {
    if (!Number.isFinite(px)) return null;
    const diff = side === "BUY" ? px - priceOpen : priceOpen - px;
    return diff * qty;
  }, [px, priceOpen, qty, side]);

  const pnlPct = useMemo(() => {
    if (!Number.isFinite(px) || !Number.isFinite(priceOpen) || priceOpen === 0) return null;
    const pct = side === "BUY" ? (px - priceOpen) / priceOpen : (priceOpen - px) / priceOpen;
    return pct * 100;
  }, [px, priceOpen, side]);

  const maxQty = qty > 0 ? qty : 0;
  const pnlClass = pnl == null ? "text-gray-500" : pnl >= 0 ? "text-green-600" : "text-red-600";

  return (
    <CardBase className="flex flex-col gap-3 bg-white">
      <div className="flex items-start justify-between">
        <div className="font-semibold">{trade.asset?.symbol || `#${trade.asset_id}`}</div>
        <div className={`text-sm ${pnlClass}`}>
          {pnl == null ? "—" : `${pnl >= 0 ? "+" : ""}${fmt2(pnl)} €`}
          {pnlPct == null ? "" : ` (${pnlPct >= 0 ? "+" : ""}${fmt2(pnlPct)}%)`}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 text-sm">
        <div className="text-gray-600">Côté</div>
        <div className="text-right font-medium">{side}</div>

        <div className="text-gray-600">Quantité</div>
        <div className="text-right">{fmt2(qty)}</div>

        <div className="text-gray-600">Prix d’achat</div>
        <div className="text-right">{fmt2(priceOpen)} €</div>

        <div className="text-gray-600">Prix actuel</div>
        <div className="text-right">{Number.isFinite(px) ? `${fmt2(px)} €` : "?"}</div>
      </div>

      {/* Slider fermeture partielle */}
      <div className="mt-2">
        <div className="flex items-center justify-between text-sm mb-1">
          <span>Quantité à fermer</span>
          <span className="font-medium">
            {fmt2(closeQty)} / {fmt2(maxQty)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={maxQty}
          step={maxQty >= 1 ? 0.001 : maxQty / 100 || 0.000001}
          value={closeQty}
          onChange={(e) => setCloseQty(clamp(Number(e.target.value), 0, maxQty))}
          className="w-full accent-orange-500"
        />
        <div className="flex gap-2 mt-1">
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setCloseQty(Number((maxQty * p).toFixed(6)))}
              className={`flex-1 text-xs py-1 rounded border hover:bg-gray-50 ${
                Math.abs(closeQty - maxQty * p) < maxQty * 0.01
                  ? "border-orange-500 text-orange-600"
                  : "border-gray-200 text-gray-700"
              }`}
            >
              {p * 100}%
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!closeQty || closeQty <= 0}
        onClick={() => onClose(trade.id, closeQty)}
        className={`w-full py-2 rounded-xl text-white mt-1 ${
          !closeQty || closeQty <= 0
            ? "bg-orange-300 cursor-not-allowed"
            : "bg-orange-500 hover:bg-orange-600"
        }`}
      >
        Fermer {fmt2(closeQty)} {trade.asset?.symbol || ""}
      </button>
    </CardBase>
  );
}

// ====== PAGE TRADES ======
export default function TradesPage() {
  const [user, setUser] = useState(null);
  const [assets, setAssets] = useState([]);
  const [pricesByAssetId, setPricesByAssetId] = useState({});
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [qty, setQty] = useState("");

  // Auth check
  useEffect(() => {
    fetch(`${API_URL}/auth/check`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.status === "ok" && data.user) setUser(data.user);
        else setUser(null);
      })
      .catch(() => setUser(null));
  }, []);

  // Assets + prix
  const fetchAssets = useCallback(async () => {
    try {
      const r = await fetch(`${API_URL}/assets`, { credentials: "include" });
      if (!r.ok) throw new Error(`assets ${r.status}`);
      const list = await r.json();
      if (Array.isArray(list)) {
        setAssets(list);
        const map = {};
        for (const a of list) {
          const id = Number(a.id);
          const price = Number(a.price);
          if (Number.isFinite(id) && Number.isFinite(price)) map[id] = price;
        }
        setPricesByAssetId(map);
      }
    } catch (e) {
      console.error("Erreur /assets:", e);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
    const itv = setInterval(fetchAssets, 3000);
    return () => clearInterval(itv);
  }, [fetchAssets]);

  // Positions ouvertes
  const fetchOpenTrades = useCallback(async () => {
    if (!user?.id) return;
    try {
      const r = await fetch(`${API_URL}/trade?userId=${user.id}&is_closed=false`, {
        credentials: "include",
      });
      const js = await r.json();
      const arr = js?.data || [];
      setPositions(arr.filter((t) => !t.is_closed));
    } catch (e) {
      console.error("Erreur /trade:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchOpenTrades();
  }, [user, fetchOpenTrades]);

  // Passage d'ordre
  const placeOrder = async (side) => {
    if (!user?.id || !selectedAssetId || !qty) {
      alert("Remplis l’actif et la quantité.");
      return;
    }
    try {
      const r = await fetch(`${API_URL}/trade/open`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          user_id: user.id,
          asset_id: Number(selectedAssetId),
          side,
          quantity: Number(qty),
        }),
      });
      if (!r.ok) throw new Error("Erreur ouverture trade");
      setQty("");
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

  if (loading) return <div className="p-6 text-center">Chargement…</div>;

  if (!user)
    return (
      <div className="p-6 text-center text-red-500">
        Vous devez être connecté pour accéder aux trades.
      </div>
    );

  return (
    <div className="p-6 flex gap-6 flex-col lg:flex-row">
      {/* Passage d’ordre */}
      <CardBase className="w-full lg:w-[36%] bg-white">
        <h2 className="text-xl font-semibold mb-4">Passer un ordre</h2>

        <label className="block text-sm mb-2">Actif</label>
        <select
          className="w-full border rounded p-2 mb-4"
          value={selectedAssetId}
          onChange={(e) => setSelectedAssetId(e.target.value)}
        >
          <option value="">Choisir un actif</option>
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.symbol} — {Number.isFinite(Number(a.price)) ? fmt2(a.price) : "?"} €
            </option>
          ))}
        </select>

        <label className="block text-sm mb-2">Quantité</label>
        <input
          type="number"
          min="0"
          step="0.000001"
          className="w-full border rounded p-2 mb-4"
          placeholder="Ex: 0.005"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />

        <div className="flex gap-3">
          <button
            onClick={() => placeOrder("BUY")}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl"
          >
            Acheter
          </button>
          <button
            onClick={() => placeOrder("SELL")}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl"
          >
            Vendre
          </button>
        </div>
      </CardBase>

      {/* Positions ouvertes */}
      <div className="flex-1">
        <h2 className="text-xl font-semibold mb-4">Mes positions (ouvertes)</h2>

        {positions.length === 0 ? (
          <div className="text-gray-600">Aucune position ouverte</div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-4">
            {positions.map((pos) => (
              <PositionCard
                key={pos.id}
                trade={pos}
                livePrice={pricesByAssetId[Number(pos.asset_id)]}
                onClose={closeTrade}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState, useCallback } from "react";
import CardBase from "../components/ui/CardBase";
import PositionCard from "../components/PositionCard.jsx";

const API_URL = window.location.hostname.includes("localhost")
  ? "http://localhost:8000/api/v1"
  : "https://skillvest-production.up.railway.app/api/v1";

export default function TradesPage() {
  const [user, setUser] = useState(null);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [qty, setQty] = useState("");
  const [assets, setAssets] = useState([]);

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
      const r = await fetch(
        `${API_URL}/trade?userId=${user.id}&is_closed=false`,
        { credentials: "include" }
      );
      const js = await r.json();
      setPositions(js?.data?.filter((t) => !t.is_closed) || []);
    } catch (e) {
      console.error("Erreur /trade:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchOpenTrades();
  }, [user, fetchOpenTrades]);

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
      if (!r.ok) throw new Error("Erreur solde insuffisant");
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
      {/* Carte ordre – alignée au thème */}
      <CardBase className="w-full lg:w-[36%] bg-card border border-border rounded-2xl">
        <h2 className="text-xl font-semibold mb-6 text-card-foreground">
          Passer un ordre
        </h2>

        <label className="form-label">Actif</label>
        <select
          className="select mb-4"
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

        <label className="form-label">Quantité</label>
        <input
          type="number"
          min="0"
          step="0.000001"
          className="input mb-5"
          placeholder="Ex: 0.005"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />

        <div className="flex gap-3">
          <button
            onClick={() => placeOrder("BUY")}
            className="btn btn-brand flex-1 rounded-2xl"
          >
            Acheter
          </button>
          <button
            onClick={() => placeOrder("SELL")}
            className="btn btn-danger flex-1 rounded-2xl"
          >
            Vendre
          </button>
        </div>
      </CardBase>

      {/* Positions ouvertes */}
      <div className="flex-1">
        <h2 className="text-xl font-semibold mb-4 text-card-foreground">
          Mes positions (ouvertes)
        </h2>

        {positions.length === 0 ? (
          <div className="text-muted">Aucune position ouverte</div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-4">
            {positions.map((pos) => (
              <PositionCard key={pos.id} trade={pos} onClose={closeTrade} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// src/pages/TradePage.jsx
import { useEffect, useState } from "react";

export default function TradePage() {
  const API_URL = "http://localhost:8000/api/v1";

  // === États principaux ===
  const [user, setUser] = useState(null);
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState("");
  const [amount, setAmount] = useState("");
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* -------------------------------------------------------------------------- */
  /* 🔹 Étape 1 : Vérification utilisateur connecté                             */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    fetch(`${API_URL}/auth/check`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok" && data.user) {
          setUser(data.user);
        } else {
          console.warn("Utilisateur non connecté");
          setUser(null);
        }
      })
      .catch((err) => {
        console.error("Erreur check utilisateur:", err);
        setUser(null);
      });
  }, []);

  /* -------------------------------------------------------------------------- */
  /* 🔹 Étape 2 : Récupération des actifs disponibles (BTC / ETH)               */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    fetch(`${API_URL}/assets`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur /assets (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setAssets(data);
        } else {
          console.error("Format inattendu de /assets:", data);
          setAssets([]);
        }
      })
      .catch((err) => {
        console.error("Erreur assets:", err);
        setError("Impossible de charger la liste des actifs.");
      })
      .finally(() => setLoading(false));
  }, []);

  /* -------------------------------------------------------------------------- */
  /* 🔹 Étape 3 : Récupération des trades ouverts                               */
  /* -------------------------------------------------------------------------- */
  const fetchPositions = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/trade?userId=${user.id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Erreur /trade (${res.status})`);
      const json = await res.json();
      setPositions(json.data || []);
    } catch (err) {
      console.error("Erreur positions:", err);
    }
  };

  useEffect(() => {
    if (user) fetchPositions();
  }, [user]);

  /* -------------------------------------------------------------------------- */
  /* 🔹 Étape 4 : Passer un ordre (BUY / SELL)                                  */
  /* -------------------------------------------------------------------------- */
  const placeOrder = async (side) => {
    if (!user || !selectedAsset || !amount) {
      alert("Remplis tous les champs avant de passer un ordre !");
      return;
    }

    const body = {
      user_id: user.id,
      asset_id: Number(selectedAsset),
      side,
      quantity: parseFloat(amount),
    };

    try {
      const res = await fetch(`${API_URL}/trade/open`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Erreur ouverture trade");
      }

      await fetchPositions();
      setAmount("");
    } catch (err) {
      alert(`Erreur: ${err.message}`);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 🔹 Étape 5 : Fermer un trade                                               */
  /* -------------------------------------------------------------------------- */
  const closeTrade = async (id) => {
    try {
      const res = await fetch(`${API_URL}/trade/${id}/close`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erreur fermeture trade");
      await fetchPositions();
    } catch (err) {
      alert(err.message);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 🔹 Rendu du composant                                                      */
  /* -------------------------------------------------------------------------- */
  if (loading) return <p className="p-6 text-center">Chargement...</p>;
  if (error)
    return <p className="p-6 text-center text-red-500">{error}</p>;
  if (!user)
    return (
      <p className="p-6 text-center text-red-500">
        Vous devez être connecté pour trader.
      </p>
    );

  return (
    <div className="p-6 flex flex-wrap gap-6">
      {/* === PASSER UN ORDRE === */}
      <div className="w-full md:w-1/2 bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Passer un ordre</h2>

        <label className="block mb-2 text-sm">Actif</label>
        <select
          className="w-full border p-2 rounded mb-4"
          value={selectedAsset}
          onChange={(e) => setSelectedAsset(e.target.value)}
        >
          <option value="">Choisir un actif</option>
          {assets.length > 0 ? (
            assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.symbol} — {a.price ? parseFloat(a.price).toFixed(2) : "?"} €
              </option>
            ))
          ) : (
            <option disabled>Aucun actif disponible</option>
          )}
        </select>

        <label className="block mb-2 text-sm">Quantité</label>
        <input
          type="number"
          className="w-full border p-2 rounded mb-4"
          placeholder="Ex: 0.005"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <div className="flex gap-4">
          <button
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl"
            onClick={() => placeOrder("BUY")}
          >
            Acheter
          </button>
          <button
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl"
            onClick={() => placeOrder("SELL")}
          >
            Vendre
          </button>
        </div>
      </div>

      {/* === MES POSITIONS === */}
      <div className="w-full md:w-1/2 bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Mes positions</h2>

        {positions.length === 0 && <p>Aucune position ouverte</p>}

        {positions.map((pos) => (
          <div
            key={pos.id}
            className="border border-gray-200 rounded-xl p-4 mb-4"
          >
            <div className="flex justify-between mb-2">
              <h3 className="font-semibold">{pos.asset?.symbol}</h3>
              <span
                className={
                  parseFloat(pos.pnl) >= 0
                    ? "text-green-600 font-medium"
                    : "text-red-600 font-medium"
                }
              >
                {pos.pnl
                  ? `${parseFloat(pos.pnl).toFixed(2)} €`
                  : "—"}
              </span>
            </div>

            <p>Quantité : {pos.quantity}</p>
            <p>Prix d’achat : {pos.price_open} €</p>
            <p>
              Prix actuel :{" "}
              {pos.asset?.price
                ? parseFloat(pos.asset.price).toFixed(2)
                : "?"} €
            </p>

            {!pos.is_closed && (
              <button
                onClick={() => closeTrade(pos.id)}
                className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl"
              >
                Fermer la position
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

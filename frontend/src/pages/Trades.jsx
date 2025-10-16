import { useEffect, useState } from "react";

export default function TradePage() {
  // === États principaux ===
  const [user, setUser] = useState(null);
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState("");
  const [amount, setAmount] = useState("");
  const [positions, setPositions] = useState([]);
  const [stopLoss, setStopLoss] = useState(false);
  const [takeProfit, setTakeProfit] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:8000/api/v1";

  // === 1️⃣ Vérifie l'utilisateur connecté ===
  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Utilisateur non connecté");
        return res.json();
      })
      .then((data) => {
        setUser(data);
      })
      .catch(() => setUser(null));
  }, []);

  // === 2️⃣ Récupère la liste des actifs ===
  useEffect(() => {
    fetch(`${API_URL}/assets`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur /assets");
        return res.json();
      })
      .then((data) => setAssets(data || []))
      .catch((err) => console.error("Erreur assets:", err))
      .finally(() => setLoading(false));
  }, []);

  // === 3️⃣ Récupère les positions ouvertes ===
  const fetchPositions = () => {
    if (!user) {
      console.warn("Utilisateur non identifié");
      return;
    }

    fetch(`${API_URL}/trades/user/${user.id}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur /trades/user");
        return res.json();
      })
      .then((data) => setPositions(data || []))
      .catch((err) => console.error("Erreur positions:", err));
  };

  useEffect(() => {
    if (user) fetchPositions();
  }, [user]);

  // === 4️⃣ Passer un ordre ===
  const placeOrder = (side) => {
    if (!user || !selectedAsset || !amount) {
      alert("Remplis tous les champs avant de trader !");
      return;
    }

    const body = {
      user_id: user.id,
      asset_id: selectedAsset,
      side,
      quantity: parseFloat(amount),
      stop_loss: stopLoss,
      take_profit: takeProfit,
    };

    fetch(`${API_URL}/trades`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur création trade");
        return res.json();
      })
      .then(() => fetchPositions())
      .catch((err) => console.error("Erreur trade:", err));
  };

  // === 5️⃣ Fermer un trade ===
  const closeTrade = (tradeId) => {
    fetch(`${API_URL}/trades/${tradeId}/close`, {
      method: "PUT",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur fermeture trade");
        return res.json();
      })
      .then(() => fetchPositions())
      .catch((err) => console.error("Erreur close trade:", err));
  };

  // === 6️⃣ Rendu ===
  if (loading) {
    return (
      <div className="p-6 text-center">
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">
          Vous devez être connecté pour accéder aux trades.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 flex gap-6 flex-wrap">
      {/* === PASSER UN ORDRE === */}
      <div className="w-full md:w-1/2 bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Passer un ordre</h2>

        <label className="block text-sm mb-2">Actif</label>
        <select
          className="w-full border p-2 rounded mb-4"
          onChange={(e) => setSelectedAsset(e.target.value)}
          value={selectedAsset}
        >
          <option value="">Choisir un actif</option>
          {assets.length > 0 ? (
            assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.symbol || "?"} —{" "}
                {typeof a.price === "number" ? a.price.toFixed(2) : "?"} €
              </option>
            ))
          ) : (
            <option disabled>Aucun actif disponible</option>
          )}
        </select>

        <label className="block text-sm mb-2">Montant (€)</label>
        <input
          type="number"
          className="w-full border p-2 rounded mb-4"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={stopLoss}
              onChange={() => setStopLoss(!stopLoss)}
            />
            Stop Loss
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={takeProfit}
              onChange={() => setTakeProfit(!takeProfit)}
            />
            Take Profit
          </label>
        </div>

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

      {/* === POSITIONS OUVERTES === */}
      <div className="w-full md:w-1/2 bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Mes positions</h2>

        {positions.length === 0 && <p>Aucune position ouverte</p>}

        {positions.map((pos) => {
          const profit =
            typeof pos.profit_loss === "number"
              ? pos.profit_loss.toFixed(2)
              : "0.00";
          const percent =
            typeof pos.pnl_percent === "number"
              ? pos.pnl_percent.toFixed(2)
              : "0.00";
          const price = pos.asset?.price ?? "?";
          const symbol = pos.asset?.symbol ?? "?";

          return (
            <div key={pos.id} className="border rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{symbol}</h3>
                <span
                  className={`text-sm ${
                    pos.profit_loss >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {profit} € ({percent}%)
                </span>
              </div>

              <p>Quantité : {pos.quantity ?? "?"}</p>
              <p>Prix d’achat : {pos.entry_price ?? "?"} €</p>
              <p>Prix actuel : {price} €</p>

              <button
                className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl"
                onClick={() => closeTrade(pos.id)}
              >
                Fermer la position
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

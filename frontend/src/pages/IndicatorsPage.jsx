import React, { useMemo, useState, useEffect } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from "recharts";
import { BookOpen, TrendingUp, TrendingDown, BarChart3, Target, Info, LogOut } from "lucide-react";
import { useMarketSeries } from "../hooks/useMarketSeries.js";
import CandleLite from "../components/CandleLite.jsx";
import { TF, resampleOHLC } from "../utils/ohlc.js";
import { glossaryTerms } from "../data/glossary.js";
import { strategies } from "../data/strategies.js";
import StrategiesSection from "../components/StrategiesSection.jsx";
import RsiCard from "../components/cards/RsiCard.jsx";
import MaCard from "../components/cards/MaCard.jsx";
import CourseSection from "../components/CourseSection.jsx";
import { logout, checkAuth } from "../api.js"; // ✅ ajouté
import { useNavigate } from "react-router-dom"; // ✅ ajouté

/* ------------------------------- Helpers UI ------------------------------- */
const getRSISignal = (v) => {
  if (v > 70) return { text: "Surachat – Risque de correction", color: "text-red-600", bg: "bg-red-50", icon: TrendingDown };
  if (v < 30) return { text: "Survente – Potentiel de rebond",  color: "text-green-600", bg: "bg-green-50", icon: TrendingUp };
  return { text: "Zone neutre", color: "text-gray-600", bg: "bg-gray-50", icon: BarChart3 };
};

const getMASignal = (ma20, ma50) => {
  if (ma20 > ma50) return { text: "Tendance Haussière", color: "text-green-600", bg: "bg-green-50", icon: TrendingUp };
  if (ma20 < ma50) return { text: "Tendance Baissière", color: "text-red-600", bg: "bg-red-50", icon: TrendingDown };
  return { text: "Tendance Neutre", color: "text-gray-600", bg: "bg-gray-50", icon: BarChart3 };
};

const RANGE_BY_TF = { "1h": "1d", "4h": "7d", "12h": "14d", "1d": "90d" };

export function IndicatorsPage() {
  const [activeSection, setActiveSection] = useState("live");
  const [selectedStrategy, setSelectedStrategy] = useState(strategies[0]);
  const [tf, setTf] = useState("1h");
  const [symbol, setSymbol] = useState("BTC");

  const navigate = useNavigate(); // ✅ ajouté
  const [user, setUser] = useState(null); // ✅ ajouté

  // ✅ Vérifie la session (cookie)
  useEffect(() => {
    async function verify() {
      const res = await checkAuth();
      if (res.status === "ok") {
        setUser(res.user);
      } else {
        navigate("/login");
      }
    }
    verify();
  }, []);

  // ✅ Déconnexion
  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  // ------------------ Données marché ------------------
  const { data: series = [], loading, error } = useMarketSeries({
    symbol,
    vs: "usd",
    tf,
    days: RANGE_BY_TF[tf],
    preferOHLCFor1d: true,
    refreshMs: 60_000,
  });

  useEffect(() => {
    if (series.length) console.log("SAMPLE row:", series[0]);
  }, [series]);

  const baseOHLC = useMemo(
    () =>
      series
        .filter(d => d?.ts != null && d?.o != null && d?.h != null && d?.l != null && d?.c != null)
        .map(d => ({ ts: +d.ts, o: +d.o, h: +d.h, l: +d.l, c: +d.c })),
    [series]
  );

  const bucketSec = TF[tf] ?? TF["1h"];
  const ohlcTF = useMemo(() => resampleOHLC(baseOHLC, bucketSec), [baseOHLC, bucketSec]);
  const candles = useMemo(() => ohlcTF.map(r => ({ time: Math.floor(r.ts / 1000), open: r.o, high: r.h, low: r.l, close: r.c })), [ohlcTF]);

  const currentData = series[series.length - 1] || {};
  const currentRSI = currentData?.rsi ?? null;
  const currentPrice = series.at(-1)?.price ?? null;
  const currentMA20 = currentData?.ma20 ?? null;
  const currentMA50 = currentData?.ma50 ?? null;

  const nf = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  const fmt = (v) => (v == null ? "—" : nf.format(Number(v)));

  const rsiSignal = useMemo(() => getRSISignal(currentRSI ?? 50), [currentRSI]);
  const maSignal  = useMemo(() => getMASignal(currentMA20 ?? 0, currentMA50 ?? 0), [currentMA20, currentMA50]);

  const menuItems = [
    { id: "course",     label: "Cours pour Débutants",  icon: BookOpen },
    { id: "strategies", label: "Stratégies Détaillées", icon: Target },
    { id: "live",       label: "Analyse en Temps Réel", icon: BarChart3 },
    { id: "glossary",   label: "Glossaire",             icon: Info },
  ];

  // ----------------------------- Section Glossaire -----------------------------
  const renderGlossarySection = () => (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {glossaryTerms.map((term, i) => (
            <div key={i} className="bg-accent rounded-xl p-6">
              <h3 className="font-medium text-accent-foreground mb-3">{term.term}</h3>
              <p className="text-sm text-muted-foreground mb-4">{term.definition}</p>
              <div className="bg-[#007aff]/10 p-3 rounded-lg">
                <div className="text-xs font-medium text-[#007aff] mb-1">💡 Utilisation pratique :</div>
                <div className="text-sm text-muted-foreground">{term.usage}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ----------------------------- Section LIVE -----------------------------
  const renderLiveSection = () => {
    return (
      <div className="space-y-6">
        {loading && <div className="text-sm text-muted-foreground">Mise à jour des données temps réel…</div>}
        {error &&   <div className="text-sm text-red-600">Erreur données live : {error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RsiCard series={series} rsiSignal={rsiSignal} currentRSI={currentRSI} />
          <MaCard  series={series} maSignal={maSignal} fmt={fmt} ma20={currentMA20} ma50={currentMA50} price={currentPrice} />
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="text-lg font-medium text-card-foreground mb-6">Graphique BTC/USD — Chandeliers</h3>
          <div className="h-96">
            {candles.length >= 2 ? (
              <CandleLite data={candles} height={384} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series}>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Area type="monotone" dataKey="price" stroke="#007aff" strokeWidth={2} fill="#007aff" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ------------------------------- Layout -------------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-2xl p-6 border border-border flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium text-card-foreground">Apprendre nos Stratégies</h1>
          <p className="text-sm text-muted-foreground">Cours interactif • Trading éducatif • Sans risque</p>
        </div>

        {/* ✅ Bouton Déconnexion */}
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-sm text-muted-foreground">Connecté : {user.email}</span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="flex gap-2">
          {menuItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              aria-pressed={activeSection === id}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeSection === id ? "bg-[#007aff] text-white" : "bg-accent text-accent-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sections */}
      {activeSection === "course" && <CourseSection />}
      {activeSection === "strategies" && (
        <StrategiesSection
          strategies={strategies}
          selectedStrategy={selectedStrategy}
          setSelectedStrategy={setSelectedStrategy}
        />
      )}
      {activeSection === "live" && renderLiveSection()}
      {activeSection === "glossary" && renderGlossarySection()}
    </div>
  );
}

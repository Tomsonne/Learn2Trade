import { useState, useMemo } from 'react';
import { PieChart, Lightbulb, AlertCircle, ChevronRight } from 'lucide-react';
import CardBase from './ui/CardBase';
import CryptoLogo from './CryptoLogo';
import { useCryptoData } from '../hooks/useCryptoData';

const TABS = [
  { id: 'analytics', label: 'Analytics', icon: PieChart },
  { id: 'suggestions', label: 'Suggestions AI', icon: Lightbulb },
];

// Estimation RSI simplifié basé sur le changement 24h
const estimateRSI = (change24h) => {
  // RSI simplifié: plus le changement est positif, plus RSI est élevé
  // Mapping approximatif: -10% -> RSI 20, 0% -> RSI 50, +10% -> RSI 80
  const rsi = 50 + (change24h * 3);
  return Math.max(0, Math.min(100, rsi));
};

// Calcul du score de confiance basé sur les indicateurs
const calculateConfidence = (rsi, change24h, volume24h) => {
  let score = 50; // Base neutre

  // RSI
  if (rsi < 30) score += 20; // Survente = bon signal achat
  else if (rsi > 70) score -= 20; // Surachat = mauvais signal achat
  else if (rsi >= 40 && rsi <= 60) score += 10; // Zone neutre = stable

  // Tendance 24h
  if (change24h > 5) score += 10; // Forte hausse
  else if (change24h < -5) score -= 10; // Forte baisse

  // Volume (si élevé = plus de confiance)
  if (volume24h > 1000000000) score += 10;

  return Math.max(0, Math.min(100, score));
};

export default function SmartTradeAssistant({ positions = [], totalValue = 0 }) {
  const [activeTab, setActiveTab] = useState('analytics');

  // Récupération des données crypto en temps réel
  const { data: cryptoData, loading: cryptoLoading } = useCryptoData();

  // Analytics calculées
  const analytics = useMemo(() => {
    const positionsArray = Array.isArray(positions) ? positions : [];

    console.log('📊 Positions reçues:', positionsArray);
    console.log('💰 Total value:', totalValue);

    // Répartition des actifs (utiliser p.value directement, comme le Dashboard)
    const distribution = positionsArray.reduce((acc, pos) => {
      const symbol = pos.symbol || pos.asset?.symbol;
      if (!symbol) {
        console.log('⚠️ Position sans symbole:', pos);
        return acc;
      }

      // Utiliser la valeur directement depuis la position (comme positionsToKpis)
      const value = Number(pos.value ?? 0);

      console.log(`💵 ${symbol}: value=${value}`);

      if (!acc[symbol]) acc[symbol] = 0;
      acc[symbol] += value;
      return acc;
    }, {});

    console.log('📈 Distribution calculée:', distribution);

    // Top gainer/loser (depuis les vraies données crypto)
    const cryptos = Object.entries(cryptoData).map(([symbol, data]) => ({
      symbol,
      change: data.change24h,
    }));
    const topGainer = cryptos.length > 0
      ? cryptos.reduce((max, c) => c.change > max.change ? c : max, cryptos[0])
      : { symbol: '-', change: 0 };
    const topLoser = cryptos.length > 0
      ? cryptos.reduce((min, c) => c.change < min.change ? c : min, cryptos[0])
      : { symbol: '-', change: 0 };

    // Win rate
    const closedTrades = positionsArray.filter(p => p.is_closed);
    const winningTrades = closedTrades.filter(p => (p.pnl || 0) > 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;

    // Calculer equity et cash (méthode Dashboard)
    const equity = Object.values(distribution).reduce((sum, val) => sum + val, 0);
    const cashValue = Math.max(0, totalValue - equity);

    console.log('💵 Cash calculé:', { totalValue, equity, cashValue });

    return {
      distribution,
      topGainer,
      topLoser,
      winRate,
      totalTrades: closedTrades.length,
      cashValue,
    };
  }, [positions, cryptoData, totalValue]);

  // Suggestions AI
  const suggestions = useMemo(() => {
    if (!cryptoData || Object.keys(cryptoData).length === 0) return [];

    return Object.entries(cryptoData).map(([symbol, data]) => {
      const rsi = estimateRSI(data.change24h);
      const confidence = calculateConfidence(rsi, data.change24h, data.volume);

      let action = 'HOLD';
      let reason = [];

      // Signal basé sur RSI et tendance 24h
      if (rsi < 30 && data.change24h > 0) {
        action = 'BUY';
        reason.push(`RSI en survente (${rsi.toFixed(0)})`);
        reason.push(`Tendance positive (+${data.change24h.toFixed(1)}%)`);
      } else if (rsi > 70 && data.change24h < 0) {
        action = 'SELL';
        reason.push(`RSI en surachat (${rsi.toFixed(0)})`);
        reason.push(`Tendance négative (${data.change24h.toFixed(1)}%)`);
      } else if (rsi < 35) {
        action = 'BUY';
        reason.push(`RSI bas (${rsi.toFixed(0)}) - Survente`);
      } else if (rsi > 65) {
        action = 'SELL';
        reason.push(`RSI élevé (${rsi.toFixed(0)}) - Surachat`);
      } else {
        reason.push(`RSI neutre (${rsi.toFixed(0)})`);
        if (data.change24h > 0) reason.push(`+${data.change24h.toFixed(1)}% (24h)`);
        else reason.push(`${data.change24h.toFixed(1)}% (24h)`);
      }

      // Ajouter info volume si pertinent
      if (data.volume > 1000000000) {
        reason.push(`Volume élevé (${(data.volume / 1e9).toFixed(1)}B USD)`);
      }

      return {
        symbol,
        action,
        confidence,
        reasons: reason,
        rsi,
        price: data.price,
        change24h: data.change24h,
      };
    }).sort((a, b) => b.confidence - a.confidence);
  }, [cryptoData]);

  const renderAnalytics = () => (
    <div className="space-y-4">
      {/* Performance */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-accent rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">🔥 Top Gainer (24h)</div>
          <div className="font-semibold text-card-foreground">{analytics.topGainer.symbol}</div>
          <div className="text-sm text-green-600">+{analytics.topGainer.change.toFixed(1)}%</div>
        </div>
        <div className="bg-accent rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">📉 Top Loser (24h)</div>
          <div className="font-semibold text-card-foreground">{analytics.topLoser.symbol}</div>
          <div className="text-sm text-red-600">{analytics.topLoser.change.toFixed(1)}%</div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-accent rounded-lg p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Win Rate</span>
          <span className="font-semibold text-card-foreground">{analytics.winRate.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${analytics.winRate}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground">
          {analytics.totalTrades > 0 ? `Sur ${analytics.totalTrades} trades fermés` : 'Aucun trade fermé'}
        </div>
      </div>

      {/* Distribution */}
      {(Object.keys(analytics.distribution).length > 0 || analytics.cashValue > 0) && (
        <div className="bg-accent rounded-lg p-4">
          <div className="text-sm font-medium text-card-foreground mb-3">Répartition des Actifs</div>
          <div className="space-y-2">
            {Object.entries(analytics.distribution)
              .sort(([, a], [, b]) => b - a)
              .map(([symbol, value]) => {
                const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
                return (
                  <div key={symbol}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{symbol}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-card-foreground font-medium">
                          ${value.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-muted-foreground">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            {analytics.cashValue > 0 && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Cash (USD)</span>
                  <div className="flex items-center gap-2">
                    <span className="text-card-foreground font-medium">
                      ${analytics.cashValue.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-muted-foreground">
                      ({totalValue > 0 ? ((analytics.cashValue / totalValue) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className="bg-green-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${totalValue > 0 ? (analytics.cashValue / totalValue) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderSuggestions = () => {
    if (cryptoLoading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl p-4 border border-border bg-accent/30">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg skeleton" />
                  <div className="flex-1">
                    <div className="skeleton-title w-24 mb-2" />
                    <div className="skeleton-text w-32" />
                  </div>
                </div>
                <div className="skeleton w-16 h-6 rounded-full" />
              </div>
              <div className="mb-3">
                <div className="skeleton-text w-full mb-1" />
                <div className="skeleton h-2 w-full rounded-full" />
              </div>
              <div className="space-y-1">
                <div className="skeleton-text w-3/4" />
                <div className="skeleton-text w-2/3" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (suggestions.length === 0) {
      return (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <div className="text-sm">Aucune suggestion disponible</div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {suggestions.map((suggestion) => {
        const actionColor = suggestion.action === 'BUY' ? 'text-green-600' :
                           suggestion.action === 'SELL' ? 'text-red-600' : 'text-yellow-600';
        const bgColor = suggestion.action === 'BUY' ? 'bg-green-500/10 border-green-500/30' :
                       suggestion.action === 'SELL' ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30';

        return (
          <div key={suggestion.symbol} className={`rounded-xl p-4 border ${bgColor}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <CryptoLogo symbol={suggestion.symbol} size="md" />
                <div>
                  <div className="font-semibold text-card-foreground">{suggestion.symbol}</div>
                  <div className="text-xs text-muted-foreground">
                    ${suggestion.price.toLocaleString('fr-FR')}
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${actionColor} bg-card`}>
                {suggestion.action}
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Confiance</span>
                <span className={`font-semibold ${actionColor}`}>{suggestion.confidence}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    suggestion.action === 'BUY' ? 'bg-green-500' :
                    suggestion.action === 'SELL' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${suggestion.confidence}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              {suggestion.reasons.map((reason, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
    );
  };

  return (
    <CardBase className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">Smart Assistant</h3>
            <p className="text-xs text-muted-foreground">Analyse IA en temps réel</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-accent text-accent-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'suggestions' && renderSuggestions()}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertCircle className="w-3 h-3" />
          <span>Données éducatives • Pas de conseils financiers</span>
        </div>
      </div>
    </CardBase>
  );
}

import { useState, useMemo } from 'react';
import { PieChart, Lightbulb, AlertCircle, ChevronRight, TrendingUp, TrendingDown, AlertTriangle, Activity } from 'lucide-react';
import CardBase from './ui/CardBase';
import CryptoLogo from './CryptoLogo';
import MiniChart from './MiniChart';
import { useCryptoData } from '../hooks/useCryptoData';
import { useAdvancedSignals } from '../hooks/useAdvancedSignals';

const TABS = [
  { id: 'analytics', label: 'Analytics', icon: PieChart },
  { id: 'suggestions', label: 'Suggestions AI', icon: Lightbulb },
  { id: 'alerts', label: 'Alertes', icon: AlertTriangle },
];

// Calcul du score de confiance basé sur les indicateurs réels
const calculateConfidence = (change24h, volume24h) => {
  let score = 50; // Base neutre

  // Tendance 24h (facteur le plus important)
  const absChange = Math.abs(change24h);
  if (absChange > 10) score += 30; // Très forte variation = signal fort
  else if (absChange > 5) score += 20; // Forte variation
  else if (absChange > 2) score += 10; // Variation modérée
  else score -= 10; // Faible variation = incertitude

  // Volume (indicateur de conviction du marché)
  if (volume24h > 5000000000) score += 20; // Volume très élevé
  else if (volume24h > 1000000000) score += 10; // Volume élevé
  else score -= 5; // Volume faible = moins fiable

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
    const winningTrades = closedTrades.filter(p => (p.unrealized_pnl_abs || 0) > 0);
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

  // Suggestions AI avec alertes basées sur les positions
  const suggestions = useMemo(() => {
    if (!cryptoData || Object.keys(cryptoData).length === 0) return [];

    const positionsArray = Array.isArray(positions) ? positions : [];
    console.log('🔍 [SmartAssistant] Positions reçues:', positionsArray.length, positionsArray);

    const positionsMap = positionsArray.reduce((acc, pos) => {
      const symbol = pos.symbol || pos.asset?.symbol;
      if (symbol) {
        acc[symbol] = pos;
        console.log(`📍 [SmartAssistant] Position ${symbol}:`, {
          unrealized_pnl_abs: pos.unrealized_pnl_abs,
          unrealized_pnl_pct: pos.unrealized_pnl_pct,
          value: pos.value
        });
      }
      return acc;
    }, {});

    return Object.entries(cryptoData).map(([symbol, data]) => {
      const confidence = calculateConfidence(data.change24h, data.volume);
      const hasPosition = !!positionsMap[symbol];
      const position = positionsMap[symbol];

      let action = 'HOLD';
      let reason = [];
      let alerts = [];

      // Alertes basées sur les positions actuelles
      if (hasPosition) {
        const pnl = Number(position?.unrealized_pnl_abs || 0);
        const pnlPct = Number(position?.unrealized_pnl_pct || 0);

        // Alerte si grosse perte sur position ouverte (seuil à -5% au lieu de -10%)
        if (pnl < 0 && pnlPct < -5) {
          alerts.push({
            type: 'danger',
            message: `Position en perte ${pnlPct.toFixed(1)}% - Envisager stop-loss`
          });
        }
        // Alerte si bon profit à sécuriser (seuil à +8% au lieu de +15%)
        else if (pnl > 0 && pnlPct > 8) {
          alerts.push({
            type: 'success',
            message: `Position en profit ${pnlPct.toFixed(1)}% - Envisager prise de bénéfices`
          });
        }

        // Alerte basée sur la tendance 24h pour les positions
        if (data.change24h < -5) {
          // Forte baisse sur une position
          alerts.push({
            type: 'warning',
            message: `Forte baisse (-${Math.abs(data.change24h).toFixed(1)}%) - Surveiller la position`
          });
        } else if (data.change24h > 5 && pnl > 0) {
          // Forte hausse + position profitable
          alerts.push({
            type: 'success',
            message: `Forte hausse (+${data.change24h.toFixed(1)}%) - Opportunité de vente`
          });
        }
      }

      // Signal basé sur la tendance 24h (plus fiable que RSI estimé)
      if (data.change24h > 5) {
        // Forte hausse
        action = 'BUY';
        reason.push(`Forte hausse +${data.change24h.toFixed(1)}% (24h)`);
        reason.push(`Momentum positif détecté`);
      } else if (data.change24h < -5) {
        // Forte baisse
        action = 'SELL';
        reason.push(`Forte baisse ${data.change24h.toFixed(1)}% (24h)`);
        reason.push(`Tendance baissière confirmée`);
      } else if (data.change24h > 2) {
        // Hausse modérée
        action = 'BUY';
        reason.push(`Tendance haussière +${data.change24h.toFixed(1)}% (24h)`);
      } else if (data.change24h < -2) {
        // Baisse modérée
        action = 'SELL';
        reason.push(`Tendance baissière ${data.change24h.toFixed(1)}% (24h)`);
      } else {
        // Stable
        reason.push(`Marché stable ${data.change24h >= 0 ? '+' : ''}${data.change24h.toFixed(1)}% (24h)`);
        reason.push(`Attendre un signal plus clair`);
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
        alerts,
        price: data.price,
        change24h: data.change24h,
        hasPosition,
        position,
      };
    }).sort((a, b) => {
      // Prioriser les alertes en premier
      if (a.alerts.length > 0 && b.alerts.length === 0) return -1;
      if (a.alerts.length === 0 && b.alerts.length > 0) return 1;
      // Puis par confiance
      return b.confidence - a.confidence;
    });
  }, [cryptoData, positions]);

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

  const renderAlerts = () => {
    const alertSuggestions = suggestions.filter(s => s.alerts && s.alerts.length > 0);
    const hasPositions = Array.isArray(positions) && positions.length > 0;

    if (cryptoLoading) {
      return (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <div className="text-sm">Chargement...</div>
        </div>
      );
    }

    if (alertSuggestions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className={`w-16 h-16 ${hasPositions ? 'bg-green-500/10' : 'bg-blue-500/10'} rounded-full flex items-center justify-center mb-4`}>
            {hasPositions ? (
              <TrendingUp className="w-8 h-8 text-green-600" />
            ) : (
              <Lightbulb className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <h3 className="font-semibold text-card-foreground mb-2">
            {hasPositions ? 'Aucune alerte' : 'Aucune position ouverte'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {hasPositions
              ? 'Vos positions sont dans les zones normales. Les alertes apparaîtront ici si une action est recommandée.'
              : 'Ouvrez des positions pour recevoir des alertes personnalisées sur vos investissements.'
            }
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {alertSuggestions.map((suggestion) => {
          const pnlPct = Number(suggestion.position?.unrealized_pnl_pct || 0);
          const pnl = Number(suggestion.position?.unrealized_pnl_abs || 0);

          return (
            <div key={suggestion.symbol} className="rounded-xl border border-border bg-card overflow-hidden">
              {/* En-tête avec crypto et PnL */}
              <div className="p-4 bg-accent/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CryptoLogo symbol={suggestion.symbol} size="md" />
                    <div>
                      <div className="font-semibold text-card-foreground">{suggestion.symbol}</div>
                      <div className="text-xs text-muted-foreground">
                        ${suggestion.price.toLocaleString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                    </div>
                    <div className={`text-xs ${pnl >= 0 ? 'text-green-600/80' : 'text-red-600/80'}`}>
                      {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Alertes */}
              <div className="p-4 space-y-2">
                {suggestion.alerts.map((alert, i) => {
                  const alertBg = alert.type === 'danger' ? 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400' :
                                  alert.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400' :
                                  'bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400';
                  const AlertIcon = alert.type === 'danger' ? AlertTriangle :
                                   alert.type === 'success' ? TrendingUp : TrendingDown;

                  return (
                    <div key={i} className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border ${alertBg}`}>
                      <AlertIcon className="w-5 h-5 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-medium mb-1">{alert.message}</div>
                        <div className="text-xs opacity-80">
                          Signal {suggestion.action} • Confiance {suggestion.confidence}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

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
        const hasAlerts = suggestion.alerts && suggestion.alerts.length > 0;

        return (
          <div key={suggestion.symbol} className={`rounded-xl border ${bgColor} overflow-hidden`}>
            {/* Alertes en haut si position ouverte */}
            {hasAlerts && (
              <div className="px-4 pt-3 pb-2 space-y-1.5">
                {suggestion.alerts.map((alert, i) => {
                  const alertBg = alert.type === 'danger' ? 'bg-red-500/20 border-red-500/40 text-red-700 dark:text-red-400' :
                                  alert.type === 'success' ? 'bg-green-500/20 border-green-500/40 text-green-700 dark:text-green-400' :
                                  'bg-yellow-500/20 border-yellow-500/40 text-yellow-700 dark:text-yellow-400';
                  const AlertIcon = alert.type === 'danger' ? AlertTriangle :
                                   alert.type === 'success' ? TrendingUp : TrendingDown;

                  return (
                    <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${alertBg}`}>
                      <AlertIcon className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-medium">{alert.message}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Contenu principal avec mini-chart */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <CryptoLogo symbol={suggestion.symbol} size="md" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-card-foreground">{suggestion.symbol}</div>
                      {suggestion.hasPosition && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded-full">
                          Position ouverte
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${suggestion.price.toLocaleString('fr-FR')}
                      <span className={`ml-2 font-medium ${suggestion.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {suggestion.change24h >= 0 ? '+' : ''}{suggestion.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${actionColor} bg-card shadow-sm`}>
                  {suggestion.action}
                </div>
              </div>

              {/* Mini chart */}
              <div className="mb-3 rounded-lg overflow-hidden border border-border/50 bg-accent/30">
                <MiniChart
                  symbol={suggestion.symbol}
                  tf="1h"
                  height={80}
                />
              </div>

              {/* Barre de confiance */}
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

              {/* Raisons */}
              <div className="space-y-1">
                {suggestion.reasons.map((reason, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
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
          const alertCount = tab.id === 'alerts' ? suggestions.filter(s => s.alerts?.length > 0).length : 0;
          const hasAlerts = alertCount > 0;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-accent text-accent-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.id === 'alerts' && hasAlerts && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  {alertCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'suggestions' && renderSuggestions()}
        {activeTab === 'alerts' && renderAlerts()}
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

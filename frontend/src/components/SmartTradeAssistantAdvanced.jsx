import { useState, useMemo } from 'react';
import { PieChart, Lightbulb, AlertCircle, ChevronRight, TrendingUp, TrendingDown, AlertTriangle, Activity, Target } from 'lucide-react';
import CardBase from './ui/CardBase';
import CryptoLogo from './CryptoLogo';
import MiniChart from './MiniChart';
import { useCryptoData } from '../hooks/useCryptoData';
import { useMarketSeries } from '../hooks/useMarketSeries';
import {
  calculateFibonacciLevels,
  analyzeBollingerBands,
  analyzeFibonacciPosition,
  calculateConfluence
} from '../utils/advancedIndicators';

const TABS = [
  { id: 'analytics', label: 'Analytics', icon: PieChart },
  { id: 'suggestions', label: 'AI Pro', icon: Lightbulb },
  { id: 'alerts', label: 'Alertes', icon: AlertTriangle },
];

// Composant pour afficher un indicateur technique
function TechnicalIndicator({ label, value, signal }) {
  const colors = {
    BUY: 'text-green-600',
    SELL: 'text-red-600',
    HOLD: 'text-yellow-600',
  };

  return (
    <div className="flex items-center justify-between text-xs py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${colors[signal] || 'text-card-foreground'}`}>
        {value}
      </span>
    </div>
  );
}

// Hook personnalisé pour une crypto avec tous ses indicateurs
function useCryptoAdvancedAnalysis(symbol, cryptoData) {
  const data = cryptoData[symbol];
  const { data: series, loading } = useMarketSeries({ symbol, tf: '1h' });

  return useMemo(() => {
    if (!data || !series || series.length === 0 || loading) {
      return null;
    }

    const latest = series[series.length - 1];
    const price = data.price;
    const change24h = data.change24h;

    // Calculer les indicateurs avancés
    const fibonacci = calculateFibonacciLevels(series, 100);
    const bbSignal = analyzeBollingerBands(series, price);
    const fibSignal = analyzeFibonacciPosition(price, fibonacci);
    const rsi = latest?.rsi ?? null;

    // Score de confluence
    const confluence = calculateConfluence({
      rsi,
      bbSignal,
      fibSignal,
      change24h,
    });

    return {
      price,
      change24h,
      volume: data.volume,
      action: confluence.action,
      confidence: confluence.confidence,
      reasons: confluence.reasons,
      scores: confluence.scores,
      indicators: {
        rsi,
        fibonacci,
        bollingerBands: {
          upper: latest?.bbUpper,
          middle: latest?.bbMiddle,
          lower: latest?.bbLower,
          signal: bbSignal,
        },
        sma20: latest?.ma20,
        sma50: latest?.ma50,
      },
    };
  }, [symbol, data, series, loading]);
}

export default function SmartTradeAssistantAdvanced({ positions = [], totalValue = 0 }) {
  const [activeTab, setActiveTab] = useState('suggestions');
  const { data: cryptoData, loading: cryptoLoading } = useCryptoData();

  // Analytics calculées (identique à la version originale)
  const analytics = useMemo(() => {
    const positionsArray = Array.isArray(positions) ? positions : [];

    const distribution = positionsArray.reduce((acc, pos) => {
      const symbol = pos.symbol || pos.asset?.symbol;
      if (!symbol) return acc;
      const value = Number(pos.value ?? 0);
      if (!acc[symbol]) acc[symbol] = 0;
      acc[symbol] += value;
      return acc;
    }, {});

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

    const closedTrades = positionsArray.filter(p => p.is_closed);
    const winningTrades = closedTrades.filter(p => (p.unrealized_pnl_abs || 0) > 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;

    const equity = Object.values(distribution).reduce((sum, val) => sum + val, 0);
    const cashValue = Math.max(0, totalValue - equity);

    return {
      distribution,
      topGainer,
      topLoser,
      winRate,
      totalTrades: closedTrades.length,
      cashValue,
    };
  }, [positions, cryptoData, totalValue]);

  // Suggestions avancées avec indicateurs techniques
  const AdvancedSuggestionCard = ({ symbol }) => {
    const analysis = useCryptoAdvancedAnalysis(symbol, cryptoData);
    const positionsArray = Array.isArray(positions) ? positions : [];
    const position = positionsArray.find(p => (p.symbol || p.asset?.symbol) === symbol);
    const hasPosition = !!position;

    if (!analysis) {
      return (
        <div className="rounded-xl border border-border bg-accent/30 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg skeleton" />
            <div className="flex-1">
              <div className="skeleton-title w-24 mb-2" />
              <div className="skeleton-text w-32" />
            </div>
          </div>
        </div>
      );
    }

    const { action, confidence, reasons, indicators, scores } = analysis;
    const actionColor = action === 'BUY' ? 'text-green-600' :
                       action === 'SELL' ? 'text-red-600' : 'text-yellow-600';
    const bgColor = action === 'BUY' ? 'bg-green-500/10 border-green-500/30' :
                   action === 'SELL' ? 'bg-red-500/10 border-red-500/30' :
                   'bg-yellow-500/10 border-yellow-500/30';

    return (
      <div className={`rounded-xl border ${bgColor} overflow-hidden`}>
        {/* En-tête */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              <CryptoLogo symbol={symbol} size="md" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-card-foreground">{symbol}</div>
                  {hasPosition && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded-full">
                      Position
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  ${analysis.price.toLocaleString('fr-FR')}
                  <span className={`ml-2 font-medium ${analysis.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analysis.change24h >= 0 ? '+' : ''}{analysis.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${actionColor} bg-card shadow-sm mb-1`}>
                {action}
              </div>
              <div className="text-xs text-muted-foreground">
                Conf. {confidence}%
              </div>
            </div>
          </div>

          {/* Mini chart */}
          <div className="mb-3 rounded-lg overflow-hidden border border-border/50 bg-accent/30">
            <MiniChart symbol={symbol} tf="1h" height={80} />
          </div>

          {/* Indicateurs techniques */}
          <div className="mb-3 bg-accent/50 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-card-foreground">Indicateurs Techniques</span>
            </div>

            {indicators.rsi && (
              <TechnicalIndicator
                label="RSI (14)"
                value={indicators.rsi.toFixed(1)}
                signal={indicators.rsi < 30 ? 'BUY' : indicators.rsi > 70 ? 'SELL' : 'HOLD'}
              />
            )}

            {indicators.bollingerBands?.signal?.signal && (
              <TechnicalIndicator
                label="Bollinger Bands"
                value={indicators.bollingerBands.signal.signal}
                signal={indicators.bollingerBands.signal.signal}
              />
            )}

            {indicators.fibonacci?.trend && (
              <TechnicalIndicator
                label="Tendance Fibonacci"
                value={indicators.fibonacci.trend === 'UPTREND' ? 'Haussière' : 'Baissière'}
                signal={indicators.fibonacci.trend === 'UPTREND' ? 'BUY' : 'SELL'}
              />
            )}

            {/* Scores de confluence */}
            <div className="pt-2 mt-2 border-t border-border/50">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Score Achat</span>
                <span className="text-green-600 font-semibold">{scores?.buy || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Score Vente</span>
                <span className="text-red-600 font-semibold">{scores?.sell || 0}</span>
              </div>
            </div>
          </div>

          {/* Barre de confiance */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Confiance du signal</span>
              <span className={`font-semibold ${actionColor}`}>{confidence}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  action === 'BUY' ? 'bg-green-500' :
                  action === 'SELL' ? 'bg-red-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>

          {/* Raisons */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-3 h-3 text-primary" />
              <span className="text-xs font-semibold text-card-foreground">Analyse</span>
            </div>
            {reasons.map((reason, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSuggestions = () => {
    if (cryptoLoading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl p-4 border border-border bg-accent/30">
              <div className="skeleton h-20" />
            </div>
          ))}
        </div>
      );
    }

    const topCryptos = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP'];

    return (
      <div className="space-y-3">
        {topCryptos.map((symbol) => (
          <AdvancedSuggestionCard key={symbol} symbol={symbol} />
        ))}
      </div>
    );
  };

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

      {/* Win Rate */}
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

  const renderAlerts = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
        <Lightbulb className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="font-semibold text-card-foreground mb-2">Alertes en cours de développement</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Les alertes personnalisées basées sur les indicateurs techniques arrivent bientôt!
      </p>
    </div>
  );

  return (
    <CardBase className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">Smart Assistant Pro</h3>
            <p className="text-xs text-muted-foreground">Analyse IA + Indicateurs avancés</p>
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
              className={`relative flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
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
        {activeTab === 'alerts' && renderAlerts()}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertCircle className="w-3 h-3" />
          <span>Analyse basée sur Fibonacci, Bollinger Bands, RSI • Pas de conseils financiers</span>
        </div>
      </div>
    </CardBase>
  );
}

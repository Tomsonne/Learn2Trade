import { useState, useMemo } from 'react';
import { Search, BookOpen, TrendingUp, BarChart3, Coins } from 'lucide-react';
import CardBase from './ui/CardBase';

const GLOSSARY_TERMS = [
  // Trading de base
  { term: "Bull Market", category: "trading", icon: TrendingUp, definition: "Marché haussier où les prix augmentent de manière soutenue. Les investisseurs sont optimistes et achètent massivement." },
  { term: "Bear Market", category: "trading", icon: TrendingUp, definition: "Marché baissier où les prix chutent de manière prolongée. Les investisseurs sont pessimistes et vendent leurs positions." },
  { term: "HODL", category: "trading", icon: Coins, definition: "Stratégie consistant à conserver ses cryptomonnaies à long terme malgré la volatilité. Originellement une faute de frappe de 'HOLD'." },
  { term: "FOMO", category: "trading", icon: TrendingUp, definition: "Fear Of Missing Out - Peur de rater une opportunité qui pousse à acheter impulsivement au plus haut." },
  { term: "FUD", category: "trading", icon: TrendingUp, definition: "Fear, Uncertainty, Doubt - Propagation de peur et de doutes pour faire baisser les prix." },

  // Indicateurs techniques
  { term: "RSI", category: "indicateurs", icon: BarChart3, definition: "Relative Strength Index - Oscillateur mesurant la force d'un mouvement (0-100). Au-dessus de 70 = surachat, en dessous de 30 = survente." },
  { term: "MACD", category: "indicateurs", icon: BarChart3, definition: "Moving Average Convergence Divergence - Indicateur de momentum qui suit la relation entre deux moyennes mobiles." },
  { term: "Moving Average", category: "indicateurs", icon: BarChart3, definition: "Moyenne Mobile - Lisse les fluctuations de prix pour identifier une tendance. MA20 = moyenne sur 20 périodes." },
  { term: "Bollinger Bands", category: "indicateurs", icon: BarChart3, definition: "Bandes de Bollinger - Enveloppe de volatilité autour d'une moyenne mobile. Prix touche la bande haute = potentiel surachat." },
  { term: "Support", category: "indicateurs", icon: BarChart3, definition: "Niveau de prix où la demande est suffisamment forte pour empêcher une baisse continue." },
  { term: "Résistance", category: "indicateurs", icon: BarChart3, definition: "Niveau de prix où l'offre est suffisamment forte pour empêcher une hausse continue." },

  // Termes crypto
  { term: "Blockchain", category: "crypto", icon: Coins, definition: "Technologie de registre distribué qui enregistre les transactions de manière sécurisée et transparente." },
  { term: "Altcoin", category: "crypto", icon: Coins, definition: "Toute cryptomonnaie autre que Bitcoin. Exemples : Ethereum, Cardano, Solana." },
  { term: "Market Cap", category: "crypto", icon: Coins, definition: "Capitalisation boursière - Valeur totale d'une crypto (prix × nombre de tokens en circulation)." },
  { term: "Whale", category: "crypto", icon: Coins, definition: "Baleine - Investisseur détenant une très grande quantité de crypto capable d'influencer le marché." },
  { term: "Gas Fee", category: "crypto", icon: Coins, definition: "Frais payés pour effectuer une transaction sur la blockchain Ethereum. Varie selon la congestion du réseau." },
  { term: "Staking", category: "crypto", icon: Coins, definition: "Verrouiller des cryptos pour sécuriser un réseau blockchain et recevoir des récompenses en retour." },

  // Trading avancé
  { term: "Leverage", category: "trading", icon: TrendingUp, definition: "Effet de levier - Emprunter des fonds pour amplifier la taille d'une position. x10 = 10 fois plus de gains/pertes." },
  { term: "Long Position", category: "trading", icon: TrendingUp, definition: "Position acheteuse - Parier sur la hausse du prix. Profit si le prix monte." },
  { term: "Short Position", category: "trading", icon: TrendingUp, definition: "Position vendeuse - Parier sur la baisse du prix. Profit si le prix descend." },
  { term: "Stop Loss", category: "trading", icon: TrendingUp, definition: "Ordre automatique qui ferme une position pour limiter les pertes si le prix atteint un certain niveau." },
  { term: "Take Profit", category: "trading", icon: TrendingUp, definition: "Ordre automatique qui ferme une position pour sécuriser les gains lorsque le prix atteint un objectif." },
  { term: "Liquidation", category: "trading", icon: TrendingUp, definition: "Fermeture forcée d'une position à effet de levier lorsque les pertes dépassent la marge disponible." },

  // Analyse
  { term: "Analyse Technique", category: "indicateurs", icon: BarChart3, definition: "Étude des graphiques et indicateurs pour prédire les futurs mouvements de prix." },
  { term: "Analyse Fondamentale", category: "indicateurs", icon: BookOpen, definition: "Évaluation de la valeur intrinsèque d'un actif basée sur des facteurs économiques et financiers." },
  { term: "Volume", category: "indicateurs", icon: BarChart3, definition: "Quantité de tokens échangés sur une période. Un volume élevé confirme la force d'un mouvement." },
  { term: "Candlestick", category: "indicateurs", icon: BarChart3, definition: "Bougie japonaise - Représentation graphique montrant l'ouverture, fermeture, plus haut et plus bas d'une période." },
];

const CATEGORIES = [
  { id: "all", label: "Tous", icon: BookOpen },
  { id: "trading", label: "Trading", icon: TrendingUp },
  { id: "indicateurs", label: "Indicateurs", icon: BarChart3 },
  { id: "crypto", label: "Crypto", icon: Coins },
];

export default function Glossary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter(item => {
      const matchesSearch = item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.definition.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-card-foreground mb-2">Glossaire Trading</h1>
        <p className="text-muted-foreground">
          Découvrez les termes essentiels du trading et des cryptomonnaies
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher un terme..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-accent text-accent-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Résultats */}
      <div className="text-sm text-muted-foreground">
        {filteredTerms.length} terme{filteredTerms.length > 1 ? 's' : ''} trouvé{filteredTerms.length > 1 ? 's' : ''}
      </div>

      {/* Liste des termes */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredTerms.map((item, index) => {
          const Icon = item.icon;
          return (
            <CardBase key={index} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-card-foreground mb-1">
                    {item.term}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.definition}
                  </p>
                </div>
              </div>
            </CardBase>
          );
        })}
      </div>

      {filteredTerms.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            Aucun terme trouvé pour "{searchTerm}"
          </p>
        </div>
      )}
    </div>
  );
}

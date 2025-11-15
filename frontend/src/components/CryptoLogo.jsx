import { useState } from 'react';

// Mapping des symboles vers les IDs CoinGecko
const SYMBOL_TO_ID = {
  'BTC': 'bitcoin',
  'BTCUSDT': 'bitcoin',
  'ETH': 'ethereum',
  'ETHUSDT': 'ethereum',
  'BNB': 'binancecoin',
  'BNBUSDT': 'binancecoin',
  'SOL': 'solana',
  'SOLUSDT': 'solana',
  'XRP': 'ripple',
  'XRPUSDT': 'ripple',
  'ADA': 'cardano',
  'ADAUSDT': 'cardano',
  'DOGE': 'dogecoin',
  'DOGEUSDT': 'dogecoin',
  'DOT': 'polkadot',
  'DOTUSDT': 'polkadot',
};

// Couleurs de fallback pour chaque crypto
const FALLBACK_COLORS = {
  'bitcoin': 'bg-orange-500',
  'ethereum': 'bg-blue-500',
  'binancecoin': 'bg-yellow-500',
  'solana': 'bg-purple-500',
  'ripple': 'bg-blue-400',
  'cardano': 'bg-blue-600',
  'dogecoin': 'bg-yellow-400',
  'polkadot': 'bg-pink-500',
};

export default function CryptoLogo({ symbol, size = 'md', className = '' }) {
  const [imageError, setImageError] = useState(false);

  // Nettoyer le symbole (enlever USDT, USD, etc.)
  const cleanSymbol = symbol?.replace(/USDT?$/i, '') || '';
  const coinId = SYMBOL_TO_ID[symbol?.toUpperCase()] || SYMBOL_TO_ID[cleanSymbol?.toUpperCase()];

  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const sizeClass = sizes[size] || sizes.md;
  const fallbackColor = FALLBACK_COLORS[coinId] || 'bg-gray-500';

  // URL de l'image depuis CoinGecko
  const imageUrl = coinId
    ? `https://assets.coingecko.com/coins/images/${getCoinImageId(coinId)}/small/${coinId}.png`
    : null;

  // Si pas d'image ou erreur, afficher fallback avec initiale
  if (!imageUrl || imageError) {
    return (
      <div className={`${sizeClass} ${fallbackColor} rounded-full flex items-center justify-center text-white font-bold ${className}`}>
        {cleanSymbol.charAt(0)?.toUpperCase() || '?'}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={symbol}
      className={`${sizeClass} rounded-full ${className}`}
      onError={() => setImageError(true)}
    />
  );
}

// IDs d'images CoinGecko (mapping manuel pour les principales cryptos)
function getCoinImageId(coinId) {
  const imageIds = {
    'bitcoin': '1',
    'ethereum': '279',
    'binancecoin': '825',
    'solana': '4128',
    'ripple': '44',
    'cardano': '975',
    'dogecoin': '5',
    'polkadot': '12171',
  };
  return imageIds[coinId] || '1';
}

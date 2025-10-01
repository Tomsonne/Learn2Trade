import 'dotenv/config';

const CG_BASE = 'https://api.coingecko.com/api/v3';
const FX_BASE = 'https://api.frankfurter.app';
const CG_KEY  = process.env.COINGECKO_API_KEY;

// Helper minimal : fetch JSON + message d’erreur simple
async function httpJson(url, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} on ${url} ${txt ? `- ${txt.slice(0,120)}` : ''}`);
  }
  return res.json();
}

// Prix BTC/ETH en USD & EUR via CoinGecko (sans retry / sans cache)
export async function getPrices () {
  if (!CG_KEY) throw new Error('COINGECKO_API_KEY manquante dans .env');

  const url = `${CG_BASE}/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,eur`;
  const headers = {
    'x-cg-demo-api-key': CG_KEY, // clé demo
  };

  const data = await httpJson(url, headers); // { bitcoin:{usd,eur}, ethereum:{usd,eur} }

  return {
    timestamp: new Date().toISOString(),
    prices: {
      BTC: { usd: data.bitcoin?.usd ?? null,  eur: data.bitcoin?.eur ?? null },
      ETH: { usd: data.ethereum?.usd ?? null, eur: data.ethereum?.eur ?? null },
    },
    source: 'coingecko',
  };
}

// Taux USD→EUR via Frankfurter (sans clé)
export async function getForex() {
  const url = `https://api.frankfurter.app/latest?from=USD&to=EUR`;
  const data = await httpJson(url); // { amount, base:'USD', date, rates:{EUR: x.xx} }

  return {
    timestamp: new Date().toISOString(),
    base: data.base || 'USD',
    rates: { EUR: data.rates?.EUR ?? data.rates?.eur ?? null },
    source: 'frankfurter.app',
  };
}


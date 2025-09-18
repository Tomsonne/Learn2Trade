export async function getPrices () {
    //test
  return {
    timestamp: new Date().toISOString(),
    prices: {
      BTC: {usd: 0, eur: 0},
      ETH: { usd: 0, eur: 0 }
    },
    source: 'demo'
  }
}

export async function getForex() {
  return {
     timestamp: new Date().toISOString(),
    base: 'USD',
    rates: { EUR: 0.0 },
    source: 'demo'
  }
}

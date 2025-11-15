import { useEffect, useRef } from 'react';

export default function TickerWidget() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Nettoyer le contenu précédent
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js';
    script.async = true;
    script.type = 'text/javascript';
    script.innerHTML = JSON.stringify({
      "width": "100%",
      "height": "100%",
      "symbolsGroups": [
        {
          "name": "Crypto",
          "originalName": "Crypto",
          "symbols": [
            { "name": "BINANCE:BTCUSDT", "displayName": "BTC/USD" },
            { "name": "BINANCE:ETHUSDT", "displayName": "ETH/USD" },
            { "name": "BINANCE:BNBUSDT", "displayName": "BNB/USD" },
            { "name": "BINANCE:SOLUSDT", "displayName": "SOL/USD" },
            { "name": "BINANCE:ADAUSDT", "displayName": "ADA/USD" },
            { "name": "BINANCE:XRPUSDT", "displayName": "XRP/USD" },
            { "name": "BINANCE:DOGEUSDT", "displayName": "DOGE/USD" },
            { "name": "BINANCE:DOTUSDT", "displayName": "DOT/USD" }
          ]
        }
      ],
      "showSymbolLogo": true,
      "isTransparent": true,
      "colorTheme": "dark",
      "locale": "fr",
      "backgroundColor": "rgba(0, 0, 0, 0)"
    });

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container h-full" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

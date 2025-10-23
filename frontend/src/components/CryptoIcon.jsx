export default function CryptoIcon({ symbol = "MARKET", className = "w-5 h-5" }) {
  const s = String(symbol || "").toUpperCase();
  const map = {
    BTC: "/images/bitcoin.svg",
    BITCOIN: "/images/bitcoin.svg",
    ETH: "/images/ethereum.svg",
    ETHEREUM: "/images/ethereum.svg",
  };
  const src = map[s] || "/images/market.svg";
  return <img src={src} alt={`${s} logo`} className={className} loading="lazy" />;
}

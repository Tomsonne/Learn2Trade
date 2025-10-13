// src/components/ui/SymbolSelector.jsx
export default function SymbolSelector({ value, onChange, options=["BTC","ETH"] }) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="symbol" className="text-sm font-medium">Symbole :</label>
      <select id="symbol" value={value} onChange={e=>onChange(e.target.value)}
        className="border rounded-md px-3 py-1 text-sm bg-[hsl(var(--background))]">
        {options.map(opt => <option key={opt} value={opt}>{opt}/USD</option>)}
      </select>
    </div>
  );
}

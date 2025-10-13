// src/components/ui/TimeframeToolbar.jsx
export default function TimeframeToolbar({ value, onChange, items=["1h","4h","12h","1d"] }) {
  return (
    <div className="flex items-center gap-2">
      {items.map(k => (
        <button key={k} type="button"
          onClick={() => onChange(k)}
          className={`px-3 py-1 rounded-md border text-sm ${value===k ? "bg-[#007aff] text-white border-[#007aff]" : "border-border hover:bg-muted"}`}
          aria-pressed={value===k}
        >
          {k.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

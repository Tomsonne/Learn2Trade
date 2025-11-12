// src/components/news/SymbolFilter.jsx
import React from "react";

export default function SymbolFilter({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-md border border-slate-200 dark:border-gray-700 overflow-hidden">
      {options.map((opt, i) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 text-sm transition ${
              active
                ? "bg-indigo-600 text-white"
                : "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-gray-700"
            } ${i !== 0 ? "border-l border-slate-200 dark:border-gray-700" : ""}`}
            aria-pressed={active}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

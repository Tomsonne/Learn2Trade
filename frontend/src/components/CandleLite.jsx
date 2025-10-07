// src/components/CandleLite.jsx
import React, { useEffect, useRef } from "react";
import { createChart, CrosshairMode } from "lightweight-charts";

export default function CandleLite({ data = [], height = 384 }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const roRef = useRef(null);

  // Init chart une seule fois
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const textColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--muted-foreground")
        ?.trim() || "#9ca3af";

    chartRef.current = createChart(el, {
      width: el.clientWidth,
      height,
      layout: { background: { color: "transparent" }, textColor },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
      grid: {
        vertLines: { color: "rgba(148,163,184,.12)" },
        horzLines: { color: "rgba(148,163,184,.12)" },
      },
      crosshair: { mode: CrosshairMode.Normal },
    });

    seriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#64748b",
      wickDownColor: "#64748b",
    });

    // Auto-resize
    roRef.current = new ResizeObserver(([entry]) => {
      const { width, height: h } = entry.contentRect;
      chartRef.current?.applyOptions({ width, height: Math.max(180, h) });
      chartRef.current?.timeScale().fitContent();
    });
    roRef.current.observe(el);

    return () => {
      roRef.current?.disconnect();
      chartRef.current?.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [height]);

  // Push des données (tri + coercition + fit)
  useEffect(() => {
    if (!seriesRef.current) return;

    if (!Array.isArray(data) || data.length === 0) {
      seriesRef.current.setData([]);
      return;
    }

    // Attendu: [{ time: <seconds>, open, high, low, close }]
    const rows = data
      .filter(
        d =>
          Number.isFinite(d?.time) &&
          Number.isFinite(d?.open) &&
          Number.isFinite(d?.high) &&
          Number.isFinite(d?.low) &&
          Number.isFinite(d?.close)
      )
      .sort((a, b) => a.time - b.time)
      .map(d => ({
        time: Number(d.time), // secondes UNIX
        open: Number(d.open),
        high: Number(d.high),
        low: Number(d.low),
        close: Number(d.close),
      }));

    seriesRef.current.setData(rows);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height }}
      className="rounded-xl overflow-hidden"
    />
  );
}

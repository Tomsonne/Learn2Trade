// src/components/CandleLite.jsx
import React, { useEffect, useRef } from "react";
import { createChart, CrosshairMode } from "lightweight-charts";

export default function CandleLite({ data = [], height = 384 }) {
  const elRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const roRef = useRef(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const text = getComputedStyle(document.documentElement)
      .getPropertyValue("--muted-foreground")?.trim() || "#9ca3af";

    chartRef.current = createChart(el, {
      width: el.clientWidth,
      height,
      layout: { background: { color: "transparent" }, textColor: text },
      grid: {
        vertLines: { color: "rgba(148,163,184,.12)" },
        horzLines: { color: "rgba(148,163,184,.12)" },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
      crosshair: { mode: CrosshairMode.Normal },
      localization: { priceFormatter: (v) => Number(v).toLocaleString("fr-FR") },
    });

    seriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: "#16a34a",
      downColor: "#dc2626",
      borderUpColor: "#16a34a",
      borderDownColor: "#dc2626",
      wickUpColor: "#94a3b8",
      wickDownColor: "#94a3b8",
      lastValueVisible: true,
      priceLineVisible: false,
    });

    // Auto-resize
    roRef.current = new ResizeObserver(([entry]) => {
      const { width, height: h } = entry.contentRect;
      chartRef.current?.applyOptions({ width, height: Math.max(200, h) });
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

  useEffect(() => {
    if (!seriesRef.current) return;
    const rows = (Array.isArray(data) ? data : [])
      .filter(d =>
        Number.isFinite(d?.time) &&
        Number.isFinite(d?.open) &&
        Number.isFinite(d?.high) &&
        Number.isFinite(d?.low) &&
        Number.isFinite(d?.close)
      )
      .sort((a, b) => a.time - b.time);
    seriesRef.current.setData(rows);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  return <div ref={elRef} className="rounded-xl overflow-hidden w-full" style={{ height }} />;
}

// src/components/CandleLite.jsx
import { useEffect, useRef } from "react";
import { createChart, CrosshairMode } from "lightweight-charts";

/** data attend: [{ time|ts|t, o,h,l,c }, ...] */
export default function CandleLite({ data = [], height = 384 }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  // init 1 seule fois
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      height,
      layout: { background: { color: "transparent" }, textColor: "#cbd5e1" },
      grid: {
        vertLines: { color: "rgba(148,163,184,.2)" },
        horzLines: { color: "rgba(148,163,184,.2)" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: "rgba(148,163,184,.4)" },
      timeScale: { borderColor: "rgba(148,163,184,.4)" },
    });

    const candles = chart.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    chartRef.current = chart;
    seriesRef.current = candles;

    const onResize = () => chart.applyOptions({ width: containerRef.current.clientWidth });
    window.addEventListener("resize", onResize);
    onResize();

    return () => {
      window.removeEventListener("resize", onResize);
      chart.remove();
    };
  }, [height]);

  // push des données à chaque changement
  useEffect(() => {
    if (!seriesRef.current) return;

    const mapped = data
      .filter(d => d && d.o != null && d.h != null && d.l != null && d.c != null)
      .map(d => {
        const ms = d.time ? new Date(d.time).getTime()
                 : d.ts   ? Number(d.ts)
                 : d.t    ? Number(d.t) : Date.now();
        return {
          time: Math.floor(ms / 1000), // seconds
          open:  Number(d.o),
          high:  Number(d.h),
          low:   Number(d.l),
          close: Number(d.c),
        };
      });

    seriesRef.current.setData(mapped);
  }, [data]);

  return <div ref={containerRef} style={{ width: "100%", height }} />;
}

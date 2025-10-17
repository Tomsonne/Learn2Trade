// src/components/CandleLite.jsx
import React, { useEffect, useRef } from "react";
import { createChart, CrosshairMode } from "lightweight-charts";
import { formatDateOnly, formatTimeOnly, formatPublished } from "/src/utils/formatDate";

export default function CandleLite({
  data = [],
  height = 384,
  tf = "1h",
}) {
  const elRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const roRef = useRef(null);

  // helpers couleur -> formats acceptés par lightweight-charts
  const getThemeColors = () => {
    const css = getComputedStyle(document.documentElement);
    const getVar = (name, fb = "") => css.getPropertyValue(name).trim() || fb;
    const rgbNumsToRgb  = (nums) => `rgb(${nums.trim().replace(/\s+/g, ", ")})`;
    const rgbNumsToRgba = (nums, a) => `rgba(${nums.trim().replace(/\s+/g, ", ")}, ${a})`;
    const hslToRgb = (hslStr) => {
      const el = document.createElement("span");
      el.style.color = hslStr; document.body.appendChild(el);
      const rgb = getComputedStyle(el).color;
      document.body.removeChild(el);
      return rgb; // "rgb(r, g, b)"
    };

    const muted   = getVar("--muted",  "148 163 184");  // "r g b"
    const border  = getVar("--border", "226 232 240");
    const ma20HSL = getVar("--ma20",   "142 72% 45%");
    const downHSL = getVar("--down",   "0 72% 50%");

    return {
      text:  rgbNumsToRgb(muted),
      grid:  rgbNumsToRgba(border, 0.12),
      wick:  rgbNumsToRgba(muted, 0.6),
      up:    hslToRgb(`hsl(${ma20HSL})`),
      down:  hslToRgb(`hsl(${downHSL})`),
    };
  };

  // convertit l'objet Time de la lib en Date ms
  const timeToMs = (t) =>
    typeof t === "object" && t && "year" in t
      ? Date.UTC(t.year, (t.month || 1) - 1, t.day || 1)
      : Number(t) * 1000;

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const { text, grid, wick, up, down } = getThemeColors();

    chartRef.current = createChart(el, {
      width: el.clientWidth,
      height,
      layout: { background: { color: "transparent" }, textColor: text },
      grid: {
        vertLines: { color: grid },
        horzLines: { color: grid },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: tf !== "1d",
        secondsVisible: false,
        tickMarkFormatter: (time /* Time */) => {
          const d = new Date(timeToMs(time));
          return tf === "1d" ? formatDateOnly(d) : formatTimeOnly(d);
        },
      },
      crosshair: { mode: CrosshairMode.Normal },
      localization: {
        locale: "fr-FR",
        timeFormatter: (sec) => formatPublished(Number(sec) * 1000),
        priceFormatter: (v) => Number(v).toLocaleString("fr-FR"),
      },
    });

    seriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: up,
      downColor: down,
      borderUpColor: up,
      borderDownColor: down,
      wickUpColor: wick,
      wickDownColor: wick,
      lastValueVisible: true,
      priceLineVisible: false,
    });

    // auto-resize
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
  }, [height, tf]); // on recrée si la TF change (pattern simple et fiable)

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

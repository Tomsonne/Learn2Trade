// src/components/CandleLite.jsx
import { useEffect, useRef } from "react";
import { createChart, CrosshairMode } from "lightweight-charts";
import { formatDateOnly, formatTimeOnly, formatPublished } from "/src/utils/formatDate";

export default function CandleLite({
  data = [],
  height = 384,
  tf = "1h",
  series = [], // Données avec indicateurs (ma20, ma50, rsi, bbUpper, bbMiddle, bbLower)
  showIndicators = null, // "ma" | "rsi" | "bollinger" | "fibonacci" | null
  fibLevels = [], // Niveaux de Fibonacci à afficher
}) {
  const elRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const ma20SeriesRef = useRef(null);
  const ma50SeriesRef = useRef(null);
  const bbUpperSeriesRef = useRef(null);
  const bbMiddleSeriesRef = useRef(null);
  const bbLowerSeriesRef = useRef(null);
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
      grid:  rgbNumsToRgba(border, 0.35),
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
        borderVisible: true,
        borderColor: grid,
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: {
        borderVisible: true,
        borderColor: grid,
        timeVisible: true,
        secondsVisible: false,
        visible: true,
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

    // Ajouter le graphique de volume avec sa propre échelle
    volumeSeriesRef.current = chartRef.current.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume',
      lastValueVisible: false,
      priceLineVisible: false,
    });

    // Configurer l'échelle du volume en bas du graphique
    chartRef.current.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.75,
        bottom: 0,
      },
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
      volumeSeriesRef.current = null;
      ma20SeriesRef.current = null;
      ma50SeriesRef.current = null;
      bbUpperSeriesRef.current = null;
      bbMiddleSeriesRef.current = null;
      bbLowerSeriesRef.current = null;
    };
  }, [height, tf]); // on recrée si la TF change (pattern simple et fiable)

  useEffect(() => {
    if (!seriesRef.current || !volumeSeriesRef.current) return;
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

    // Préparer les données de volume
    const volumeData = rows
      .filter(d => Number.isFinite(d?.volume))
      .map(d => ({
        time: d.time,
        value: d.volume,
        color: d.close >= d.open ? '#26a69a' : '#ef5350', // vert si haussier, rouge si baissier
      }));

    volumeSeriesRef.current.setData(volumeData);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  // Effet pour afficher/masquer les indicateurs selon la stratégie sélectionnée
  useEffect(() => {
    if (!chartRef.current) return;

    // Nettoyer les anciennes séries d'indicateurs
    if (ma20SeriesRef.current) {
      chartRef.current.removeSeries(ma20SeriesRef.current);
      ma20SeriesRef.current = null;
    }
    if (ma50SeriesRef.current) {
      chartRef.current.removeSeries(ma50SeriesRef.current);
      ma50SeriesRef.current = null;
    }
    if (bbUpperSeriesRef.current) {
      chartRef.current.removeSeries(bbUpperSeriesRef.current);
      bbUpperSeriesRef.current = null;
    }
    if (bbMiddleSeriesRef.current) {
      chartRef.current.removeSeries(bbMiddleSeriesRef.current);
      bbMiddleSeriesRef.current = null;
    }
    if (bbLowerSeriesRef.current) {
      chartRef.current.removeSeries(bbLowerSeriesRef.current);
      bbLowerSeriesRef.current = null;
    }

    if (!showIndicators || !series.length) return;

    const getThemeColor = (cssVar, fallback) => {
      const css = getComputedStyle(document.documentElement);
      const hslValue = css.getPropertyValue(cssVar).trim();
      if (!hslValue) return fallback;
      const el = document.createElement("span");
      el.style.color = `hsl(${hslValue})`;
      document.body.appendChild(el);
      const rgb = getComputedStyle(el).color;
      document.body.removeChild(el);
      return rgb;
    };

    // Afficher les moyennes mobiles
    if (showIndicators === "ma") {
      // MA20
      ma20SeriesRef.current = chartRef.current.addLineSeries({
        color: getThemeColor("--chart-1", "rgb(59, 130, 246)"),
        lineWidth: 2,
        title: "MA20",
        lastValueVisible: true,
        priceLineVisible: false,
      });

      // MA50
      ma50SeriesRef.current = chartRef.current.addLineSeries({
        color: getThemeColor("--chart-2", "rgb(99, 102, 241)"),
        lineWidth: 2,
        title: "MA50",
        lastValueVisible: true,
        priceLineVisible: false,
      });

      // Préparer les données MA20 et MA50
      const ma20Data = series
        .filter(d => Number.isFinite(d?.ts) && Number.isFinite(d?.ma20))
        .map(d => ({ time: Math.floor(d.ts / 1000), value: d.ma20 }));

      const ma50Data = series
        .filter(d => Number.isFinite(d?.ts) && Number.isFinite(d?.ma50))
        .map(d => ({ time: Math.floor(d.ts / 1000), value: d.ma50 }));

      ma20SeriesRef.current.setData(ma20Data);
      ma50SeriesRef.current.setData(ma50Data);
    }

    // Afficher les Bandes de Bollinger
    if (showIndicators === "bollinger") {
      // Bande supérieure
      bbUpperSeriesRef.current = chartRef.current.addLineSeries({
        color: "rgba(239, 68, 68, 0.8)", // rouge
        lineWidth: 1.5,
        lineStyle: 2, // dashed
        title: "BB Sup",
        lastValueVisible: false,
        priceLineVisible: false,
      });

      // Bande moyenne (MA20)
      bbMiddleSeriesRef.current = chartRef.current.addLineSeries({
        color: getThemeColor("--chart-1", "rgb(59, 130, 246)"),
        lineWidth: 2,
        title: "BB Moy",
        lastValueVisible: true,
        priceLineVisible: false,
      });

      // Bande inférieure
      bbLowerSeriesRef.current = chartRef.current.addLineSeries({
        color: "rgba(34, 197, 94, 0.8)", // vert
        lineWidth: 1.5,
        lineStyle: 2, // dashed
        title: "BB Inf",
        lastValueVisible: false,
        priceLineVisible: false,
      });

      // Préparer les données Bollinger
      const bbUpperData = series
        .filter(d => Number.isFinite(d?.ts) && Number.isFinite(d?.bbUpper))
        .map(d => ({ time: Math.floor(d.ts / 1000), value: d.bbUpper }));

      const bbMiddleData = series
        .filter(d => Number.isFinite(d?.ts) && Number.isFinite(d?.bbMiddle))
        .map(d => ({ time: Math.floor(d.ts / 1000), value: d.bbMiddle }));

      const bbLowerData = series
        .filter(d => Number.isFinite(d?.ts) && Number.isFinite(d?.bbLower))
        .map(d => ({ time: Math.floor(d.ts / 1000), value: d.bbLower }));

      bbUpperSeriesRef.current.setData(bbUpperData);
      bbMiddleSeriesRef.current.setData(bbMiddleData);
      bbLowerSeriesRef.current.setData(bbLowerData);
    }

    // Afficher les niveaux de Fibonacci
    if (showIndicators === "fibonacci" && fibLevels.length > 0) {
      // Pour Fibonacci, on utilise createPriceLine pour chaque niveau
      fibLevels.forEach(level => {
        if (Number.isFinite(level.value)) {
          seriesRef.current?.createPriceLine({
            price: level.value,
            color: level.color || "rgb(234, 179, 8)",
            lineWidth: level.percentage === 61.8 ? 2 : 1,
            lineStyle: level.percentage === 0 || level.percentage === 100 ? 0 : 2, // solid ou dashed
            axisLabelVisible: true,
            title: level.name || `${level.percentage}%`,
          });
        }
      });
    }

    chartRef.current.timeScale().fitContent();
  }, [showIndicators, series, fibLevels]);

  return <div ref={elRef} className="rounded-xl overflow-hidden w-full" style={{ height }} />;
}

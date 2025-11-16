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
  spotPrice = null, // Prix spot en temps réel pour mettre à jour la dernière bougie
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
  const hasUserZoomedRef = useRef(false);
  const isFirstDataLoadRef = useRef(true);
  const previousDataLengthRef = useRef(0);
  const previousDataRef = useRef(null);
  const previousSpotPriceRef = useRef(null);

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

    // Détecter quand l'utilisateur zoom ou scroll
    const timeScale = chartRef.current.timeScale();
    let initialRange = null;

    const handleRangeChange = (range) => {
      // Ignorer le premier appel qui vient du fitContent initial
      if (initialRange === null) {
        initialRange = range;
        return;
      }
      // Si le range a changé de manière significative, c'est l'utilisateur qui a zoomé
      if (range && initialRange && (
        Math.abs((range.from - initialRange.from) / initialRange.from) > 0.01 ||
        Math.abs((range.to - initialRange.to) / initialRange.to) > 0.01
      )) {
        hasUserZoomedRef.current = true;
      }
    };

    timeScale.subscribeVisibleLogicalRangeChange(handleRangeChange);

    // auto-resize
    roRef.current = new ResizeObserver(([entry]) => {
      const { width, height: h } = entry.contentRect;
      chartRef.current?.applyOptions({ width, height: Math.max(200, h) });
      // Ne pas fitContent lors du resize si l'utilisateur a zoomé
      if (!hasUserZoomedRef.current) {
        chartRef.current?.timeScale().fitContent();
      }
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
      // Réinitialiser les flags quand on recrée le graphique
      hasUserZoomedRef.current = false;
      isFirstDataLoadRef.current = true;
      previousDataLengthRef.current = 0;
    };
  }, [height, tf]); // on recrée si la TF change (pattern simple et fiable)

  useEffect(() => {
    if (!seriesRef.current || !volumeSeriesRef.current) return;
    if (!data || data.length === 0) return;

    const rows = (Array.isArray(data) ? data : [])
      .filter(d =>
        Number.isFinite(d?.time) &&
        Number.isFinite(d?.open) &&
        Number.isFinite(d?.high) &&
        Number.isFinite(d?.low) &&
        Number.isFinite(d?.close)
      )
      .sort((a, b) => a.time - b.time);

    if (rows.length === 0) return;

    const volumeData = rows
      .filter(d => Number.isFinite(d?.volume))
      .map(d => ({
        time: d.time,
        value: d.volume,
        color: d.close >= d.open ? '#26a69a' : '#ef5350',
      }));

    // Sauvegarder TOUJOURS le zoom avant toute modification
    let savedRange = null;
    if (chartRef.current) {
      savedRange = chartRef.current.timeScale().getVisibleLogicalRange();
    }

    // Détecter si on peut faire une mise à jour optimisée (update au lieu de setData)
    const canUseUpdate = previousDataRef.current &&
                         previousDataRef.current.length === rows.length &&
                         previousDataRef.current.length > 0 &&
                         rows.length > 0;

    if (canUseUpdate) {
      // Comparer seulement la dernière bougie
      const prevLast = previousDataRef.current[previousDataRef.current.length - 1];
      const currLast = rows[rows.length - 1];

      // Si seule la dernière bougie a changé, utiliser update() pour une animation fluide
      if (prevLast.time === currLast.time &&
          (prevLast.open !== currLast.open ||
           prevLast.high !== currLast.high ||
           prevLast.low !== currLast.low ||
           prevLast.close !== currLast.close)) {

        // Mise à jour fluide de la dernière bougie uniquement
        seriesRef.current.update(currLast);

        if (volumeData.length > 0) {
          volumeSeriesRef.current.update(volumeData[volumeData.length - 1]);
        }

        // Sauvegarder les données actuelles
        previousDataRef.current = rows;
        return; // Pas besoin de faire setData, le zoom est préservé automatiquement
      }
    }

    // Détecter si c'est un changement de dataset complet
    const isNewDataset = isFirstDataLoadRef.current ||
                         Math.abs(rows.length - previousDataLengthRef.current) > 5;

    // Mettre à jour les données (setData complet)
    seriesRef.current.setData(rows);
    volumeSeriesRef.current.setData(volumeData);

    // Restaurer le zoom de manière asynchrone après setData
    // Utiliser requestAnimationFrame pour s'assurer que setData est terminé
    requestAnimationFrame(() => {
      if (!chartRef.current) return;

      if (isNewDataset) {
        // Nouveau dataset : fitContent seulement si l'utilisateur n'a jamais zoomé
        if (!hasUserZoomedRef.current) {
          chartRef.current.timeScale().fitContent();
        } else if (savedRange) {
          // Restaurer le zoom sauvegardé
          chartRef.current.timeScale().setVisibleLogicalRange(savedRange);
        }
        isFirstDataLoadRef.current = false;
      } else {
        // Mise à jour incrémentale : TOUJOURS restaurer le zoom
        if (savedRange) {
          chartRef.current.timeScale().setVisibleLogicalRange(savedRange);
        }
      }
    });

    previousDataLengthRef.current = rows.length;
    previousDataRef.current = rows;
  }, [data]);

  // Effet séparé pour mettre à jour la dernière bougie avec le prix spot en temps réel
  useEffect(() => {
    if (!seriesRef.current || !volumeSeriesRef.current) return;
    if (!previousDataRef.current || previousDataRef.current.length === 0) return;
    if (typeof spotPrice !== "number") return;

    // Ne mettre à jour que si le prix a vraiment changé
    if (spotPrice === previousSpotPriceRef.current) return;
    previousSpotPriceRef.current = spotPrice;

    const lastCandle = previousDataRef.current[previousDataRef.current.length - 1];
    if (!lastCandle) return;

    // Créer la bougie mise à jour
    const updatedCandle = {
      time: lastCandle.time,
      open: lastCandle.open,
      high: Math.max(lastCandle.high || spotPrice, spotPrice),
      low: Math.min(lastCandle.low || spotPrice, spotPrice),
      close: spotPrice,
    };

    // Utiliser update() pour une animation fluide sans réinitialiser le zoom
    seriesRef.current.update(updatedCandle);

    // Mettre à jour aussi le volume si disponible
    if (Number.isFinite(lastCandle.volume)) {
      volumeSeriesRef.current.update({
        time: lastCandle.time,
        value: lastCandle.volume,
        color: spotPrice >= lastCandle.open ? '#26a69a' : '#ef5350',
      });
    }
  }, [spotPrice]);

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

    // Ne pas réinitialiser le zoom si l'utilisateur a zoomé manuellement
    if (!hasUserZoomedRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [showIndicators, series, fibLevels]);

  return <div ref={elRef} className="rounded-xl overflow-hidden w-full" style={{ height }} />;
}

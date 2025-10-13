// src/utils/ta-ui.js
import { TrendingDown, TrendingUp, BarChart3 } from "lucide-react";

export const RANGE_BY_TF = { "1h": "1d", "4h": "7d", "12h": "14d", "1d": "90d" };

export const getRSISignal = (v=50) => {
  if (v > 70) return { text: "Surachat – Risque de correction", color: "text-red-600", bg: "bg-red-50", icon: TrendingDown };
  if (v < 30) return { text: "Survente – Potentiel de rebond",  color: "text-green-600", bg: "bg-green-50", icon: TrendingUp };
  return { text: "Zone neutre", color: "text-gray-600", bg: "bg-gray-50", icon: BarChart3 };
};

export const getMASignal = (ma20=0, ma50=0) => {
  if (ma20 > ma50) return { text: "Tendance Haussière", color: "text-green-600", bg: "bg-green-50", icon: TrendingUp };
  if (ma20 < ma50) return { text: "Tendance Baissière", color: "text-red-600",   bg: "bg-red-50",   icon: TrendingDown };
  return { text: "Tendance Neutre", color: "text-gray-600", bg: "bg-gray-50", icon: BarChart3 };
};

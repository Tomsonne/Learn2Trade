import React from "react";
import {
  ComposedChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Customized,
  Line
} from "recharts";

function RenderCandles(props) {
  const { xAxisMap, yAxisMap, data } = props;

  if (!xAxisMap || !yAxisMap || !data || !data.length) return null;

  // 1er axe X / Y (id "0")
  const xKey = Object.keys(xAxisMap)[0];
  const yKey = Object.keys(yAxisMap)[0];
  const xScale = xAxisMap[xKey]?.scale;
  const yScale = yAxisMap[yKey]?.scale;
  if (!xScale || !yScale) return null;

  // largeur de bougie
  let w = 6;
  if (data.length > 1) {
    const dx = Math.abs(xScale(data[1].time) - xScale(data[0].time));
    w = Math.max(3, Math.min(18, dx * 0.6));
  }

  return (
    <g>
      {data.map((d, i) => {
        if (d?.o == null || d?.h == null || d?.l == null || d?.c == null) return null;

        const x = xScale(d.time);
        const yH = yScale(d.h);
        const yL = yScale(d.l);
        const yO = yScale(d.o);
        const yC = yScale(d.c);

        const up = d.c >= d.o;
        const top = Math.min(yO, yC);
        const bodyH = Math.max(1, Math.abs(yO - yC));

        return (
          <g key={i}>
            {/* mèche */}
            <line x1={x} x2={x} y1={yH} y2={yL} stroke="#94a3b8" strokeWidth="1" />
            {/* corps */}
            <rect
              x={x - w / 2}
              y={top}
              width={w}
              height={bodyH}
              fill={up ? "#22c55e" : "#ef4444"}
              rx="1.4"
            />
          </g>
        );
      })}
    </g>
  );
}

export default function CandleChart({ data = [], height = 384, currency = "USD" }) {
  const nf = new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 2 });

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 12, left: 8, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 12, fill: "currentColor" }} axisLine={false} tickLine={false} />
          <YAxis
            domain={['dataMin', 'dataMax']}
            tick={{ fontSize: 12, fill: "currentColor" }}
            axisLine={false}
            tickLine={false}
            width={64}
          />
          <Tooltip
            formatter={(val, name) =>
              (["o", "h", "l", "c"].includes(name) ? [nf.format(val), name.toUpperCase()] : [val, name])
            }
            labelFormatter={(l, p) => p?.[0]?.payload?.time ?? l}
          />

          {/* séries invisibles juste pour domain Y */}
          <Line dataKey="h" stroke="transparent" dot={false} isAnimationActive={false} />
          <Line dataKey="l" stroke="transparent" dot={false} isAnimationActive={false} />

          {/* rendu des bougies */}
          <Customized component={RenderCandles} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

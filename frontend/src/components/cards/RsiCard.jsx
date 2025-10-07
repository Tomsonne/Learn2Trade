import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, ReferenceLine } from "recharts";

export default function RsiCard({ series, rsiSignal, currentRSI }) {
  const Icon = rsiSignal.icon;
  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-card-foreground">Signal RSI</h3>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${rsiSignal.bg}`} title={rsiSignal.text}>
          <Icon className={`w-4 h-4 ${rsiSignal.color}`} />
          <span className={`text-sm font-medium ${rsiSignal.color}`}>{rsiSignal.text}</span>
        </div>
      </div>

      <div className="text-3xl font-medium text-card-foreground mb-2">
        {currentRSI == null ? "—" : Number(currentRSI).toFixed(1)}
      </div>

      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series.slice(-20)}>
            <XAxis dataKey="time" hide />
            <YAxis domain={[0,100]} hide />
            <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" />
            <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="rsi" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

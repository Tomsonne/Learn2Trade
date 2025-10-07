import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis } from "recharts";

export default function MaCard({ series, maSignal, fmt, ma20, ma50, price }) {
  const Icon = maSignal.icon;
  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-card-foreground">Signal Moyennes Mobiles</h3>
        <div className="text-sm text-muted-foreground mb-2">Prix actuel : {fmt(price)}</div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${maSignal.bg}`} title={maSignal.text}>
          <Icon className={`w-4 h-4 ${maSignal.color}`} />
          <span className={`text-sm font-medium ${maSignal.color}`}>{maSignal.text}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div><div className="text-xl font-medium text-card-foreground">{fmt(ma20)}</div><div className="text-sm text-muted-foreground">MA20</div></div>
        <div><div className="text-xl font-medium text-card-foreground">{fmt(ma50)}</div><div className="text-sm text-muted-foreground">MA50</div></div>
      </div>

      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series.slice(-20)}>
            <XAxis dataKey="time" hide /><YAxis hide />
            <Line type="monotone" dataKey="ma20" stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="ma50" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

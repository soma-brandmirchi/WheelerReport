"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { WheelerCampaignsDataOut } from "@/lib/types";
import { formatNumber } from "@/lib/api";

interface Props {
  rows: WheelerCampaignsDataOut[];
}

export default function DeliveryByDmaChart({ rows }: Props) {
  const byDma = new Map<string, number>();
  for (const r of rows) {
    const key = r.dma?.trim() || "Unknown DMA";
    byDma.set(key, (byDma.get(key) ?? 0) + (r.impressions ?? 0));
  }
  const data = Array.from(byDma.entries())
    .map(([name, impressions]) => ({ name: shortDma(name), full: name, impressions }))
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 8);

  return (
    <div className="card p-5 h-[340px] flex flex-col">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="font-display text-lg font-semibold text-ink">Impressions by DMA</h3>
        <span className="eyebrow">top 8</span>
      </div>
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-slate-line">
          No delivery data for this selection.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
            <CartesianGrid horizontal={false} stroke="#5B6B79" strokeOpacity={0.15} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "#5B6B79" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={{ fontSize: 11, fill: "#5B6B79" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "#1B6B65", fillOpacity: 0.06 }}
              formatter={(v: number) => [formatNumber(v), "Impressions"]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.full ?? ""}
              contentStyle={{ borderRadius: 8, border: "1px solid rgba(15,27,26,0.1)" }}
            />
            <Bar dataKey="impressions" fill="#1B6B65" radius={[0, 3, 3, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function shortDma(name: string): string {
  if (name.length <= 18) return name;
  return `${name.slice(0, 16)}…`;
}

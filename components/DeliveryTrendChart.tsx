"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { WheelerCampaignsDataOut } from "@/lib/types";
import { formatNumber } from "@/lib/api";

interface Props {
  rows: WheelerCampaignsDataOut[];
}

export default function DeliveryTrendChart({ rows }: Props) {
  const byDate = new Map<string, number>();
  for (const r of rows) {
    const key = r.campaign_date;
    byDate.set(key, (byDate.get(key) ?? 0) + (r.impressions ?? 0));
  }
  const data = Array.from(byDate.entries())
    .map(([date, impressions]) => ({ date, impressions }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="card p-5 h-[340px] flex flex-col">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="font-display text-lg font-semibold text-ink">Impressions delivered</h3>
        <span className="eyebrow">by day</span>
      </div>
      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid vertical={false} stroke="#5B6B79" strokeOpacity={0.15} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#5B6B79" }}
              tickLine={false}
              axisLine={{ stroke: "#5B6B79", strokeOpacity: 0.2 }}
              minTickGap={24}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#5B6B79" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
              width={40}
            />
            <Tooltip
              formatter={(v: number) => [formatNumber(v), "Impressions"]}
              labelStyle={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
              contentStyle={{ borderRadius: 8, border: "1px solid rgba(15,27,26,0.1)" }}
            />
            <Line type="monotone" dataKey="impressions" stroke="#1B6B65" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center text-sm text-slate-line">
      No delivery data for this selection.
    </div>
  );
}

"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { WheelerBudgetOut } from "@/lib/types";
import { formatCurrency } from "@/lib/api";

interface Props {
  rows: WheelerBudgetOut[];
}

export default function BudgetByCampaignChart({ rows }: Props) {
  const data = rows
    .map((r) => ({
      name: r.campaign_id,
      budget: r.gross_budget ? parseFloat(r.gross_budget) : 0,
    }))
    .sort((a, b) => b.budget - a.budget)
    .slice(0, 10);

  return (
    <div className="card p-5 h-[340px] flex flex-col">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="font-display text-lg font-semibold text-ink">Gross budget by campaign</h3>
        <span className="eyebrow">top 10</span>
      </div>
      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid vertical={false} stroke="#5B6B79" strokeOpacity={0.15} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#5B6B79" }}
              tickLine={false}
              axisLine={{ stroke: "#5B6B79", strokeOpacity: 0.2 }}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#5B6B79" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
              width={44}
            />
            <Tooltip
              cursor={{ fill: "#1B6B65", fillOpacity: 0.06 }}
              formatter={(v: number) => [formatCurrency(v), "Gross budget"]}
              labelStyle={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
              contentStyle={{ borderRadius: 8, border: "1px solid rgba(15,27,26,0.1)" }}
            />
            <Bar dataKey="budget" fill="#F5A623" radius={[3, 3, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center text-sm text-slate-line">
      No budget rows match these filters.
    </div>
  );
}

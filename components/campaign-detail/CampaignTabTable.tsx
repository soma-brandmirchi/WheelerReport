"use client";

import type { ReactNode } from "react";
import {
  TabMetricRow,
  formatCurrencyDetailed,
  formatDecimal,
  formatPercent,
} from "@/lib/campaignMetrics";
import { formatDate, formatNumber } from "@/lib/api";
import { TableSort } from "@/lib/sort";
import SortableTh from "../SortableTh";

interface Props {
  summary: TabMetricRow | null;
  rows: TabMetricRow[];
  sort: TableSort;
  onSort: (column: string) => void;
  emptyMessage?: string;
}

export default function CampaignTabTable({ summary, rows, sort, onSort, emptyMessage }: Props) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-ink-600/10 text-left">
              <SortableTh label="Name" column="name" sort={sort} onSort={onSort} />
              <SortableTh label="Start Date" column="start_date" sort={sort} onSort={onSort} />
              <SortableTh label="End Date" column="end_date" sort={sort} onSort={onSort} />
              <SortableTh label="Spend" column="spend" sort={sort} onSort={onSort} align="right" />
              <SortableTh label="Pacing" column="pacing" sort={sort} onSort={onSort} align="right" />
              <SortableTh
                label="Impressions"
                column="impressions"
                sort={sort}
                onSort={onSort}
                align="right"
              />
              <SortableTh label="CPM" column="cpm" sort={sort} onSort={onSort} align="right" />
              <SortableTh
                label="View-Through Rate"
                column="view_through_rate"
                sort={sort}
                onSort={onSort}
                align="right"
              />
              <SortableTh
                label="Cost Per View"
                column="cost_per_view"
                sort={sort}
                onSort={onSort}
                align="right"
              />
              <SortableTh
                label="Completed View"
                column="complete_views"
                sort={sort}
                onSort={onSort}
                align="right"
              />
              <SortableTh
                label="Households"
                column="household"
                sort={sort}
                onSort={onSort}
                align="right"
              />
              <SortableTh
                label="Frequency"
                column="frequency"
                sort={sort}
                onSort={onSort}
                align="right"
              />
            </tr>
          </thead>
          <tbody>
            {summary && <MetricRow row={summary} highlight />}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-5 py-8 text-center text-slate-line">
                  {emptyMessage ?? "No data for this tab."}
                </td>
              </tr>
            ) : (
              rows.map((row) => <MetricRow key={row.name} row={row} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricRow({ row, highlight = false }: { row: TabMetricRow; highlight?: boolean }) {
  return (
    <tr
      className={`border-b border-ink-600/5 ${highlight ? "bg-teal/[0.08] font-medium" : "hover:bg-ink-600/[0.03]"}`}
    >
      <Td>{row.name}</Td>
      <Td className="ticker whitespace-nowrap">{formatDate(row.start_date)}</Td>
      <Td className="ticker whitespace-nowrap">{formatDate(row.end_date)}</Td>
      <Td align="right" className="ticker">
        {formatCurrencyDetailed(row.spend)}
      </Td>
      <Td align="right" className="ticker">
        {formatPercent(row.pacing)}
      </Td>
      <Td align="right" className="ticker">
        {formatNumber(row.impressions)}
      </Td>
      <Td align="right" className="ticker">
        {formatCurrencyDetailed(row.cpm)}
      </Td>
      <Td align="right" className="ticker">
        {formatPercent(row.view_through_rate)}
      </Td>
      <Td align="right" className="ticker">
        {formatCurrencyDetailed(row.cost_per_view)}
      </Td>
      <Td align="right" className="ticker">
        {formatNumber(row.complete_views)}
      </Td>
      <Td align="right" className="ticker">
        {row.household === null ? "—" : formatNumber(row.household)}
      </Td>
      <Td align="right" className="ticker">
        {formatDecimal(row.frequency)}
      </Td>
    </tr>
  );
}

function Td({
  children,
  align = "left",
  className = "",
}: {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td className={`px-5 py-2.5 text-ink-700 ${align === "right" ? "text-right" : "text-left"} ${className}`}>
      {children}
    </td>
  );
}

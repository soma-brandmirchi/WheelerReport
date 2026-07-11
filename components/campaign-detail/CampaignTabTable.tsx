"use client";

import type { ReactNode } from "react";
import {
  CampaignDetailTab,
  TabMetricRow,
  formatCurrencyDetailed,
  formatDecimal,
  formatPercent,
} from "@/lib/campaignMetrics";
import { formatDate, formatNumber } from "@/lib/api";
import { TableSort } from "@/lib/sort";
import SortableTh from "../SortableTh";

interface Props {
  activeTab: CampaignDetailTab;
  summary: TabMetricRow | null;
  rows: TabMetricRow[];
  sort: TableSort;
  onSort: (column: string) => void;
  emptyMessage?: string;
}

const METRIC_COLUMNS = [
  { label: "Spend", column: "spend", align: "right" as const },
  { label: "Impressions", column: "impressions", align: "right" as const },
  { label: "CPM", column: "cpm", align: "right" as const },
  { label: "View-Through Rate", column: "view_through_rate", align: "right" as const },
  { label: "Cost Per View", column: "cost_per_view", align: "right" as const },
  { label: "Completed View", column: "complete_views", align: "right" as const },
  { label: "Households", column: "household", align: "right" as const },
  { label: "Session", column: "session", align: "right" as const },
  { label: "Page View", column: "page_view", align: "right" as const },
  { label: "Frequency", column: "frequency", align: "right" as const },
];

export default function CampaignTabTable({
  activeTab,
  summary,
  rows,
  sort,
  onSort,
  emptyMessage,
}: Props) {
  const isStrategies = activeTab === "strategies";
  const colSpan = isStrategies ? 13 : 11;

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-ink-600/10 text-left">
              <SortableTh label="Name" column="name" sort={sort} onSort={onSort} />
              {isStrategies && (
                <SortableTh label="Start Date" column="start_date" sort={sort} onSort={onSort} />
              )}
              {isStrategies && (
                <SortableTh label="End Date" column="end_date" sort={sort} onSort={onSort} />
              )}
              {METRIC_COLUMNS.map((col) => (
                <SortableTh
                  key={col.column}
                  label={col.label}
                  column={col.column}
                  sort={sort}
                  onSort={onSort}
                  align={col.align}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {summary && <MetricRow row={summary} highlight isStrategies={isStrategies} />}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-5 py-8 text-center text-slate-line">
                  {emptyMessage ?? "No data for this tab."}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <MetricRow key={row.name} row={row} isStrategies={isStrategies} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricRow({
  row,
  highlight = false,
  isStrategies,
}: {
  row: TabMetricRow;
  highlight?: boolean;
  isStrategies: boolean;
}) {
  return (
    <tr
      className={`border-b border-ink-600/5 ${highlight ? "bg-teal/[0.08] font-medium" : "hover:bg-ink-600/[0.03]"}`}
    >
      <Td>{row.name}</Td>
      {isStrategies && (
        <Td className="ticker whitespace-nowrap">{formatDate(row.start_date)}</Td>
      )}
      {isStrategies && (
        <Td className="ticker whitespace-nowrap">{formatDate(row.end_date)}</Td>
      )}
      <Td align="right" className="ticker">
        {formatCurrencyDetailed(row.spend)}
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
        {row.session === null ? "—" : formatNumber(row.session)}
      </Td>
      <Td align="right" className="ticker">
        {row.page_view === null ? "—" : formatNumber(row.page_view)}
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

"use client";

import type { ReactNode } from "react";
import { WheelerPageviewsStrategyOut } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/api";
import { TableSort } from "@/lib/sort";
import SortableTh from "./SortableTh";

interface Props {
  rows: WheelerPageviewsStrategyOut[];
  total: number;
  limit: number;
  offset: number;
  sort: TableSort;
  onSort: (column: string) => void;
  onPageChange: (nextOffset: number) => void;
  onRowClick?: (row: WheelerPageviewsStrategyOut) => void;
  selectedId?: number | null;
}

export default function PageviewsStrategyTable({
  rows,
  total,
  limit,
  offset,
  sort,
  onSort,
  onPageChange,
  onRowClick,
  selectedId,
}: Props) {
  const page = Math.floor(offset / limit) + 1;
  const pageCount = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">Pageviews strategy</h3>
          {onRowClick && (
            <p className="mt-0.5 text-xs text-slate-line">Click a row to open strategy detail</p>
          )}
        </div>
        <span className="eyebrow ticker">
          {total === 0 ? "0 rows" : `${offset + 1}–${Math.min(offset + limit, total)} of ${total}`}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-ink-600/10 text-left">
              <SortableTh label="Campaign ID" column="campaign_id" sort={sort} onSort={onSort} />
              <SortableTh label="Campaign" column="campaign" sort={sort} onSort={onSort} />
              <SortableTh label="Strategy" column="strategy" sort={sort} onSort={onSort} />
              <SortableTh label="Impr." column="impressions" sort={sort} onSort={onSort} align="right" />
              <SortableTh label="Complete views" column="complete_views" sort={sort} onSort={onSort} align="right" />
              <SortableTh label="Household" column="household" sort={sort} onSort={onSort} align="right" />
              <SortableTh label="Session" column="session" sort={sort} onSort={onSort} align="right" />
              <SortableTh label="Page views" column="page_view" sort={sort} onSort={onSort} align="right" />
              <SortableTh label="Spend" column="cost_with_markup" sort={sort} onSort={onSort} align="right" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-8 text-center text-slate-line">
                  No pageviews strategy rows match these filters.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={r.id}
                  className={`border-b border-ink-600/5 ${
                    onRowClick ? "cursor-pointer hover:bg-teal/[0.06]" : "hover:bg-ink-600/[0.03]"
                  } ${selectedId === r.id ? "bg-signal/10" : ""}`}
                  onClick={() => onRowClick?.(r)}
                >
                  <Td className="ticker text-ink">{r.campaign_id}</Td>
                  <Td className="max-w-[200px] truncate" title={r.campaign}>
                    {r.campaign}
                  </Td>
                  <Td className="max-w-[180px] truncate" title={r.strategy ?? undefined}>
                    {r.strategy ?? "—"}
                  </Td>
                  <Td align="right" className="ticker">
                    {formatNumber(r.impressions)}
                  </Td>
                  <Td align="right" className="ticker">
                    {formatNumber(r.complete_views)}
                  </Td>
                  <Td align="right" className="ticker">
                    {formatNumber(r.household)}
                  </Td>
                  <Td align="right" className="ticker">
                    {formatNumber(r.session)}
                  </Td>
                  <Td align="right" className="ticker">
                    {formatNumber(r.page_view)}
                  </Td>
                  <Td align="right" className="ticker font-medium text-ink">
                    {formatCurrency(r.cost_with_markup)}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t border-ink-600/10">
        <button
          className="text-sm font-medium text-teal disabled:text-slate-line disabled:cursor-not-allowed"
          disabled={offset === 0}
          onClick={() => onPageChange(Math.max(0, offset - limit))}
        >
          ← Previous
        </button>
        <span className="eyebrow">
          page {page} of {pageCount}
        </span>
        <button
          className="text-sm font-medium text-teal disabled:text-slate-line disabled:cursor-not-allowed"
          disabled={offset + limit >= total}
          onClick={() => onPageChange(offset + limit)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function Td({
  children,
  align = "left",
  className = "",
  title,
}: {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
  title?: string;
}) {
  return (
    <td
      title={title}
      className={`px-5 py-2.5 text-ink-700 ${align === "right" ? "text-right" : "text-left"} ${className}`}
    >
      {children}
    </td>
  );
}

"use client";

import type { ReactNode } from "react";
import { WheelerBudgetOut } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/api";

interface Props {
  rows: WheelerBudgetOut[];
  total: number;
  limit: number;
  offset: number;
  onPageChange: (nextOffset: number) => void;
  onRowClick?: (row: WheelerBudgetOut) => void;
  selectedId?: number | null;
}

export default function BudgetTable({
  rows,
  total,
  limit,
  offset,
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
          <h3 className="font-display text-lg font-semibold text-ink">Campaign budgets</h3>
          {onRowClick && (
            <p className="mt-0.5 text-xs text-slate-line">Click a row to open budget detail</p>
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
              <Th>Campaign ID</Th>
              <Th>Campaign</Th>
              <Th>Client</Th>
              <Th>Type</Th>
              <Th>Start</Th>
              <Th>End</Th>
              <Th align="right">Gross budget</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-line">
                  No rows match these filters.
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
                  <Td>{r.campaign}</Td>
                  <Td>{r.client_name ?? "—"}</Td>
                  <Td>{r.campaign_type ?? "—"}</Td>
                  <Td className="ticker">{formatDate(r.start_date)}</Td>
                  <Td className="ticker">{formatDate(r.end_date)}</Td>
                  <Td align="right" className="ticker font-medium text-ink">
                    {formatCurrency(r.gross_budget)}
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

function Th({ children, align = "left" }: { children: ReactNode; align?: "left" | "right" }) {
  return (
    <th className={`px-5 py-2.5 eyebrow font-normal ${align === "right" ? "text-right" : "text-left"}`}>
      {children}
    </th>
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

"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  CampaignReportRow,
  buildCampaignDetailHref,
  formatCurrencyDetailed,
  formatDateRange,
  formatDecimal,
  formatPercent,
} from "@/lib/campaignMetrics";
import { formatCurrency, formatNumber } from "@/lib/api";
import { TableSort } from "@/lib/sort";
import SortableTh from "./SortableTh";

interface Props {
  rows: CampaignReportRow[];
  total: number;
  limit: number;
  offset: number;
  sort: TableSort;
  onSort: (column: string) => void;
  onPageChange: (nextOffset: number) => void;
  dateFrom?: string;
  dateTo?: string;
}

const STICKY_COL_1 = "table-sticky-col-1";
const STICKY_COL_2 = "table-sticky-col-2";
const STICKY_HEAD_1 = "table-sticky-head-1";
const STICKY_HEAD_2 = "table-sticky-head-2";
const CELL_HOVER = "table-cell-hover";

export default function CampaignsReportTable({
  rows,
  total,
  limit,
  offset,
  sort,
  onSort,
  onPageChange,
  dateFrom,
  dateTo,
}: Props) {
  const page = Math.floor(offset / limit) + 1;
  const pageCount = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">Campaigns Report</h3>
          <p className="mt-0.5 text-xs text-slate-line">Click a campaign to open detail report</p>
        </div>
        <span className="eyebrow ticker">
          {total === 0 ? "0 rows" : `${offset + 1}–${Math.min(offset + limit, total)} of ${total}`}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-max w-full text-sm">
          <thead>
            <tr className="border-y border-ink-600/10 text-left">
              <StickySortableTh
                label="Campaign ID"
                column="campaign_id"
                sort={sort}
                onSort={onSort}
                className={STICKY_HEAD_1}
              />
              <StickySortableTh
                label="Campaign Name"
                column="campaign"
                sort={sort}
                onSort={onSort}
                className={STICKY_HEAD_2}
              />
              <SortableTh label="Advertiser Name" column="advertiser_name" sort={sort} onSort={onSort} />
              <SortableTh label="Date" column="start_date" sort={sort} onSort={onSort} />
              <SortableTh label="Budget" column="budget" sort={sort} onSort={onSort} align="right" />
              <SortableTh label="Gross Spend" column="gross_spend" sort={sort} onSort={onSort} align="right" />
              <SortableTh label="Impressions" column="impressions" sort={sort} onSort={onSort} align="right" />
              <SortableTh
                label="Completed Views"
                column="complete_views"
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
                label="View Through Rate"
                column="view_through_rate"
                sort={sort}
                onSort={onSort}
                align="right"
              />
              <SortableTh label="Frequency" column="frequency" sort={sort} onSort={onSort} align="right" />
              <SortableTh label="Household" column="household" sort={sort} onSort={onSort} align="right" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-5 py-8 text-center text-slate-line">
                  No campaigns match these filters.
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const href = buildCampaignDetailHref(r.campaign_id, {
                  from: dateFrom,
                  to: dateTo,
                  tab: "strategies",
                });
                return (
                  <tr key={r.campaign_id} className="group border-b border-ink-600/5 table-row-hover">
                    <Td className={STICKY_COL_1}>
                      <Link href={href} className="ticker text-teal hover:underline">
                        {r.campaign_id}
                      </Link>
                    </Td>
                    <Td className={STICKY_COL_2}>
                      <Link
                        href={href}
                        className="text-teal hover:underline max-w-[220px] truncate block"
                        title={r.campaign}
                      >
                        {r.campaign}
                      </Link>
                    </Td>
                    <Td className={CELL_HOVER}>{r.advertiser_name ?? "—"}</Td>
                    <Td className={`ticker whitespace-nowrap ${CELL_HOVER}`}>
                      {formatDateRange(r.start_date, r.end_date)}
                    </Td>
                    <Td align="right" className={`ticker ${CELL_HOVER}`}>
                      {formatCurrency(r.budget)}
                    </Td>
                    <Td align="right" className={`ticker ${CELL_HOVER}`}>
                      {formatCurrencyDetailed(r.gross_spend)}
                    </Td>
                    <Td align="right" className={`ticker ${CELL_HOVER}`}>
                      {formatNumber(r.impressions)}
                    </Td>
                    <Td align="right" className={`ticker ${CELL_HOVER}`}>
                      {formatNumber(r.complete_views)}
                    </Td>
                    <Td align="right" className={`ticker ${CELL_HOVER}`}>
                      {formatCurrencyDetailed(r.cost_per_view)}
                    </Td>
                    <Td align="right" className={`ticker ${CELL_HOVER}`}>
                      {formatPercent(r.view_through_rate)}
                    </Td>
                    <Td align="right" className={`ticker ${CELL_HOVER}`}>
                      {formatDecimal(r.frequency)}
                    </Td>
                    <Td align="right" className={`ticker ${CELL_HOVER}`}>
                      {formatNumber(r.household)}
                    </Td>
                  </tr>
                );
              })
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

function StickySortableTh({
  label,
  column,
  sort,
  onSort,
  className,
}: {
  label: string;
  column: string;
  sort: TableSort;
  onSort: (column: string) => void;
  className: string;
}) {
  const active = sort.column === column;
  const indicator = active ? (sort.direction === "asc" ? " ↑" : " ↓") : "";

  return (
    <th className={`px-5 py-2.5 text-left ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSort(column);
        }}
        className={`eyebrow font-normal inline-flex items-center gap-0.5 cursor-pointer select-none hover:text-ink transition-colors ${
          active ? "text-ink" : "text-slate-line"
        }`}
      >
        <span>{label}</span>
        <span className="ticker text-[10px] leading-none" aria-hidden>
          {indicator || " ↕"}
        </span>
      </button>
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
    <td
      className={`px-5 py-2.5 text-ink-700 ${align === "right" ? "text-right" : "text-left"} ${className}`}
    >
      {children}
    </td>
  );
}

"use client";

import type { ReactNode } from "react";
import { WheelerCampaignsDataOut } from "@/lib/types";
import { formatCurrency, formatDate, formatNumber } from "@/lib/api";

interface Props {
  rows: WheelerCampaignsDataOut[];
  total: number;
  limit: number;
  offset: number;
  onPageChange: (nextOffset: number) => void;
}

export default function DeliveryTable({ rows, total, limit, offset, onPageChange }: Props) {
  const page = Math.floor(offset / limit) + 1;
  const pageCount = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3 className="font-display text-lg font-semibold text-ink">Delivery detail</h3>
        <span className="eyebrow ticker">
          {total === 0 ? "0 rows" : `${offset + 1}–${Math.min(offset + limit, total)} of ${total}`}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-ink-600/10 text-left">
              <Th>Date</Th>
              <Th>Campaign</Th>
              <Th>App</Th>
              <Th>City</Th>
              <Th>DMA</Th>
              <Th>Creative</Th>
              <Th align="right">Impr.</Th>
              <Th align="right">Spend</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-slate-line">
                  No delivery rows match these filters.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-ink-600/5 hover:bg-ink-600/[0.03]">
                  <Td className="ticker">{formatDate(r.campaign_date)}</Td>
                  <Td className="ticker text-ink">{r.campaign_id}</Td>
                  <Td>{r.app_name ?? "—"}</Td>
                  <Td>{r.city ?? "—"}</Td>
                  <Td className="max-w-[160px] truncate" title={r.dma ?? undefined}>
                    {r.dma ?? "—"}
                  </Td>
                  <Td className="max-w-[180px] truncate" title={r.creative ?? undefined}>
                    {r.creative ?? "—"}
                  </Td>
                  <Td align="right" className="ticker">
                    {formatNumber(r.impressions)}
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

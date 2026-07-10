"use client";

import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/api";

interface Props {
  campaignName: string;
  grossBudget: string | null;
  startDate: string | null;
  endDate: string | null;
  dateFrom: string;
  dateTo: string;
  onClearDateFilter: () => void;
}

export default function CampaignDetailHeader({
  campaignName,
  grossBudget,
  startDate,
  endDate,
  dateFrom,
  dateTo,
  onClearDateFilter,
}: Props) {
  const hasDateFilter = Boolean(dateFrom || dateTo);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{campaignName}</h1>
          <p className="mt-1 text-sm text-slate-line ticker">
            {formatCurrency(grossBudget)}
            {startDate && endDate && (
              <>
                {" "}
                · {formatDate(startDate)} → {formatDate(endDate)}
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className="rounded-md border border-ink-600/15 px-3 py-1.5 text-sm font-medium text-ink hover:bg-ink-600/5"
          >
            Back to reporting
          </Link>
        </div>
      </div>

      {hasDateFilter && (
        <div className="flex items-center justify-between rounded-md border border-ink-600/10 bg-paper/60 px-4 py-2 text-sm text-ink-700">
          <span className="ticker">
            {dateFrom ? formatDate(dateFrom) : "…"} – {dateTo ? formatDate(dateTo) : "…"}
          </span>
          <button
            type="button"
            onClick={onClearDateFilter}
            className="text-slate-line hover:text-ink"
            aria-label="Clear date filter"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

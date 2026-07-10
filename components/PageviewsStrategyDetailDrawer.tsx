"use client";

import { useEffect, useState } from "react";
import { WheelerPageviewsStrategyOut } from "@/lib/types";
import { fetchPageviewsStrategyById, formatCurrency, formatNumber } from "@/lib/api";

interface Props {
  rowId: number | null;
  onClose: () => void;
}

export default function PageviewsStrategyDetailDrawer({ rowId, onClose }: Props) {
  const [detail, setDetail] = useState<WheelerPageviewsStrategyOut | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (rowId === null) {
      setDetail(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchPageviewsStrategyById(rowId)
      .then((row) => {
        if (!cancelled) setDetail(row);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load detail");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [rowId]);

  useEffect(() => {
    if (rowId === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rowId, onClose]);

  if (rowId === null) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close detail"
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
      />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-ink-600/10 px-5 py-4">
          <div>
            <div className="eyebrow text-signal">Pageviews strategy detail</div>
            <h2 className="font-display text-xl font-semibold text-ink">
              {detail?.campaign_id ?? (loading ? "Loading…" : "—")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-slate-line hover:bg-ink-600/5 hover:text-ink"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {error && <p className="mb-4 text-sm text-ink">{error}</p>}
          {loading && !detail && (
            <p className="text-sm text-slate-line ticker">fetching /api/wheeler-pageviews-strategy/{rowId}…</p>
          )}

          {detail && (
            <div className="flex flex-col gap-5">
              <p className="text-sm text-ink-700 leading-relaxed">{detail.campaign}</p>

              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Field label="Strategy" value={detail.strategy ?? "—"} />
                <Field label="Record id" value={String(detail.id)} mono />
                <Field label="Impressions" value={formatNumber(detail.impressions)} mono />
                <Field label="Complete views" value={formatNumber(detail.complete_views)} mono />
                <Field label="Household" value={formatNumber(detail.household)} mono />
                <Field label="Session" value={formatNumber(detail.session)} mono />
                <Field label="Page views" value={formatNumber(detail.page_view)} mono />
                <Field label="Spend" value={formatCurrency(detail.cost_with_markup)} mono />
              </dl>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className={`mt-1 text-ink ${mono ? "ticker" : ""}`}>{value}</dd>
    </div>
  );
}

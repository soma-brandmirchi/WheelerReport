"use client";

import { useEffect, useMemo, useState } from "react";
import { WheelerBudgetOut, WheelerCampaignsDataOut } from "@/lib/types";
import { fetchBudgetById, formatCurrency, formatDate, formatNumber } from "@/lib/api";

interface Props {
  budgetId: number | null;
  deliveryRows: WheelerCampaignsDataOut[];
  onClose: () => void;
}

export default function CampaignDetailDrawer({ budgetId, deliveryRows, onClose }: Props) {
  const [detail, setDetail] = useState<WheelerBudgetOut | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (budgetId === null) {
      setDetail(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchBudgetById(budgetId)
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
  }, [budgetId]);

  useEffect(() => {
    if (budgetId === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [budgetId, onClose]);

  const delivery = useMemo(() => {
    if (!detail) return { impressions: 0, spend: 0, completions: 0, rows: 0 };
    const rows = deliveryRows.filter((r) => r.campaign_id === detail.campaign_id);
    return {
      impressions: rows.reduce((s, r) => s + (r.impressions ?? 0), 0),
      spend: rows.reduce((s, r) => s + (r.cost_with_markup ?? 0), 0),
      completions: rows.reduce((s, r) => s + (r.rich_media_video_completions ? parseFloat(r.rich_media_video_completions) : 0), 0),
      rows: rows.length,
    };
  }, [detail, deliveryRows]);

  if (budgetId === null) return null;

  const budget = detail?.gross_budget ? parseFloat(detail.gross_budget) : 0;
  const pacing = budget > 0 ? delivery.spend / budget : 0;

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
            <div className="eyebrow text-signal">Campaign detail</div>
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
          {loading && !detail && <p className="text-sm text-slate-line ticker">fetching /api/wheeler-budget/{budgetId}…</p>}

          {detail && (
            <div className="flex flex-col gap-5">
              <p className="text-sm text-ink-700 leading-relaxed">{detail.campaign}</p>

              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Field label="Client" value={detail.client_name ?? "—"} />
                <Field label="Type" value={detail.campaign_type ?? "—"} />
                <Field label="Start" value={formatDate(detail.start_date)} mono />
                <Field label="End" value={formatDate(detail.end_date)} mono />
                <Field label="Gross budget" value={formatCurrency(detail.gross_budget)} mono />
                <Field label="Record id" value={String(detail.id)} mono />
              </dl>

              <div className="rounded-card border border-ink-600/10 bg-paper/60 p-4">
                <div className="eyebrow mb-3">Delivery for this campaign</div>
                <div className="grid grid-cols-2 gap-3">
                  <MiniStat label="Impressions" value={formatNumber(delivery.impressions)} />
                  <MiniStat label="Spend" value={formatCurrency(delivery.spend)} />
                  <MiniStat label="Completions" value={formatNumber(delivery.completions)} />
                  <MiniStat label="Pacing" value={budget > 0 ? `${Math.round(pacing * 100)}%` : "—"} />
                </div>
                <p className="mt-3 text-xs text-slate-line">
                  Aggregated from {formatNumber(delivery.rows)} delivery rows currently loaded for this campaign id.
                </p>
              </div>
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-line">{label}</div>
      <div className="font-display text-lg font-semibold text-ink ticker">{value}</div>
    </div>
  );
}

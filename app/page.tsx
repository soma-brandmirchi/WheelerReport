"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Filters, { EMPTY_FILTERS, FilterState } from "@/components/Filters";
import KpiCard from "@/components/KpiCard";
import BudgetByCampaignChart from "@/components/BudgetByCampaignChart";
import DeliveryTrendChart from "@/components/DeliveryTrendChart";
import DeliveryByDmaChart from "@/components/DeliveryByDmaChart";
import BudgetTable from "@/components/BudgetTable";
import DeliveryTable from "@/components/DeliveryTable";
import PageviewsStrategyTable from "@/components/PageviewsStrategyTable";
import CampaignDetailDrawer from "@/components/CampaignDetailDrawer";
import PageviewsStrategyDetailDrawer from "@/components/PageviewsStrategyDetailDrawer";
import PageLoader from "@/components/PageLoader";
import {
  fetchBudgetCampaignIds,
  fetchReportBudget,
  fetchReportDelivery,
  fetchReportPageviewsStrategy,
  formatCurrency,
  formatNumber,
  PAGE_LIMIT,
} from "@/lib/api";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import {
  DEFAULT_BUDGET_SORT,
  DEFAULT_DELIVERY_SORT,
  DEFAULT_PAGEVIEWS_SORT,
  TableSort,
  toggleSort,
  toOrderParam,
} from "@/lib/sort";
import { WheelerBudgetOut, WheelerCampaignsDataOut, WheelerPageviewsStrategyOut } from "@/lib/types";

const TABLE_PAGE_SIZE = 10;

export default function Page() {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const appliedFilters = useDebouncedValue(filters, 400);

  const [campaignIds, setCampaignIds] = useState<string[]>([]);
  const [allBudgetRows, setAllBudgetRows] = useState<WheelerBudgetOut[]>([]);
  const [budgetTotal, setBudgetTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [deliveryOffset, setDeliveryOffset] = useState(0);
  const [deliveryRows, setDeliveryRows] = useState<WheelerCampaignsDataOut[]>([]);
  const [deliveryTotal, setDeliveryTotal] = useState(0);
  const [deliveryTruncated, setDeliveryTruncated] = useState(false);
  const [pageviewsOffset, setPageviewsOffset] = useState(0);
  const [pageviewsRows, setPageviewsRows] = useState<WheelerPageviewsStrategyOut[]>([]);
  const [pageviewsTotal, setPageviewsTotal] = useState(0);
  const [pageviewsTruncated, setPageviewsTruncated] = useState(false);

  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBudgetId, setSelectedBudgetId] = useState<number | null>(null);
  const [selectedPageviewsId, setSelectedPageviewsId] = useState<number | null>(null);
  const [budgetSort, setBudgetSort] = useState<TableSort>(DEFAULT_BUDGET_SORT);
  const [deliverySort, setDeliverySort] = useState<TableSort>(DEFAULT_DELIVERY_SORT);
  const [pageviewsSort, setPageviewsSort] = useState<TableSort>(DEFAULT_PAGEVIEWS_SORT);

  // Campaign dropdown — only when prefix/client settle (debounced).
  useEffect(() => {
    let cancelled = false;
    fetchBudgetCampaignIds({
      prefix: appliedFilters.campaignIdPrefix || undefined,
      client_name: appliedFilters.clientName || undefined,
      limit: PAGE_LIMIT,
    })
      .then((res) => {
        if (!cancelled) setCampaignIds(res.campaign_ids);
      })
      .catch(() => {
        /* dropdown is a nice-to-have */
      });
    return () => {
      cancelled = true;
    };
  }, [appliedFilters.campaignIdPrefix, appliedFilters.clientName]);

  useEffect(() => {
    setOffset(0);
    setDeliveryOffset(0);
    setPageviewsOffset(0);
  }, [appliedFilters]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const sharedCampaign = {
      campaign_ids: appliedFilters.campaignId || undefined,
      campaign_id_prefix: appliedFilters.campaignIdPrefix || undefined,
      campaign: appliedFilters.campaignName || undefined,
      start_from_date: appliedFilters.startFromDate || undefined,
      end_to_date: appliedFilters.endToDate || undefined,
    };

    const budgetQuery = {
      ...sharedCampaign,
      client_name: appliedFilters.clientName || undefined,
      campaign_type: appliedFilters.campaignType || undefined,
      order: toOrderParam(budgetSort),
    };

    const deliveryQuery = {
      ...sharedCampaign,
      dma: appliedFilters.dma || undefined,
      city: appliedFilters.city || undefined,
      app_name: appliedFilters.appName || undefined,
      strategy: appliedFilters.strategy || undefined,
      device_type: appliedFilters.deviceType || undefined,
      order: toOrderParam(deliverySort),
    };

    const pageviewsQuery = {
      ...sharedCampaign,
      strategy: appliedFilters.strategy || undefined,
      order: toOrderParam(pageviewsSort),
    };

    Promise.all([
      fetchReportBudget(budgetQuery),
      fetchReportDelivery(deliveryQuery),
      fetchReportPageviewsStrategy(pageviewsQuery),
    ])
      .then(([budget, delivery, pageviews]) => {
        if (cancelled) return;
        setAllBudgetRows(budget.items);
        setBudgetTotal(budget.total);
        setDeliveryRows(delivery.items);
        setDeliveryTotal(delivery.total);
        setDeliveryTruncated(delivery.truncated);
        setPageviewsRows(pageviews.items);
        setPageviewsTotal(pageviews.total);
        setPageviewsTruncated(pageviews.truncated);
        setHasLoadedOnce(true);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load report data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [appliedFilters, budgetSort, deliverySort, pageviewsSort]);

  const handleBudgetSort = (column: string) => {
    setBudgetSort((s) => toggleSort(s, column));
    setOffset(0);
  };

  const handleDeliverySort = (column: string) => {
    setDeliverySort((s) => toggleSort(s, column));
    setDeliveryOffset(0);
  };

  const handlePageviewsSort = (column: string) => {
    setPageviewsSort((s) => toggleSort(s, column));
    setPageviewsOffset(0);
  };

  const pageRows = useMemo(
    () => allBudgetRows.slice(offset, offset + TABLE_PAGE_SIZE),
    [allBudgetRows, offset]
  );

  const deliveryPageRows = useMemo(
    () => deliveryRows.slice(deliveryOffset, deliveryOffset + TABLE_PAGE_SIZE),
    [deliveryRows, deliveryOffset]
  );

  const pageviewsPageRows = useMemo(
    () => pageviewsRows.slice(pageviewsOffset, pageviewsOffset + TABLE_PAGE_SIZE),
    [pageviewsRows, pageviewsOffset]
  );

  const kpis = useMemo(() => {
    const totalGrossBudget = allBudgetRows.reduce(
      (sum, r) => sum + (r.gross_budget ? parseFloat(r.gross_budget) : 0),
      0
    );
    const distinctCampaigns = new Set(allBudgetRows.map((r) => r.campaign_id)).size;
    const totalImpressions = deliveryRows.reduce((sum, r) => sum + (r.impressions ?? 0), 0);
    const totalSpend = deliveryRows.reduce((sum, r) => sum + (r.cost_with_markup ?? 0), 0);
    const pacing = totalGrossBudget > 0 ? totalSpend / totalGrossBudget : 0;

    return { totalGrossBudget, distinctCampaigns, totalImpressions, totalSpend, pacing };
  }, [allBudgetRows, deliveryRows]);

  const showInitialLoader = loading && !hasLoadedOnce;
  const deliverySampleLabel = deliveryTruncated
    ? `from latest ${formatNumber(deliveryRows.length)} of ${formatNumber(deliveryTotal)} rows`
    : `${formatNumber(deliveryTotal)} delivery rows`;

  return (
    <main className="min-h-screen">
      <Header />

      <div className="mx-auto max-w-[1180px] px-6 py-6 flex flex-col gap-6">
        <Filters value={filters} onChange={setFilters} campaignIds={campaignIds} loading={loading} />

        {error && (
          <div className="card border-signal/40 bg-signal/5 px-4 py-3 text-sm text-ink">
            Couldn&apos;t reach the Wheeler API: {error}. Check <code className="ticker">WHEELER_API_BASE_URL</code> in{" "}
            <code className="ticker">.env.local</code>.
          </div>
        )}

        {showInitialLoader ? (
          <div className="relative min-h-[420px] card">
            <PageLoader label="Loading report data…" />
          </div>
        ) : (
          <div className="relative flex flex-col gap-6">
            {loading && <PageLoader fullscreen label="Refreshing report…" />}

            <div
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-opacity ${
                loading ? "opacity-40 pointer-events-none" : ""
              }`}
            >
              <KpiCard
                label="Gross budget"
                value={formatCurrency(kpis.totalGrossBudget)}
                sublabel={`${formatNumber(budgetTotal)} campaigns in filter`}
              />
              <KpiCard
                label="Campaigns"
                value={String(kpis.distinctCampaigns)}
                sublabel="distinct campaign ids"
              />
              <KpiCard
                label="Impressions delivered"
                value={formatNumber(kpis.totalImpressions)}
                sublabel={deliverySampleLabel}
              />
              <KpiCard
                label="Spend pacing"
                value={kpis.totalGrossBudget > 0 ? `${Math.round(kpis.pacing * 100)}%` : "—"}
                sublabel={`${formatCurrency(kpis.totalSpend)} of ${formatCurrency(kpis.totalGrossBudget)}`}
                signal={Math.min(kpis.pacing, 1)}
              />
            </div>

            <div
              className={`grid grid-cols-1 lg:grid-cols-2 gap-4 transition-opacity ${
                loading ? "opacity-40 pointer-events-none" : ""
              }`}
            >
              <BudgetByCampaignChart rows={allBudgetRows} />
              <DeliveryTrendChart rows={deliveryRows} />
            </div>

            <div className={loading ? "opacity-40 pointer-events-none transition-opacity" : ""}>
              <DeliveryByDmaChart rows={deliveryRows} />
            </div>

            <div className={loading ? "opacity-40 pointer-events-none transition-opacity" : ""}>
              <BudgetTable
                rows={pageRows}
                total={Math.min(budgetTotal, allBudgetRows.length)}
                limit={TABLE_PAGE_SIZE}
                offset={offset}
                sort={budgetSort}
                onSort={handleBudgetSort}
                onPageChange={setOffset}
                onRowClick={(row) => setSelectedBudgetId(row.id)}
                selectedId={selectedBudgetId}
              />
            </div>

            <div className={loading ? "opacity-40 pointer-events-none transition-opacity" : ""}>
              <DeliveryTable
                rows={deliveryPageRows}
                total={deliveryRows.length}
                limit={TABLE_PAGE_SIZE}
                offset={deliveryOffset}
                sort={deliverySort}
                onSort={handleDeliverySort}
                onPageChange={setDeliveryOffset}
              />
            </div>

            <div className={loading ? "opacity-40 pointer-events-none transition-opacity" : ""}>
              <PageviewsStrategyTable
                rows={pageviewsPageRows}
                total={pageviewsRows.length}
                limit={TABLE_PAGE_SIZE}
                offset={pageviewsOffset}
                sort={pageviewsSort}
                onSort={handlePageviewsSort}
                onPageChange={setPageviewsOffset}
                onRowClick={(row) => setSelectedPageviewsId(row.id)}
                selectedId={selectedPageviewsId}
              />
            </div>

            <p className="text-xs text-slate-line pb-6">
              Loads one budget, delivery, and pageviews strategy page ({PAGE_LIMIT} rows) in parallel. Delivery has{" "}
              {formatNumber(deliveryTotal)} matching rows upstream — charts/KPIs use the latest{" "}
              {formatNumber(deliveryRows.length)}. Pageviews strategy has {formatNumber(pageviewsTotal)} matching rows
              {pageviewsTruncated
                ? ` — table uses the latest ${formatNumber(pageviewsRows.length)}`
                : ""}
              . Narrow with campaign, strategy, or date filters for a tighter sample. Click a budget row for{" "}
              <code className="ticker">GET /api/wheeler-budget/&#123;id&#125;</code> or a pageviews row for{" "}
              <code className="ticker">GET /api/wheeler-pageviews-strategy/&#123;id&#125;</code>.
            </p>
          </div>
        )}
      </div>

      <CampaignDetailDrawer
        budgetId={selectedBudgetId}
        deliveryRows={deliveryRows}
        onClose={() => setSelectedBudgetId(null)}
      />

      <PageviewsStrategyDetailDrawer
        rowId={selectedPageviewsId}
        onClose={() => setSelectedPageviewsId(null)}
      />
    </main>
  );
}

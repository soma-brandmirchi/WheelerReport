"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import PageLoader from "@/components/PageLoader";
import CampaignDetailHeader from "@/components/campaign-detail/CampaignDetailHeader";
import CampaignDetailTabs from "@/components/campaign-detail/CampaignDetailTabs";
import CampaignTabTable from "@/components/campaign-detail/CampaignTabTable";
import {
  fetchReportBudget,
  fetchReportDelivery,
  fetchReportPageviewsStrategy,
  fetchReportPageviewsAppsSafe,
} from "@/lib/api";
import {
  CampaignDetailTab,
  TabMetricRow,
  aggregateDeliveryByAds,
  aggregateDeliveryByScreens,
  aggregatePageviewsByApp,
  aggregatePageviewsByStrategy,
  buildPageviewsSummaryRow,
  enrichTabRowsWithCampaignDates,
  findBudgetForCampaign,
  parseCampaignDetailTab,
} from "@/lib/campaignMetrics";
import { DEFAULT_CAMPAIGNS_SORT, TableSort, toggleSort } from "@/lib/sort";
import {
  WheelerBudgetOut,
  WheelerCampaignsDataOut,
  WheelerPageviewsStrategyOut,
  WheelerPageviewsAppsOut,
} from "@/lib/types";

function sortTabRows(rows: TabMetricRow[], sort: TableSort): TabMetricRow[] {
  const sorted = [...rows].sort((a, b) => {
    const av = a[sort.column as keyof TabMetricRow];
    const bv = b[sort.column as keyof TabMetricRow];
    if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv);
    const an = av === null ? -Infinity : Number(av);
    const bn = bv === null ? -Infinity : Number(bv);
    return an - bn;
  });
  return sort.direction === "desc" ? sorted.reverse() : sorted;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = decodeURIComponent(String(params.campaignId ?? ""));

  const activeTab = parseCampaignDetailTab(searchParams.get("tab"));
  const dateFrom = searchParams.get("from") ?? "";
  const dateTo = searchParams.get("to") ?? "";

  const [budgetRows, setBudgetRows] = useState<WheelerBudgetOut[]>([]);
  const [pageviewsRows, setPageviewsRows] = useState<WheelerPageviewsStrategyOut[]>([]);
  const [pageviewsAppsRows, setPageviewsAppsRows] = useState<WheelerPageviewsAppsOut[]>([]);
  const [deliveryRows, setDeliveryRows] = useState<WheelerCampaignsDataOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabSort, setTabSort] = useState<TableSort>(DEFAULT_CAMPAIGNS_SORT);

  const updateSearchParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      router.replace(`/campaigns/${encodeURIComponent(campaignId)}${qs ? `?${qs}` : ""}`);
    },
    [campaignId, router, searchParams]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const query = {
      campaign_ids: campaignId,
      start_from_date: dateFrom || undefined,
      end_to_date: dateTo || undefined,
    };

    Promise.all([
      fetchReportBudget(query),
      fetchReportPageviewsStrategy(query),
      fetchReportDelivery(query),
    ])
      .then(([budget, pageviews, delivery]) => {
        if (cancelled) return;
        setBudgetRows(budget.items);
        setPageviewsRows(pageviews.items);
        setDeliveryRows(delivery.items);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load campaign data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    fetchReportPageviewsAppsSafe(query).then((pageviewsApps) => {
      if (!cancelled) setPageviewsAppsRows(pageviewsApps.items);
    });

    return () => {
      cancelled = true;
    };
  }, [campaignId, dateFrom, dateTo]);

  const budget = findBudgetForCampaign(budgetRows, campaignId);
  const campaignName =
    budget?.campaign ??
    pageviewsRows.find((r) => r.campaign_id === campaignId)?.campaign ??
    campaignId;

  const rawTabRows = useMemo((): TabMetricRow[] => {
    switch (activeTab) {
      case "strategies":
        return aggregatePageviewsByStrategy(pageviewsRows);
      case "ads":
        return aggregateDeliveryByAds(deliveryRows);
      case "screens":
        return aggregateDeliveryByScreens(deliveryRows);
      case "inventory":
        return aggregatePageviewsByApp(pageviewsAppsRows);
      case "matched-user-ips":
        return [];
      default:
        return [];
    }
  }, [activeTab, pageviewsRows, pageviewsAppsRows, deliveryRows]);

  const enrichedTabRows = useMemo(
    () => enrichTabRowsWithCampaignDates(rawTabRows, budget),
    [rawTabRows, budget]
  );

  const tabRows = useMemo(
    () => sortTabRows(enrichedTabRows, tabSort),
    [enrichedTabRows, tabSort]
  );

  const summaryLabel =
    activeTab === "ads" || activeTab === "inventory" ? "All" : "All strategies";

  const summary = useMemo(
    () => buildPageviewsSummaryRow(pageviewsRows, budget, summaryLabel),
    [pageviewsRows, budget, summaryLabel]
  );

  const handleTabChange = (tab: CampaignDetailTab) => {
    setTabSort(DEFAULT_CAMPAIGNS_SORT);
    updateSearchParams({ tab });
  };

  const handleClearDateFilter = () => {
    updateSearchParams({ from: null, to: null });
  };

  return (
    <main className="min-h-screen">
      <Header />

      <div className="mx-auto max-w-[1180px] px-6 py-6 flex flex-col gap-6">
        {error && (
          <div className="card border-signal/40 bg-signal/5 px-4 py-3 text-sm text-ink">
            Couldn&apos;t load campaign data: {error}
          </div>
        )}

        <CampaignDetailHeader
          campaignName={campaignName}
          grossBudget={budget?.gross_budget ?? null}
          startDate={budget?.start_date ?? null}
          endDate={budget?.end_date ?? null}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onClearDateFilter={handleClearDateFilter}
        />

        <CampaignDetailTabs activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="relative min-h-[240px]">
          {loading && <PageLoader label="Loading campaign data…" />}

          {!loading && activeTab === "matched-user-ips" ? (
            <div className="card px-5 py-12 text-center">
              <p className="font-display text-lg font-semibold text-ink">Matched User IPs</p>
              <p className="mt-2 text-sm text-slate-line">
                This report is coming soon. No matched user IP data is available from the API yet.
              </p>
            </div>
          ) : (
            !loading && (
              <CampaignTabTable
                activeTab={activeTab}
                summary={summary}
                rows={tabRows}
                sort={tabSort}
                onSort={(column) => setTabSort((s) => toggleSort(s, column))}
                emptyMessage="No data for this tab with the current filters."
              />
            )
          )}
        </div>
      </div>
    </main>
  );
}

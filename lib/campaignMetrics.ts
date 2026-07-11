import {
  WheelerBudgetOut,
  WheelerCampaignsDataOut,
  WheelerPageviewsStrategyOut,
  WheelerPageviewsAppsOut,
  WheelerPageviewsDayOut,
  WheelerPageviewsZipOut,
  WheelerPageviewsCityOut,
} from "./types";

export interface CampaignReportRow {
  campaign_id: string;
  campaign: string;
  advertiser_name: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  gross_spend: number;
  impressions: number;
  complete_views: number;
  cost_per_view: number | null;
  view_through_rate: number | null;
  frequency: number | null;
  household: number;
}

interface CampaignReportAccumulator {
  campaign: string;
  advertiser_name: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  gross_spend: number;
  impressions: number;
  complete_views: number;
  household: number;
  pageviews_spend: number;
  pageviews_impressions: number;
}

export interface TabMetricRow {
  name: string;
  start_date: string | null;
  end_date: string | null;
  spend: number;
  impressions: number;
  cpm: number | null;
  view_through_rate: number | null;
  cost_per_view: number | null;
  complete_views: number;
  household: number | null;
  session: number | null;
  page_view: number | null;
  frequency: number | null;
  budget_amount?: number | null;
  pacing?: number | null;
}

export type CampaignDetailTab =
  | "strategies"
  | "time"
  | "ads"
  | "screens"
  | "inventory"
  | "geography"
  | "matched-user-ips";

export type GeographyView = "zip" | "city";

export const CAMPAIGN_DETAIL_TABS: { id: CampaignDetailTab; label: string }[] = [
  { id: "strategies", label: "Strategies" },
  { id: "time", label: "Time" },
  { id: "ads", label: "Ads" },
  { id: "screens", label: "Screens" },
  { id: "inventory", label: "Inventory" },
  { id: "geography", label: "Geography" },
  { id: "matched-user-ips", label: "Matched User IPs" },
];

export const MUTED_CAMPAIGN_DETAIL_TABS: CampaignDetailTab[] = ["ads", "screens"];

export const VISIBLE_CAMPAIGN_DETAIL_TABS = CAMPAIGN_DETAIL_TABS.filter(
  (tab) => !MUTED_CAMPAIGN_DETAIL_TABS.includes(tab.id)
);

export const DEFAULT_CAMPAIGNS_SORT = { column: "complete_views", direction: "desc" as const };

function parseNum(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === "string" ? parseFloat(value) : value;
  return Number.isNaN(n) ? 0 : n;
}

function deriveMetrics(
  spend: number,
  impressions: number,
  completeViews: number,
  household: number | null
): Pick<TabMetricRow, "cpm" | "view_through_rate" | "cost_per_view" | "frequency"> {
  return {
    cpm: impressions > 0 ? (spend / impressions) * 1000 : null,
    view_through_rate: impressions > 0 ? completeViews / impressions : null,
    cost_per_view: completeViews > 0 ? spend / completeViews : null,
    frequency: household !== null && household > 0 ? impressions / household : null,
  };
}

function toTabRow(
  name: string,
  spend: number,
  impressions: number,
  completeViews: number,
  household: number | null
): TabMetricRow {
  return {
    name,
    start_date: null,
    end_date: null,
    spend,
    impressions,
    complete_views: completeViews,
    household,
    session: null,
    page_view: null,
    ...deriveMetrics(spend, impressions, completeViews, household),
  };
}

export function enrichTabRow(
  row: TabMetricRow,
  budget: WheelerBudgetOut | undefined
): TabMetricRow {
  return {
    ...row,
    start_date: budget?.start_date ?? null,
    end_date: budget?.end_date ?? null,
  };
}

export function enrichTabRowsWithCampaignDates(
  rows: TabMetricRow[],
  budget: WheelerBudgetOut | undefined
): TabMetricRow[] {
  return rows.map((row) => enrichTabRow(row, budget));
}

function emptyAccumulator(campaign = ""): CampaignReportAccumulator {
  return {
    campaign,
    advertiser_name: null,
    start_date: null,
    end_date: null,
    budget: null,
    gross_spend: 0,
    impressions: 0,
    complete_views: 0,
    household: 0,
    pageviews_spend: 0,
    pageviews_impressions: 0,
  };
}

function accumulatorToRow(campaign_id: string, data: CampaignReportAccumulator): CampaignReportRow {
  const derived = deriveMetrics(
    data.pageviews_spend,
    data.pageviews_impressions,
    data.complete_views,
    data.household
  );
  return {
    campaign_id,
    campaign: data.campaign,
    advertiser_name: data.advertiser_name,
    start_date: data.start_date,
    end_date: data.end_date,
    budget: data.budget,
    gross_spend: data.pageviews_spend,
    impressions: data.pageviews_impressions,
    complete_views: data.complete_views,
    household: data.household,
    cost_per_view: derived.cost_per_view,
    view_through_rate: derived.view_through_rate,
    frequency: derived.frequency,
  };
}

export function buildCampaignReportRows(
  pageviewsRows: WheelerPageviewsStrategyOut[],
  budgetRows: WheelerBudgetOut[],
  deliveryRows: WheelerCampaignsDataOut[]
): CampaignReportRow[] {
  const map = new Map<string, CampaignReportAccumulator>();

  for (const row of pageviewsRows) {
    const existing = map.get(row.campaign_id) ?? emptyAccumulator(row.campaign);
    existing.campaign = row.campaign || existing.campaign;
    existing.complete_views += row.complete_views ?? 0;
    existing.household += row.household ?? 0;
    existing.pageviews_impressions += row.impressions ?? 0;
    existing.pageviews_spend += parseNum(row.cost_with_markup);
    map.set(row.campaign_id, existing);
  }

  for (const row of budgetRows) {
    const existing = map.get(row.campaign_id) ?? emptyAccumulator(row.campaign);
    existing.campaign = row.campaign || existing.campaign;
    if (existing.advertiser_name === null) existing.advertiser_name = row.client_name;
    if (existing.start_date === null) existing.start_date = row.start_date;
    if (existing.end_date === null) existing.end_date = row.end_date;
    if (existing.budget === null && row.gross_budget) {
      existing.budget = parseNum(row.gross_budget);
    }
    map.set(row.campaign_id, existing);
  }

  for (const row of deliveryRows) {
    const existing = map.get(row.campaign_id) ?? emptyAccumulator(row.campaign);
    existing.campaign = row.campaign || existing.campaign;
    existing.gross_spend += row.cost_with_markup ?? 0;
    existing.impressions += row.impressions ?? 0;
    map.set(row.campaign_id, existing);
  }

  return Array.from(map.entries()).map(([campaign_id, data]) => accumulatorToRow(campaign_id, data));
}

export function filterCampaignRowsByBudget(
  rows: CampaignReportRow[],
  budgetRows: WheelerBudgetOut[]
): CampaignReportRow[] {
  if (budgetRows.length === 0) return [];
  const allowed = new Set(budgetRows.map((r) => r.campaign_id));
  return rows.filter((r) => allowed.has(r.campaign_id));
}

/** @deprecated Use buildCampaignReportRows for dashboard table rows. */
export function aggregatePageviewsByCampaign(
  rows: WheelerPageviewsStrategyOut[]
): CampaignReportRow[] {
  return buildCampaignReportRows(rows, [], []);
}

export function sortCampaignRows(
  rows: CampaignReportRow[],
  column: string,
  direction: "asc" | "desc"
): CampaignReportRow[] {
  const sorted = [...rows].sort((a, b) => {
    const av = a[column as keyof CampaignReportRow];
    const bv = b[column as keyof CampaignReportRow];
    if (av === null && bv === null) return 0;
    if (av === null) return 1;
    if (bv === null) return -1;
    if (typeof av === "string" && typeof bv === "string") {
      return av.localeCompare(bv);
    }
    const an = Number(av);
    const bn = Number(bv);
    if (Number.isNaN(an) && Number.isNaN(bn)) return 0;
    if (Number.isNaN(an)) return 1;
    if (Number.isNaN(bn)) return -1;
    return an - bn;
  });
  return direction === "desc" ? sorted.reverse() : sorted;
}

function formatShortDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);
}

export function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return "—";
  if (start && end) return `${formatShortDate(start)} → ${formatShortDate(end)}`;
  if (start) return formatShortDate(start);
  return formatShortDate(end!);
}

export function aggregatePageviewsByStrategy(
  rows: WheelerPageviewsStrategyOut[]
): TabMetricRow[] {
  const groups = new Map<string, TabMetricRow>();

  for (const row of rows) {
    const name = row.strategy?.trim() || "Unknown strategy";
    const existing = groups.get(name) ?? toTabRow(name, 0, 0, 0, 0);
    existing.spend += parseNum(row.cost_with_markup);
    existing.impressions += row.impressions ?? 0;
    existing.complete_views += row.complete_views ?? 0;
    existing.household = (existing.household ?? 0) + (row.household ?? 0);
    if (existing.session === null) existing.session = 0;
    if (existing.page_view === null) existing.page_view = 0;
    existing.session += row.session ?? 0;
    existing.page_view += row.page_view ?? 0;
    Object.assign(
      existing,
      deriveMetrics(
        existing.spend,
        existing.impressions,
        existing.complete_views,
        existing.household
      )
    );
    groups.set(name, existing);
  }

  return Array.from(groups.values()).sort((a, b) => b.spend - a.spend);
}

function groupDeliveryRows(
  rows: WheelerCampaignsDataOut[],
  keyFn: (row: WheelerCampaignsDataOut) => string
): TabMetricRow[] {
  const groups = new Map<string, TabMetricRow>();

  for (const row of rows) {
    const name = keyFn(row);
    const existing = groups.get(name) ?? toTabRow(name, 0, 0, 0, null);
    existing.spend += row.cost_with_markup ?? 0;
    existing.impressions += row.impressions ?? 0;
    existing.complete_views += parseNum(row.rich_media_video_completions);
    Object.assign(
      existing,
      deriveMetrics(existing.spend, existing.impressions, existing.complete_views, null)
    );
    groups.set(name, existing);
  }

  return Array.from(groups.values()).sort((a, b) => b.spend - a.spend);
}

export function aggregateDeliveryByTime(rows: WheelerCampaignsDataOut[]): TabMetricRow[] {
  return groupDeliveryRows(rows, (r) => r.campaign_date || "Unknown date");
}

export function aggregateDeliveryByAds(rows: WheelerCampaignsDataOut[]): TabMetricRow[] {
  return groupDeliveryRows(rows, (r) => r.creative?.trim() || "Unknown ad");
}

export function aggregateDeliveryByScreens(rows: WheelerCampaignsDataOut[]): TabMetricRow[] {
  return groupDeliveryRows(rows, (r) => r.device_type?.trim() || "Unknown screen");
}

export function aggregateDeliveryByInventory(rows: WheelerCampaignsDataOut[]): TabMetricRow[] {
  return groupDeliveryRows(rows, (r) => r.app_name?.trim() || "Unknown inventory");
}

export function aggregatePageviewsByApp(rows: WheelerPageviewsAppsOut[]): TabMetricRow[] {
  const groups = new Map<string, TabMetricRow>();

  for (const row of rows) {
    const name = row.app_name?.trim() || "Unknown inventory";
    const existing = groups.get(name) ?? toTabRow(name, 0, 0, 0, 0);
    existing.spend += parseNum(row.cost_with_markup);
    existing.impressions += row.impressions ?? 0;
    existing.complete_views += row.complete_views ?? 0;
    existing.household = (existing.household ?? 0) + (row.household ?? 0);
    if (existing.session === null) existing.session = 0;
    if (existing.page_view === null) existing.page_view = 0;
    existing.session += row.session ?? 0;
    existing.page_view += row.page_view ?? 0;
    Object.assign(
      existing,
      deriveMetrics(
        existing.spend,
        existing.impressions,
        existing.complete_views,
        existing.household
      )
    );
    groups.set(name, existing);
  }

  return Array.from(groups.values()).sort((a, b) => b.spend - a.spend);
}

export function aggregatePageviewsByDay(rows: WheelerPageviewsDayOut[]): TabMetricRow[] {
  const groups = new Map<string, TabMetricRow>();

  for (const row of rows) {
    const name = row.day?.trim() || "Unknown date";
    const existing = groups.get(name) ?? toTabRow(name, 0, 0, 0, 0);
    existing.spend += parseNum(row.cost_with_markup);
    existing.impressions += row.impressions ?? 0;
    existing.complete_views += row.complete_views ?? 0;
    existing.household = (existing.household ?? 0) + (row.household ?? 0);
    if (existing.session === null) existing.session = 0;
    if (existing.page_view === null) existing.page_view = 0;
    existing.session += row.session ?? 0;
    existing.page_view += row.page_view ?? 0;
    Object.assign(
      existing,
      deriveMetrics(
        existing.spend,
        existing.impressions,
        existing.complete_views,
        existing.household
      )
    );
    groups.set(name, existing);
  }

  return Array.from(groups.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function aggregatePageviewsByField<T extends {
  cost_with_markup: string | null;
  impressions: number | null;
  complete_views: number | null;
  household: number | null;
  session: number | null;
  page_view: number | null;
}>(
  rows: T[],
  getName: (row: T) => string
): TabMetricRow[] {
  const groups = new Map<string, TabMetricRow>();

  for (const row of rows) {
    const name = getName(row);
    const existing = groups.get(name) ?? toTabRow(name, 0, 0, 0, 0);
    existing.spend += parseNum(row.cost_with_markup);
    existing.impressions += row.impressions ?? 0;
    existing.complete_views += row.complete_views ?? 0;
    existing.household = (existing.household ?? 0) + (row.household ?? 0);
    if (existing.session === null) existing.session = 0;
    if (existing.page_view === null) existing.page_view = 0;
    existing.session += row.session ?? 0;
    existing.page_view += row.page_view ?? 0;
    Object.assign(
      existing,
      deriveMetrics(
        existing.spend,
        existing.impressions,
        existing.complete_views,
        existing.household
      )
    );
    groups.set(name, existing);
  }

  return Array.from(groups.values()).sort((a, b) => b.spend - a.spend);
}

export function aggregatePageviewsByZip(rows: WheelerPageviewsZipOut[]): TabMetricRow[] {
  const grouped = aggregatePageviewsByField(rows, (row) => row.zip_code?.trim() || "Unknown zip");
  return grouped.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}

export function aggregatePageviewsByCity(rows: WheelerPageviewsCityOut[]): TabMetricRow[] {
  return aggregatePageviewsByField(rows, (row) => row.city?.trim() || "Unknown city");
}

export function aggregateDeliveryByGeography(rows: WheelerCampaignsDataOut[]): TabMetricRow[] {
  return groupDeliveryRows(
    rows,
    (r) => r.dma?.trim() || r.city?.trim() || r.state_name?.trim() || "Unknown geography"
  );
}

export function buildPageviewsSummaryRow(
  pageviewsRows: WheelerPageviewsStrategyOut[],
  budget: WheelerBudgetOut | undefined,
  name = "All strategies"
): TabMetricRow | null {
  if (pageviewsRows.length === 0) return null;

  const totals = pageviewsRows.reduce(
    (acc, row) => {
      acc.spend += parseNum(row.cost_with_markup);
      acc.impressions += row.impressions ?? 0;
      acc.complete_views += row.complete_views ?? 0;
      acc.household += row.household ?? 0;
      acc.session += row.session ?? 0;
      acc.page_view += row.page_view ?? 0;
      return acc;
    },
    { spend: 0, impressions: 0, complete_views: 0, household: 0, session: 0, page_view: 0 }
  );

  const budgetAmount = budget?.gross_budget ? parseNum(budget.gross_budget) : null;
  const pacing =
    budgetAmount !== null && budgetAmount > 0 ? (totals.spend / budgetAmount) * 100 : null;

  const base = enrichTabRow(
    toTabRow(
      name,
      totals.spend,
      totals.impressions,
      totals.complete_views,
      totals.household > 0 ? totals.household : null
    ),
    budget
  );

  return {
    ...base,
    session: totals.session > 0 ? totals.session : null,
    page_view: totals.page_view > 0 ? totals.page_view : null,
    budget_amount: budgetAmount,
    pacing,
  };
}

export function summarizeTabRows(rows: TabMetricRow[]): TabMetricRow {
  const totals = rows.reduce(
    (acc, row) => {
      acc.spend += row.spend;
      acc.impressions += row.impressions;
      acc.complete_views += row.complete_views;
      if (row.household !== null) acc.household += row.household;
      if (row.session !== null) acc.session += row.session;
      if (row.page_view !== null) acc.page_view += row.page_view;
      return acc;
    },
    { spend: 0, impressions: 0, complete_views: 0, household: 0, session: 0, page_view: 0 }
  );

  const hasHousehold = rows.some((r) => r.household !== null);
  const hasSession = rows.some((r) => r.session !== null);
  const hasPageView = rows.some((r) => r.page_view !== null);
  const result = toTabRow(
    "All strategies",
    totals.spend,
    totals.impressions,
    totals.complete_views,
    hasHousehold ? totals.household : null
  );
  return {
    ...result,
    session: hasSession ? totals.session : null,
    page_view: hasPageView ? totals.page_view : null,
  };
}

export function findBudgetForCampaign(
  budgetRows: WheelerBudgetOut[],
  campaignId: string
): WheelerBudgetOut | undefined {
  return budgetRows.find((r) => r.campaign_id === campaignId);
}

export function formatPercent(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatDecimal(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toFixed(digits);
}

export function formatCurrencyDetailed(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function buildCampaignDetailHref(
  campaignId: string,
  params?: { from?: string; to?: string; tab?: CampaignDetailTab }
): string {
  const usp = new URLSearchParams();
  if (params?.from) usp.set("from", params.from);
  if (params?.to) usp.set("to", params.to);
  if (params?.tab) usp.set("tab", params.tab);
  const qs = usp.toString();
  return `/campaigns/${encodeURIComponent(campaignId)}${qs ? `?${qs}` : ""}`;
}

export function enrichSummaryWithPageviews(
  summary: TabMetricRow,
  pageviewsRows: WheelerPageviewsStrategyOut[]
): TabMetricRow {
  if (pageviewsRows.length === 0) return summary;
  const household = pageviewsRows.reduce((s, r) => s + (r.household ?? 0), 0);
  if (household <= 0) return summary;
  return {
    ...summary,
    household,
    frequency: summary.impressions > 0 ? summary.impressions / household : null,
  };
}

export function parseCampaignDetailTab(value: string | null): CampaignDetailTab {
  const valid = VISIBLE_CAMPAIGN_DETAIL_TABS.map((t) => t.id);
  if (value && valid.includes(value as CampaignDetailTab)) {
    return value as CampaignDetailTab;
  }
  return "strategies";
}

export function parseGeographyView(value: string | null): GeographyView {
  return value === "city" ? "city" : "zip";
}

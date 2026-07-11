import {
  WheelerBudgetIdsOut,
  WheelerBudgetIdsQuery,
  WheelerBudgetListOut,
  WheelerBudgetOut,
  WheelerBudgetQuery,
  WheelerCampaignsDataIdsOut,
  WheelerCampaignsDataIdsQuery,
  WheelerCampaignsDataListOut,
  WheelerCampaignsDataOut,
  WheelerCampaignsDataQuery,
  WheelerPageviewsStrategyIdsOut,
  WheelerPageviewsStrategyIdsQuery,
  WheelerPageviewsStrategyListOut,
  WheelerPageviewsStrategyOut,
  WheelerPageviewsStrategyQuery,
} from "./types";

/** Upstream page size for list endpoints (budget max is 500). */
export const PAGE_LIMIT = 500;

function toQueryString(params: object): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") usp.set(key, String(value));
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.error === "string") return body.error;
    if (typeof body?.detail === "string") return body.detail;
  } catch {
    // response wasn't JSON — fall through to the generic message
  }
  return `${fallback} (${res.status})`;
}

export async function fetchBudget(query: WheelerBudgetQuery): Promise<WheelerBudgetListOut> {
  const res = await fetch(`/api/wheeler-budget${toQueryString(query)}`);
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to load budget data"));
  return res.json();
}

export async function fetchBudgetCampaignIds(
  query: WheelerBudgetIdsQuery = {}
): Promise<WheelerBudgetIdsOut> {
  const res = await fetch(
    `/api/wheeler-budget/campaign-ids${toQueryString({ limit: PAGE_LIMIT, ...query })}`
  );
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to load campaign ids"));
  return res.json();
}

export async function fetchBudgetById(id: number): Promise<WheelerBudgetOut> {
  const res = await fetch(`/api/wheeler-budget/${id}`);
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to load budget detail"));
  return res.json();
}

export async function fetchCampaignsData(
  query: WheelerCampaignsDataQuery
): Promise<WheelerCampaignsDataListOut> {
  const res = await fetch(`/api/wheeler-campaigns-data${toQueryString(query)}`);
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to load delivery data"));
  return res.json();
}

export async function fetchCampaignsDataCampaignIds(
  query: WheelerCampaignsDataIdsQuery = {}
): Promise<WheelerCampaignsDataIdsOut> {
  const res = await fetch(
    `/api/wheeler-campaigns-data/campaign-ids${toQueryString({ limit: PAGE_LIMIT, ...query })}`
  );
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to load delivery campaign ids"));
  return res.json();
}

/**
 * Load budget rows for the dashboard in one request.
 * Budget set is small (~hundreds); never page the full delivery table.
 */
export async function fetchReportBudget(
  query: Omit<WheelerBudgetQuery, "limit" | "offset">
): Promise<{ items: WheelerBudgetOut[]; total: number }> {
  const page = await fetchBudget({
    ...query,
    limit: PAGE_LIMIT,
    offset: 0,
    order: query.order ?? "start_date",
  });
  return { items: page.items, total: page.total };
}

/**
 * Load a single page of delivery rows for charts/KPIs.
 * Upstream has 1M+ rows — never attempt to fetch the full set.
 */
export async function fetchReportDelivery(
  query: Omit<WheelerCampaignsDataQuery, "limit" | "offset">
): Promise<{ items: WheelerCampaignsDataOut[]; total: number; truncated: boolean }> {
  const page = await fetchCampaignsData({
    ...query,
    limit: PAGE_LIMIT,
    offset: 0,
    order: query.order ?? "-campaign_date",
  });
  return {
    items: page.items,
    total: page.total,
    truncated: page.total > page.items.length,
  };
}

export function sumDeliveryRows(rows: WheelerCampaignsDataOut[]): {
  totalImpressions: number;
  totalSpend: number;
} {
  return rows.reduce(
    (acc, row) => {
      acc.totalImpressions += row.impressions ?? 0;
      acc.totalSpend += row.cost_with_markup ?? 0;
      return acc;
    },
    { totalImpressions: 0, totalSpend: 0 }
  );
}

export function sumPageviewsRows(rows: WheelerPageviewsStrategyOut[]): {
  totalImpressions: number;
  totalSpend: number;
} {
  return rows.reduce(
    (acc, row) => {
      acc.totalImpressions += row.impressions ?? 0;
      const spend =
        typeof row.cost_with_markup === "string"
          ? parseFloat(row.cost_with_markup)
          : (row.cost_with_markup ?? 0);
      acc.totalSpend += Number.isNaN(spend) ? 0 : spend;
      return acc;
    },
    { totalImpressions: 0, totalSpend: 0 }
  );
}

export async function fetchPageviewsTotals(
  query: Omit<WheelerPageviewsStrategyQuery, "limit" | "offset">
): Promise<{ totalImpressions: number; totalSpend: number; totalRows: number }> {
  const res = await fetch(`/api/wheeler-pageviews-strategy/totals${toQueryString(query)}`);
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to load pageviews totals"));
  return res.json();
}

export async function fetchPageviewsStrategy(
  query: WheelerPageviewsStrategyQuery
): Promise<WheelerPageviewsStrategyListOut> {
  const res = await fetch(`/api/wheeler-pageviews-strategy${toQueryString(query)}`);
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to load pageviews strategy data"));
  return res.json();
}

export async function fetchPageviewsStrategyCampaignIds(
  query: WheelerPageviewsStrategyIdsQuery = {}
): Promise<WheelerPageviewsStrategyIdsOut> {
  const res = await fetch(
    `/api/wheeler-pageviews-strategy/campaign-ids${toQueryString({ limit: PAGE_LIMIT, ...query })}`
  );
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to load pageviews campaign ids"));
  return res.json();
}

export async function fetchPageviewsStrategyById(id: number): Promise<WheelerPageviewsStrategyOut> {
  const res = await fetch(`/api/wheeler-pageviews-strategy/${id}`);
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to load pageviews strategy detail"));
  return res.json();
}

export async function fetchReportPageviewsStrategy(
  query: Omit<WheelerPageviewsStrategyQuery, "limit" | "offset">
): Promise<{ items: WheelerPageviewsStrategyOut[]; total: number; truncated: boolean }> {
  const page = await fetchPageviewsStrategy({
    ...query,
    limit: PAGE_LIMIT,
    offset: 0,
    order: query.order ?? "-impressions",
  });
  return {
    items: page.items,
    total: page.total,
    truncated: page.total > page.items.length,
  };
}

// --- formatting helpers ---

export function formatCurrency(value: string | number | null | undefined): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatNumber(value: string | number | null | undefined): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US").format(n);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);
}

import type { CampaignDetailTab, GeographyView } from "./campaignMetrics";

export type SortDirection = "asc" | "desc";

export interface TableSort {
  column: string;
  direction: SortDirection;
}

export const DEFAULT_BUDGET_SORT: TableSort = { column: "start_date", direction: "asc" };
export const DEFAULT_DELIVERY_SORT: TableSort = { column: "campaign_date", direction: "desc" };
export const DEFAULT_PAGEVIEWS_SORT: TableSort = { column: "impressions", direction: "desc" };
export const DEFAULT_CAMPAIGNS_SORT: TableSort = { column: "complete_views", direction: "desc" };
export const DEFAULT_TIME_TAB_SORT: TableSort = { column: "name", direction: "asc" };
export const DEFAULT_GEO_ZIP_SORT: TableSort = { column: "name", direction: "asc" };

export function defaultSortForCampaignDetailTab(
  tab: CampaignDetailTab,
  geographyView: GeographyView = "zip"
): TableSort {
  if (tab === "time") return DEFAULT_TIME_TAB_SORT;
  if (tab === "geography" && geographyView === "zip") return DEFAULT_GEO_ZIP_SORT;
  return DEFAULT_CAMPAIGNS_SORT;
}

export function toOrderParam(sort: TableSort): string {
  return sort.direction === "desc" ? `-${sort.column}` : sort.column;
}

export function toggleSort(current: TableSort, column: string): TableSort {
  if (current.column === column) {
    return { column, direction: current.direction === "asc" ? "desc" : "asc" };
  }
  return { column, direction: "asc" };
}

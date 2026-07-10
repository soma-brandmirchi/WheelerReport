export type SortDirection = "asc" | "desc";

export interface TableSort {
  column: string;
  direction: SortDirection;
}

export const DEFAULT_BUDGET_SORT: TableSort = { column: "start_date", direction: "asc" };
export const DEFAULT_DELIVERY_SORT: TableSort = { column: "campaign_date", direction: "desc" };
export const DEFAULT_PAGEVIEWS_SORT: TableSort = { column: "impressions", direction: "desc" };
export const DEFAULT_CAMPAIGNS_SORT: TableSort = { column: "complete_views", direction: "desc" };

export function toOrderParam(sort: TableSort): string {
  return sort.direction === "desc" ? `-${sort.column}` : sort.column;
}

export function toggleSort(current: TableSort, column: string): TableSort {
  if (current.column === column) {
    return { column, direction: current.direction === "asc" ? "desc" : "asc" };
  }
  return { column, direction: "asc" };
}

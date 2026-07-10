// Types mirrored from the Wheeler Adconnect OpenAPI spec
// (WheelerBudgetOut, WheelerCampaignsDataOut, and their list wrappers).

export interface WheelerBudgetOut {
  id: number;
  campaign_id: string;
  campaign: string;
  client_name: string | null;
  campaign_type: string | null;
  start_date: string; // date
  end_date: string; // date
  gross_budget: string | null; // numeric string, e.g. "12500.00"
}

export interface WheelerBudgetListOut {
  items: WheelerBudgetOut[];
  total: number;
  limit: number;
  offset: number;
}

export interface WheelerBudgetIdsOut {
  campaign_ids: string[];
  total: number;
}

export interface WheelerCampaignsDataOut {
  id: number;
  campaign_id: string;
  campaign: string;
  strategy: string | null;
  app_name: string | null;
  campaign_date: string; // date
  hour: string | null;
  zip_postal_code: string | null;
  city: string | null;
  state_name: string | null;
  dma: string | null;
  device_type: string | null;
  creative: string | null;
  cost_with_markup: number | null;
  impressions: number | null;
  rich_media_video_completions: string | null;
}

export interface WheelerCampaignsDataListOut {
  items: WheelerCampaignsDataOut[];
  total: number;
  limit: number;
  offset: number;
}

export interface WheelerCampaignsDataIdsOut {
  campaign_ids: string[];
  total: number;
}

/** Query params for GET /api/wheeler-budget (OpenAPI). */
export interface WheelerBudgetQuery {
  campaign_ids?: string;
  campaign_id_prefix?: string;
  campaign_id_contains?: string;
  campaign?: string;
  client_name?: string;
  campaign_type?: string;
  start_date?: string;
  end_date?: string;
  start_from_date?: string;
  end_to_date?: string;
  start_month?: string | number;
  start_year?: string | number;
  end_month?: string | number;
  end_year?: string | number;
  gross_budget?: string;
  limit?: number;
  offset?: number;
  order?: string;
}

/** Query params for GET /api/wheeler-budget/campaign-ids. */
export interface WheelerBudgetIdsQuery {
  prefix?: string;
  client_name?: string;
  limit?: number;
}

/** Query params for GET /api/wheeler-campaigns-data (OpenAPI). */
export interface WheelerCampaignsDataQuery {
  campaign_ids?: string;
  campaign_id_prefix?: string;
  campaign_id_contains?: string;
  campaign?: string;
  strategy?: string;
  app_name?: string;
  campaign_date?: string;
  start_from_date?: string;
  end_to_date?: string;
  start_month?: string | number;
  start_year?: string | number;
  end_month?: string | number;
  end_year?: string | number;
  hour?: string;
  zip_postal_code?: string;
  city?: string;
  state_name?: string;
  dma?: string;
  device_type?: string;
  creative?: string;
  impressions_min?: string | number;
  limit?: number;
  offset?: number;
  order?: string;
}

/** Query params for GET /api/wheeler-campaigns-data/campaign-ids. */
export interface WheelerCampaignsDataIdsQuery {
  prefix?: string;
  campaign?: string;
  limit?: number;
}

export const BUDGET_QUERY_KEYS = [
  "campaign_ids",
  "campaign_id_prefix",
  "campaign_id_contains",
  "campaign",
  "client_name",
  "campaign_type",
  "start_date",
  "end_date",
  "start_from_date",
  "end_to_date",
  "start_month",
  "start_year",
  "end_month",
  "end_year",
  "gross_budget",
  "limit",
  "offset",
  "order",
] as const;

export const CAMPAIGNS_DATA_QUERY_KEYS = [
  "campaign_ids",
  "campaign_id_prefix",
  "campaign_id_contains",
  "campaign",
  "strategy",
  "app_name",
  "campaign_date",
  "start_from_date",
  "end_to_date",
  "start_month",
  "start_year",
  "end_month",
  "end_year",
  "hour",
  "zip_postal_code",
  "city",
  "state_name",
  "dma",
  "device_type",
  "creative",
  "impressions_min",
  "limit",
  "offset",
  "order",
] as const;

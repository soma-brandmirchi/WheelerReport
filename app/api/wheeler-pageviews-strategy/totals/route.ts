import { NextRequest, NextResponse } from "next/server";
import { wheelerFetch, describeFetchError } from "@/lib/wheelerClient";
import { pickSearchParams } from "@/lib/proxyParams";
import {
  PAGEVIEWS_STRATEGY_QUERY_KEYS,
  WheelerPageviewsStrategyListOut,
  WheelerPageviewsStrategyOut,
} from "@/lib/types";

const PAGE_SIZE = 500;
const PARALLEL_REQUESTS = 8;

function parseNum(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === "string" ? parseFloat(value) : value;
  return Number.isNaN(n) ? 0 : n;
}

function sumItems(items: WheelerPageviewsStrategyOut[]) {
  let totalImpressions = 0;
  let totalSpend = 0;
  for (const row of items) {
    totalImpressions += row.impressions ?? 0;
    totalSpend += parseNum(row.cost_with_markup);
  }
  return { totalImpressions, totalSpend };
}

async function fetchPage(
  baseParams: Record<string, string | undefined>,
  offset: number
): Promise<WheelerPageviewsStrategyListOut> {
  const upstream = await wheelerFetch("/api/wheeler-pageviews-strategy", {
    ...baseParams,
    limit: PAGE_SIZE,
    offset,
    order: baseParams.order ?? "-impressions",
  });

  if (!upstream.ok) {
    throw new Error(`Upstream pageviews request failed (${upstream.status})`);
  }

  return upstream.json() as Promise<WheelerPageviewsStrategyListOut>;
}

export async function GET(req: NextRequest) {
  try {
    const baseParams = pickSearchParams(
      req,
      PAGEVIEWS_STRATEGY_QUERY_KEYS.filter((k) => k !== "limit" && k !== "offset")
    );

    const firstPage = await fetchPage(baseParams, 0);
    const firstSums = sumItems(firstPage.items);

    let totalImpressions = firstSums.totalImpressions;
    let totalSpend = firstSums.totalSpend;
    const totalRows = firstPage.total;

    const offsets: number[] = [];
    for (let offset = firstPage.items.length; offset < totalRows; offset += PAGE_SIZE) {
      offsets.push(offset);
    }

    for (let i = 0; i < offsets.length; i += PARALLEL_REQUESTS) {
      const batch = offsets.slice(i, i + PARALLEL_REQUESTS);
      const pages = await Promise.all(batch.map((offset) => fetchPage(baseParams, offset)));
      for (const page of pages) {
        const sums = sumItems(page.items);
        totalImpressions += sums.totalImpressions;
        totalSpend += sums.totalSpend;
      }
    }

    return NextResponse.json({ totalImpressions, totalSpend, totalRows });
  } catch (err) {
    return NextResponse.json({ error: describeFetchError(err) }, { status: 502 });
  }
}

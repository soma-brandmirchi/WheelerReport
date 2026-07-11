import { NextRequest, NextResponse } from "next/server";
import { wheelerFetch, describeFetchError } from "@/lib/wheelerClient";
import { pickSearchParams } from "@/lib/proxyParams";
import { PAGEVIEWS_APPS_QUERY_KEYS } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const params = pickSearchParams(req, [...PAGEVIEWS_APPS_QUERY_KEYS]);
    let upstream = await wheelerFetch("/api/wheeler-pageviews-app", params);

    if (upstream.status === 404) {
      upstream = await wheelerFetch("/api/wheeler_pageviews_apps", params);
    }

    const body = await upstream.text();
    return new NextResponse(body, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return NextResponse.json({ error: describeFetchError(err) }, { status: 502 });
  }
}

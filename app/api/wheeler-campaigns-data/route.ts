import { NextRequest, NextResponse } from "next/server";
import { wheelerFetch, describeFetchError } from "@/lib/wheelerClient";
import { pickSearchParams } from "@/lib/proxyParams";
import { CAMPAIGNS_DATA_QUERY_KEYS } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const upstream = await wheelerFetch(
      "/api/wheeler-campaigns-data",
      pickSearchParams(req, [...CAMPAIGNS_DATA_QUERY_KEYS])
    );

    const body = await upstream.text();
    return new NextResponse(body, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return NextResponse.json({ error: describeFetchError(err) }, { status: 502 });
  }
}

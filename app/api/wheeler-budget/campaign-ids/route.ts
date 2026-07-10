import { NextRequest, NextResponse } from "next/server";
import { wheelerFetch, describeFetchError } from "@/lib/wheelerClient";
import { pickSearchParams } from "@/lib/proxyParams";

export async function GET(req: NextRequest) {
  try {
    const upstream = await wheelerFetch(
      "/api/wheeler-budget/campaign-ids",
      pickSearchParams(req, ["prefix", "client_name", "limit"])
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

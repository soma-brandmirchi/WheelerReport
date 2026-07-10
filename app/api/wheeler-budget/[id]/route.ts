import { NextRequest, NextResponse } from "next/server";
import { wheelerFetch, describeFetchError } from "@/lib/wheelerClient";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Invalid budget id" }, { status: 400 });
  }

  try {
    const upstream = await wheelerFetch(`/api/wheeler-budget/${id}`, {});
    const body = await upstream.text();
    return new NextResponse(body, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return NextResponse.json({ error: describeFetchError(err) }, { status: 502 });
  }
}

import { NextRequest } from "next/server";

/** Forward every non-empty query param from the browser request upstream. */
export function pickSearchParams(req: NextRequest, keys: string[]): Record<string, string | undefined> {
  const sp = req.nextUrl.searchParams;
  const out: Record<string, string | undefined> = {};
  for (const key of keys) {
    const value = sp.get(key);
    if (value !== null && value !== "") out[key] = value;
  }
  return out;
}

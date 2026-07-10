// Server-only helper used inside app/api/** route handlers to call the
// upstream Wheeler Adconnect API, attaching a bearer token when configured.

import { getBaseUrl, getBearerToken } from "./wheelerAuth";
import { wheelerServerFetch } from "./wheelerServerFetch";

export async function wheelerFetch(
  path: string,
  searchParams: Record<string, string | number | undefined>
): Promise<Response> {
  const url = new URL(`${getBaseUrl()}${path}`);
  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const doFetch = async (token: string | null) =>
    wheelerServerFetch(url.toString(), {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: "no-store",
    });

  let token = await getBearerToken();
  let res = await doFetch(token);

  // If the token expired mid-session, refresh once and retry.
  if (res.status === 401) {
    token = await getBearerToken(true);
    res = await doFetch(token);
  }

  return res;
}

/**
 * Node/undici wraps low-level network failures (DNS, TLS, refused
 * connection, timeout...) in a generic "fetch failed" Error and puts the
 * actual reason in `error.cause`. This unwraps it so the UI can show
 * something actionable instead of just "fetch failed".
 */
export function describeFetchError(err: unknown): string {
  if (err instanceof Error) {
    const cause = (err as Error & { cause?: unknown }).cause;
    if (cause instanceof Error) {
      const code = (cause as NodeJS.ErrnoException).code;
      return code ? `${cause.message} (${code})` : cause.message;
    }
    return err.message;
  }
  return "Unknown error contacting Wheeler API";
}

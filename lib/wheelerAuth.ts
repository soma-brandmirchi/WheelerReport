// Server-only. Fetches and caches a bearer token from the Wheeler Adconnect
// OAuth2 password flow (POST /api/login), so the browser never sees
// credentials or the raw API base URL.

import { wheelerServerFetch } from "./wheelerServerFetch";

interface CachedToken {
  token: string;
  fetchedAt: number;
}

let cached: CachedToken | null = null;
const TOKEN_TTL_MS = 50 * 60 * 1000; // refresh well before a typical 60min JWT expiry

function getBaseUrl(): string {
  const base = process.env.WHEELER_API_BASE_URL;
  if (!base) {
    throw new Error("WHEELER_API_BASE_URL is not set. Copy .env.local.example to .env.local and fill it in.");
  }
  return base.replace(/\/$/, "");
}

async function fetchToken(): Promise<string | null> {
  const username = process.env.WHEELER_API_USERNAME;
  const password = process.env.WHEELER_API_PASSWORD;

  // No credentials configured -> assume the upstream API doesn't require auth.
  if (!username || !password) return null;

  const res = await wheelerServerFetch(`${getBaseUrl()}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Wheeler API login failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { access_token: string; token_type: string };
  return data.access_token;
}

export async function getBearerToken(forceRefresh = false): Promise<string | null> {
  const isStale = !cached || Date.now() - cached.fetchedAt > TOKEN_TTL_MS;

  if (forceRefresh || isStale) {
    const token = await fetchToken();
    if (token) {
      cached = { token, fetchedAt: Date.now() };
    } else {
      cached = null;
    }
  }

  return cached?.token ?? null;
}

export { getBaseUrl };

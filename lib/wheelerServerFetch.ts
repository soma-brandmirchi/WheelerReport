// Server-only fetch wrapper for upstream Wheeler API calls.
// Node's fetch rejects wheeleradconnect.com's incomplete TLS cert chain;
// set WHEELER_API_INSECURE_TLS=true in .env.local to bypass verification in dev.

import { Agent, fetch as undiciFetch, type RequestInit as UndiciRequestInit } from "undici";

let insecureDispatcher: Agent | undefined;

export async function wheelerServerFetch(
  url: string,
  init?: RequestInit
): Promise<Response> {
  if (process.env.WHEELER_API_INSECURE_TLS === "true") {
    if (!insecureDispatcher) {
      insecureDispatcher = new Agent({ connect: { rejectUnauthorized: false } });
    }
    return undiciFetch(url, {
      ...(init as UndiciRequestInit),
      dispatcher: insecureDispatcher,
    }) as unknown as Promise<Response>;
  }

  return fetch(url, init);
}

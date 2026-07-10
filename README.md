# Wheeler Budget Report

A Next.js 14 (App Router + TypeScript + Tailwind) dashboard that visualizes
campaign budget and delivery data from the Wheeler Adconnect API
(`/api/wheeler-budget`, `/api/wheeler-budget/campaign-ids`,
`/api/wheeler-campaigns-data`, `/api/wheeler-campaigns-data/campaign-ids`).

## What's inside

- **Server-side proxy routes** (`app/api/**`) — the browser never talks to
  `wheeleradconnect.com` directly. This avoids CORS issues and keeps the API
  base URL / credentials off the client.
- **Auth handling** (`lib/wheelerAuth.ts`) — if you set
  `WHEELER_API_USERNAME` / `WHEELER_API_PASSWORD`, the app logs in via
  `POST /api/login` (OAuth2 password flow) and caches the bearer token,
  refreshing it automatically on a 401. If you leave those blank, requests go
  out with no `Authorization` header.
- **Dashboard UI** (`app/page.tsx` + `components/`) — filter bar (campaign,
  client name, date range), KPI cards over the full filtered set, budget and
  delivery charts (including DMA), paginated budget table with row detail
  drawer (`GET /api/wheeler-budget/{id}`), and a delivery detail table.

## Setup

The `.env.local` in this zip is already pointed at `https://wheeleradconnect.com`
with no credentials (since that API is open). Just install and run:

```bash
npm install
npm run dev
```

If you ever need to point at a different environment or add auth, edit
`.env.local` directly — no need to copy from the example file again.

## Wiring up more endpoints

The OpenAPI spec also lists client, geo-targeting, channel, and PPT-report
endpoints (`/api/clients`, `/api/wheeler-campaigns-data/{id}`, geo/proximity
routes, etc.). Budget-by-id is already wired. The same pattern extends to the rest:

1. Add the matching type to `lib/types.ts` (copy the shape from the
   `components.schemas` section of the swagger spec).
2. Add a proxy route under `app/api/<path>/route.ts` that calls
   `wheelerFetch("/api/<path>", { ...query })`.
3. Add a client-side fetcher in `lib/api.ts` and consume it from a component.

## Notes

- KPI cards and charts load the full filtered budget/delivery sets by paging
  the upstream API (500 rows per request). Very large unfiltered pulls can
  take a few seconds; narrow with campaign/date filters when possible.
- Tailwind tokens (colors, fonts) live in `tailwind.config.ts` — the palette
  is a deliberate "broadcast signal" theme (ink navy, signal amber, teal)
  rather than the framework defaults.

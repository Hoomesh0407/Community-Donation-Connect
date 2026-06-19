# Community Donation Connect

A multilingual NGO-style platform connecting donors and receivers within local communities. Donors list items they want to give away; receivers request items they need; a smart matching engine connects them by category, location, and trust score.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/community-donation-connect run dev` — run the frontend (port 26234)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned by Replit)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + wouter routing
- API: Express 5, pino logging
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (zod/v4), drizzle-zod
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- i18n: Custom React context (English + Telugu)

## Where things live

- `lib/api-spec/openapi.yaml` — Single source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle schema: users, donations, requests, matches, reviews, notifications
- `artifacts/api-server/src/routes/` — All API route handlers
- `artifacts/api-server/src/lib/auth.ts` — JWT-like token auth + trust score helpers
- `artifacts/api-server/src/lib/distance.ts` — Haversine distance calculation
- `artifacts/community-donation-connect/src/` — React frontend
- `artifacts/community-donation-connect/src/lib/i18n.ts` — Internationalization (en/te)
- `artifacts/community-donation-connect/src/hooks/useAuth.tsx` — Auth context
- `lib/api-client-react/src/generated/` — Generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — Generated Zod schemas for server validation (do not edit)

## Architecture decisions

- **Contract-first API**: OpenAPI spec → Orval codegen → typed React Query hooks + Zod schemas. Never hand-write types the codegen produces.
- **Privacy protection**: Phone/email hidden before both parties accept a match. Only first name + area shown pre-match.
- **Trust score system**: Donors earn points per review star rating. 0-50 = New, 51-150 = Trusted, 151-300 = Highly Trusted, 301+ = Champion.
- **Smart matching**: Haversine distance-based matching, filtered by category/radius, sorted by urgency > verified > trust score.
- **In-memory token store**: Session tokens stored in a Map (resets on server restart). For production, replace with Redis or DB-backed sessions.

## Product

- Language selection screen (English / Telugu) as the entry point
- Donor workflow: choose category → item details → photo/video proof → location + radius → publish
- Receiver workflow: choose category → reason + urgency → location + radius → submit
- Smart matching engine: same category + within radius + verified first + trust score priority
- Privacy: contact details only revealed after both parties accept the match
- Trust score system with badges: New / Trusted / Highly Trusted / Community Champion
- Review system: quality + condition + satisfaction ratings after each completed donation
- Admin dashboard: user verification, suspension, platform stats, category analytics
- Notifications for match events, acceptance, and review requests
- Trust leaderboard showing top community donors

## User preferences

- Build with English and Telugu multilingual support
- NGO/community style — warm blues (#1e40af) and greens (#16a34a)
- No emojis in the UI

## Gotchas

- Always re-run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec change
- The token store is in-memory (Map) — tokens reset on server restart. Users need to log in again.
- The `i18n.ts` uses a React context (NOT zustand) to avoid infinite loop issues with selector object equality
- When adding new DB tables, add them to `lib/db/src/schema/index.ts` and run `pnpm --filter @workspace/db run push`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Demo users seeded: ravi@example.com, priya@example.com (donors), suresh@example.com, lakshmi@example.com (receivers) — all password Test@123
- Admin user: admin@cdc.org / Admin@123

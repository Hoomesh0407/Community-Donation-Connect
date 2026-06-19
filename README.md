# Community Donation Connect

A full-stack multilingual NGO-style platform connecting donors and receivers within local communities. Donors list items they want to give away, receivers request what they need, and a smart matching engine connects them by category, location, and trust score — with privacy protection until both parties accept.

---

## Features

- **Language Selection** — English / Telugu as the entry point
- **Donor Workflow** — Category picker → Item details → Condition → Location + radius → Publish
- **Receiver Workflow** — Category → Reason + urgency level → Location + radius → Submit
- **Smart Matching Engine** — Haversine distance-based, sorted by urgency > verified > trust score
- **Real-Time Notifications** — Server-Sent Events (SSE) push alerts for match events without page refresh
- **Privacy Protection** — Contact details (phone, email) revealed only after both parties accept a match
- **Trust Score System** — Donors earn points per review. Badges: New / Trusted / Highly Trusted / Champion
- **Review System** — Quality + condition + satisfaction ratings after each completed exchange
- **Admin Dashboard** — User verification, suspension, platform stats, category analytics
- **Trust Leaderboard** — Top community donors ranked by trust score
- **Notifications Page** — Full feed with mark-as-read support

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS + wouter |
| API | Express 5 + pino logging |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod v4 + drizzle-zod |
| API Contract | OpenAPI 3.0 spec → Orval codegen |
| Generated Hooks | TanStack React Query (from Orval) |
| Language | TypeScript 5.9 across all packages |
| Workspace | pnpm monorepo |
| i18n | Custom React context (English + Telugu) |
| Real-time | Server-Sent Events (SSE) |

---

## Project Structure

```
community-donation-connect/
├── artifacts/
│   ├── api-server/          # Express 5 backend
│   │   └── src/
│   │       ├── routes/      # Auth, users, donations, requests, matches, reviews, notifications, admin
│   │       └── lib/         # Auth (tokens), distance (Haversine), trust score helpers
│   └── community-donation-connect/   # React + Vite frontend
│       └── src/
│           ├── pages/       # All page components
│           ├── components/  # Navbar, AppLayout, UI primitives (shadcn)
│           └── hooks/       # useAuth, useSSENotifications
├── lib/
│   ├── api-spec/            # OpenAPI 3.0 YAML (source of truth)
│   ├── api-client-react/    # Generated React Query hooks (do not edit)
│   ├── api-zod/             # Generated Zod schemas (do not edit)
│   └── db/                  # Drizzle ORM schema + migrations
└── pnpm-workspace.yaml
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database

### Setup

```bash
# Install dependencies
pnpm install

# Set environment variable
export DATABASE_URL="postgresql://user:password@localhost:5432/cdc"

# Push database schema
pnpm --filter @workspace/db run push

# Start API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start frontend (port 3000)
pnpm --filter @workspace/community-donation-connect run dev
```

### Code Generation

After any change to `lib/api-spec/openapi.yaml`:

```bash
pnpm --filter @workspace/api-spec run codegen
```

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@cdc.org | Admin@123 |
| Donor | ravi@example.com | Test@123 |
| Donor | priya@example.com | Test@123 |
| Receiver | suresh@example.com | Test@123 |
| Receiver | lakshmi@example.com | Test@123 |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/donations | List all donations |
| POST | /api/donations | Create donation |
| GET | /api/requests | List all requests |
| POST | /api/requests | Create request |
| GET | /api/matches | Get user's matches |
| PATCH | /api/matches/:id/accept | Accept a match |
| PATCH | /api/matches/:id/confirm | Confirm exchange |
| POST | /api/reviews | Submit a review |
| GET | /api/notifications | Get notifications |
| GET | /api/notifications/stream | SSE stream (real-time) |
| GET | /api/users/leaderboard | Trust leaderboard |
| GET | /api/admin/stats | Admin platform stats |

---

## Architecture Decisions

- **Contract-first API**: OpenAPI spec → Orval codegen → typed React Query hooks + Zod schemas. Never hand-write types the codegen produces.
- **Privacy by design**: Phone/email only revealed after both `donorAccepted` AND `receiverAccepted` are true.
- **In-memory token store**: Session tokens stored in a `Map` (resets on server restart). For production, replace with Redis or DB-backed sessions.
- **SSE for real-time**: Server-Sent Events over HTTP/1.1 for push notifications — no WebSocket dependency, works through standard proxies.
- **i18n via React context**: Zustand caused infinite render loops with object-selector equality; plain React context with `useCallback` avoids this.

---

## License

MIT — build freely, help communities.

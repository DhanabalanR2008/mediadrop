# MediaDrop

A premium full-stack media downloader SaaS platform where users paste URLs from YouTube, Instagram, TikTok, Twitter/X, Reddit, Vimeo, SoundCloud and more to download video, audio, or images in their chosen format.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/media-downloader run dev` — run the frontend (port 23454)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Framer Motion, react-icons
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI source of truth for all API contracts
- `lib/db/src/schema/downloads.ts` — downloads table schema
- `artifacts/api-server/src/routes/` — API route handlers (health, media, downloads, stats)
- `artifacts/api-server/src/lib/media-parser.ts` — URL platform detection + metadata simulation
- `artifacts/media-downloader/src/pages/` — React pages (Home, Downloader, History, Pricing, About)

## Architecture decisions

- Platform detection is done server-side in `media-parser.ts` — client just passes the URL
- Media parsing is simulated (no yt-dlp/ffmpeg) — returns realistic format options and metadata
- Downloads are tracked in the `downloads` table for history and analytics
- Stats endpoints use SQL aggregates for real-time platform breakdowns and counts
- No auth in v1 — all downloads are shared/global history

## Product

- Paste any URL from 14+ supported platforms
- Auto-detects platform, fetches metadata (title, thumbnail, author, duration)
- Shows format options by type (Video tabs, Audio tabs, Image tabs) with quality/size info
- Records every download to history with platform filter tabs
- Home page shows live stats (total downloads, by type, by platform)
- Pricing page with Free / Premium / Business plans

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any OpenAPI spec change, always run codegen before restarting workflows
- `pnpm --filter @workspace/db run push` needed after schema changes
- Media download is simulated — no actual file download occurs (would need yt-dlp integration)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

Two-process app, both shipped in a single Docker image:

```
[Browser] → [Next.js frontend, :3000] → [Axum Rust backend, :8080] → [UniFi Controller API]
```

- **Frontend** ([frontend/](frontend/)) is the only thing the browser ever talks to. It rewrites `/rust-api/*` → backend `/api/*` in [frontend/src/proxy.ts](frontend/src/proxy.ts) (Next.js middleware). UniFi credentials never leave the backend.
- **Backend** ([backend/](backend/)) is a stateless Axum server in [backend/src/main.rs](backend/src/main.rs). It holds the `reqwest` client to the UniFi Controller and is the only component with the `UNIFI_API_KEY`.
- The frontend Next.js middleware is **also** the access-control layer — it enforces both Entra ID auth and the optional `GUEST_SUBNETWORK` IP filter. The backend trusts whatever IP arrives via `x-forwarded-for`, so the frontend must always be the only public entrypoint.

### Authentication (Microsoft Entra ID)

Auth is handled by Auth.js v5 ([frontend/src/auth.ts](frontend/src/auth.ts)) running inside the Next.js server process — no auth code runs in the backend. The `[...nextauth]` route handler at [frontend/src/app/api/auth/[...nextauth]/route.ts](frontend/src/app/api/auth/[...nextauth]/route.ts) exposes `/api/auth/*` for the OAuth dance.

**Protected vs. public routes** (enforced in the middleware matcher):
- 🔒 `/`, `/print`, `/rust-api/*` — require a valid session
- 🌍 `/welcome`, `/kiosk`, `/api/auth/*` — bypass the middleware entirely
- 🌍 `/rust-api/vouchers/rolling` — listed in `publicApiPaths` so guests can rotate vouchers without signing in

**Group-based authorization:** the `signIn` callback in [frontend/src/auth.ts](frontend/src/auth.ts) checks that the `groups` claim from the Entra ID ID token contains `ADMIN_GROUP_ID`. Users outside that group are rejected *before* a session is created, so no redirect loop. The `groups` claim must be enabled in **Entra ID → App registration → Token configuration → Optional claims**. If a user belongs to more than ~200 groups Entra ID sends `hasgroups: true` instead of the array, which this code does not handle — switch to a Graph API lookup if you need that.

**Required env vars** (all read by the Next.js server at runtime):
- `AUTH_SECRET` — JWT signing key, any random ≥32-byte string
- `AUTH_MICROSOFT_ENTRA_ID_ID` / `_SECRET` / `_TENANT_ID` — from the App Registration
- `ADMIN_GROUP_ID` — Object ID of the allowed group (if unset, *any* authenticated Entra ID user gets in — a warning is logged)
- `AUTH_TRUST_HOST=true` — set in the Dockerfile default, needed when behind a reverse proxy

### Rolling vouchers (load-bearing convention)

Rolling vouchers are identified purely by name prefix `[ROLLING]` (see `ROLLING_VOUCHER_NAME_PREFIX` in [backend/src/unifi_api.rs](backend/src/unifi_api.rs)). The full name format is `[ROLLING] YYYYMMDDhhmmss-<client-ip>`. This single string is how the backend:
- Distinguishes rolling from manually-created vouchers
- Enforces "one rolling voucher per IP per session" (via `check_rolling_voucher_ip`, which substring-matches the IP in the name)
- Targets the daily-purge cleanup ([backend/src/tasks.rs](backend/src/tasks.rs), runs at midnight in the configured `TIMEZONE`)

If you change the prefix, format, or stop encoding the IP into the name, you break all three behaviors silently.

### Configuration

All runtime config lives in a single **`.env` file** at the repo root (gitignored). [.env.example](.env.example) is the committed template — copy it to `.env` and fill in values. Compose loads it via `env_file:` in [compose.yaml](compose.yaml); the backend reads the same file via its `dotenv` cargo feature. There is **no `environment:` block in compose.yaml** — adding one bypasses the single-source-of-truth pattern.

**Exception — client-side WiFi QR settings:** `WIFI_SSID`, `WIFI_PASSWORD`, `WIFI_TYPE`, `WIFI_HIDDEN` have to reach the *browser*, so they can't be server-only env vars. [scripts/entrypoint.sh](scripts/entrypoint.sh) reads them from the container's env at **startup** and writes `frontend/public/runtime-config.js`, which sets `window.__RUNTIME_CONFIG__` and is read via [frontend/src/utils/runtimeConfig.ts](frontend/src/utils/runtimeConfig.ts). This is why the same Docker image can be deployed with different WiFi settings without rebuilding.

### Internationalization (i18n)

Custom dict-based implementation in [frontend/src/i18n/](frontend/src/i18n/) — no `next-intl` or `react-i18next` dependency. Two dictionaries ([en.ts](frontend/src/i18n/en.ts), [de.ts](frontend/src/i18n/de.ts)); the `Dictionary = Record<TranslationKey, string>` type forces structural parity between them. `useTranslation()` from [i18n/index.tsx](frontend/src/i18n/index.tsx) returns `{ t, locale, setLocale, toggleLocale }`.

**German is the default language.** Both SSR and the first client render use `"de"` so hydration is deterministic (no EN→DE flash). Only an explicit user override via the switcher — persisted in `localStorage` under `uvm.locale` — flips the locale. Browser `Accept-Language` is deliberately not consulted.

**Flag icons are inline SVGs** with a `<mask>` + `<circle>` clip (see [LanguageSwitcher](frontend/src/components/utils/LanguageSwitcher.tsx)), not emoji. Reason: flag emojis render as plain letter pairs on Windows and with varying proportions elsewhere; SVG gives pixel-exact, platform-identical circles. A previous `country-flag-emoji-polyfill` dependency was removed in favour of this.

**Interpolation**: `t("key", { name: value })` replaces `{name}` placeholders at call time. Plural forms use separate keys with `*Single` / `*Many` suffixes (see `vouchersDeletedSelectedSingle` vs `vouchersDeletedSelectedMany`).

### Real-time updates (SSE)

Voucher mutations on the frontend call `notifyVouchersUpdated()` ([frontend/src/utils/actions.ts](frontend/src/utils/actions.ts)), which broadcasts via the in-process SSE manager ([frontend/src/utils/sseManager.ts](frontend/src/utils/sseManager.ts)) to all clients connected to `/api/events`. The singleton lives on `globalThis` to survive Next.js HMR. **Backend-initiated changes (e.g., the daily purge) do not emit SSE events** — only frontend-mediated mutations do.

## Commands

### Local dev (no Docker)

```bash
# Backend — reads env from shell
cd backend && cargo run --release

# Backend — reads env from a .env file at repo root
cd backend && cargo run --release --features dotenv

# Frontend (dev, Turbopack)
cd frontend && npm install && npm run dev

# Frontend (prod build)
cd frontend && npm ci && npm run build && npm run start
```

The frontend expects the backend at `FRONTEND_TO_BACKEND_URL:BACKEND_BIND_PORT` (defaults `http://127.0.0.1:8080`). Both must be running for the app to work.

### Lint / build checks

```bash
cd frontend && npm run lint    # next lint
cd frontend && npm run build   # type-check + build
cd backend  && cargo check
cd backend  && cargo clippy
```

There is **no test suite** in this repo (no `cargo test` targets, no frontend test runner configured). Don't claim tests pass — there are none to run.

### Docker

[compose.yaml](compose.yaml) is set up for a **locally built image** — it declares both `image: unifi-voucher-manager:local` and `build:`. Compose tags the build output with that name and reuses it on subsequent `up`s; no upstream registry is ever contacted. To pull the upstream image instead, swap to `etiennecollin/unifi-voucher-manager` in compose.yaml.

```bash
cp .env.example .env                              # one-off; edit before starting
docker compose up -d --build                      # first run / after code changes
docker compose up -d --build --force-recreate     # rebuild + recreate container
```

The Dockerfile is multi-stage (rust-deps → rust-builder → node-deps → node-builder → runtime). The runtime stage runs both processes via [scripts/run_wrapper.sh](scripts/run_wrapper.sh); the frontend uses Next.js standalone output (`output: "standalone"` in [frontend/next.config.ts](frontend/next.config.ts)).

## Conventions

- **Code style**: Prettier for frontend (no config file → defaults). All frontend code is TypeScript with strict mode and the `@/*` → `src/*` path alias.
- **Tailwind v4** (PostCSS plugin, no `tailwind.config.*` file) — utilities only, no custom config.
- **Versions** in `Cargo.toml` and `package.json` are pinned to `0.0.0-git`; release versions are stamped by CI ([.github/workflows/release_docker.yaml](.github/workflows/release_docker.yaml)), not committed.
- The Rust backend uses `tracing` with `BACKEND_LOG_LEVEL` env var (default `info`) — not `RUST_LOG`.

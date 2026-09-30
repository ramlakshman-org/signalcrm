# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Non-standard Next.js

This project runs **Next.js 16.3.5** — a pre-release version with breaking changes from what most training data covers. Before touching routing, middleware, or server components, read the relevant guide under `node_modules/next/dist/docs/`. Heed every deprecation warning the dev server emits (e.g. `middleware` file → `proxy`, Edge Runtime → `nodejs`).

## Commands

```bash
npm run dev          # dev server on :3000
npm run build        # production build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm run test         # vitest run (all tests, no watch)
npm run test:watch   # vitest (watch mode)
npm run format       # prettier --write .
```

Run a single test file:
```bash
npx vitest run src/lib/ai/generate.test.ts
```

Tests need no real credentials — `vitest.config.ts` injects dummy `ENCRYPTION_KEY` and `META_APP_SECRET`.

## Architecture

### Multi-tenant data model

Every table has an `account_id` column (not `user_id`). A Supabase account owns one WhatsApp number; multiple team members share it. The `profiles` table links `auth.users` to an `accounts` row via `account_id` + `account_role`. All RLS policies scope to `account_id`.

**Roles** (defined in `src/lib/auth/roles.ts`): `viewer → agent → admin → owner`. Use `requireRole("admin")` at the top of any API route handler to get a fully-loaded `AccountContext` (`userId`, `accountId`, `role`, scoped Supabase client).

### Supabase clients — three variants, never mix them

| File | Use when |
|------|----------|
| `src/lib/supabase/client.ts` | Client components (singleton browser client) |
| `src/lib/supabase/server.ts` | Server components and API routes (SSR, reads cookies) |
| `createClient(URL, SERVICE_ROLE_KEY)` inline | Webhook handler and admin paths that bypass RLS |

The middleware (`src/middleware.ts`) also creates an SSR client for session refresh. **Always return `supabaseResponse`** (not a fresh `NextResponse`) from middleware branches, or rotated refresh tokens won't reach the browser.

### Inbound WhatsApp message pipeline

`POST /api/whatsapp/webhook` → HMAC-verified → `after()` deferred → `processWebhook` → `processMessage`:

1. Resolve contact by BSUID (`wa_user_id`) first, phone second — Meta's username rollout means phone can be absent.
2. Find or create conversation (oldest-first, not `.single()`, to survive race conditions).
3. Upsert message with `onConflict: 'conversation_id,message_id'` for idempotent replay.
4. RPC `bump_conversation_on_inbound` for atomic unread increment.
5. Dispatch in priority order: **Flows engine** → **Automations** → **AI auto-reply** → **Public webhooks**.

A Flow consuming a message suppresses `new_message_received` + `keyword_match` automation triggers (but not `new_contact_created` / `first_inbound_message`).

### Theming system

Two orthogonal dimensions set on `<html>`:
- `data-mode` — `light` | `dark` (neutral surfaces; CSS in `globals.css` under `html[data-mode="..."]`)
- `data-theme` — `violet` | `emerald` | `cobalt` | `amber` | `rose` (accent only; CSS in `globals.css` under `html[data-theme="..."]`)

Adding a theme requires **two steps only**: (1) add the `html[data-theme="<id>"]` block in `globals.css`, (2) add an entry in `src/lib/themes.ts`. The boot script in `src/app/layout.tsx` reads `localStorage` to rehydrate both before first paint — `suppressHydrationWarning` on `<html>` is intentional.

### Flows vs Automations

Two separate execution engines, often confused:

- **Automations** (`src/lib/automations/`) — linear step chains. Triggers: inbound message, keyword match, new contact, schedule. Steps: send message, add tag, wait, webhook.
- **Flows** (`src/lib/flows/`) — interactive branching menus built on `@xyflow/react`. Contact navigates by tapping buttons/list rows. Runs are per-contact state machines stored in `flow_runs`.

### API route conventions

Every authenticated API route follows the same pattern:
```ts
const ctx = await requireRole("agent");   // throws → toErrorResponse
// ctx.supabase is RLS-scoped; ctx.accountId is the tenancy key
```
`toErrorResponse(err)` in `src/lib/auth/account.ts` maps `UnauthorizedError` → 401, `ForbiddenError` → 403, anything else → 500.

Public REST API lives under `/api/v1/` and uses API-key auth (`src/lib/api-keys/`) instead of session cookies — see `src/lib/auth/api-context.ts`.

### i18n

`next-intl` with locale set at build time via `NEXT_PUBLIC_APP_LOCALE` (en / ko / pt / es). Message catalogues live in `messages/*.json`. ICU format enforced — see `src/i18n/icu-safety.test.ts`.

## Key environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-side Supabase key |
| `SUPABASE_SERVICE_ROLE_KEY` | Bypasses RLS — server/webhook only |
| `ENCRYPTION_KEY` | 64 hex chars (AES-256-GCM) — encrypts WhatsApp tokens |
| `META_APP_SECRET` | HMAC-verifies inbound webhook signatures |

## Database migrations

All migrations in `supabase/migrations/` are idempotent (001–042). Apply them ordered via Supabase SQL editor or `supabase db push`. The `handle_new_user()` trigger auto-creates a profile row on signup.

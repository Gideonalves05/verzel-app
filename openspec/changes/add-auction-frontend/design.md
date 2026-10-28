## Context

The frontend is the surface the evaluator will actually click through. The backend contract is already specified in `verzel-backend` (REST + Socket.IO), so this design focuses on how the Next.js 16 App Router app renders those capabilities with as little moving-parts churn as possible in 7 days. The starter has only a default `app/page.tsx`.

Key UX constraints from the brief:
- "Tudo atualizado sem recarregar a página" in the live room — WebSocket, not polling.
- "Mensagem clara para cada lance recusado" — the exact rejection reason must reach the user.
- "Pública e sem login" audit page — must render without any auth state.
- "Compartilhar por link" winning receipt — public URL addressable by token.
- Dark mode is scored.

## Goals / Non-Goals

**Goals:**
- A Next.js 16 App Router application that implements every screen the brief lists.
- Zero polling in the live room; the countdown and bid list update from WebSocket events.
- A single typed API/WS client so adding a capability means adding a route, not rewiring plumbing.
- Localized feedback (Portuguese) matching the brief, with error codes coming from the backend as the single source of truth.
- Clean deploy to Vercel, no server component / server action tricks that would complicate hosting.
- Light/dark theme that respects system preference and persists per user.

**Non-Goals:**
- Native mobile UI, PWA offline mode, i18n beyond pt-BR (brief is in Portuguese; English copy only in dev tooling).
- A design system or component library beyond what Tailwind + a few primitives give us.
- SSR of authenticated pages — the live room and dashboard are CSR after auth to keep the WS wiring simple.
- Server-side search of the Met API — the backend already proxies and caches.
- SSG of lot pages — lots are dynamic; we use CSR + React Query revalidation.

## Decisions

### D1. Framework and routing: Next.js 16 App Router, mostly CSR

- The repo is already Next.js 16 + React 19. Keep the App Router.
- Public, cacheable pages (vitrine `/`, audit `/audit/lots/:id`, receipt `/receipt/:token`) are **server components** with no auth, using `fetch` with Next's revalidation (short cache, e.g. `revalidate: 10`). This gives fast first paint and good SEO.
- Authenticated / interactive pages (`/login`, `/register`, `/dashboard`, `/lots/:id` live room, `/wallet`, `/my-wins`) are **client components**. They mount a React Query provider and the WebSocket connection.
- `app/page.tsx` is the vitrine landing page (`/`).

### D2. Data layer: React Query + a typed fetch client

- Thin wrapper around `fetch`: attaches `Authorization: Bearer <jwt>` when a token is present, maps non-2xx responses into a typed `ApiError { code, message, status, details? }`. Backend error codes are the contract; the client never invents them.
- React Query holds server state (lots, wallet, wins, own-lots, revenue). Mutations (bid, deposit, cancel, create lot) invalidate the relevant query keys.
- Avoid axios to keep the bundle small; `fetch` + a `httpError` helper is enough.
- Alternative considered: SWR. React Query is picked because its mutation + optimistic update story is cleaner for the bid flow.

### D3. WebSocket client: `socket.io-client` with an auth payload

- One singleton connection per browser tab under `NEXT_PUBLIC_WS_URL`, lazily created when a live-room page mounts.
- Pass JWT via `io(url, { auth: { token } })`. Anonymous connections are allowed by the backend; the client enters read-only mode automatically.
- A small `useLiveLot(lotId)` hook `join`s the room on mount, subscribes to `bid.placed`, `lot.extended`, `lot.ended`, `you.winning`, `you.outbid`, and merges events into local React state. Unmount leaves the room.
- Reconnect uses the default Socket.IO backoff; on reconnect the hook re-emits `join` and re-fetches the lot/bids via REST to catch up with any missed events (idempotent — React Query dedupes).

### D4. Auth storage: JWT in `localStorage`, in-memory primary

- Keep the token in a React context fed from `localStorage` on first mount. New-tab reload rehydrates from `localStorage`.
- Not `httpOnly` cookies: our backend is a separate origin and keeping it in Authorization headers avoids CSRF and CORS cookie complexity for the deadline.
- A route-guard HOC (`<RequireRole roles={['bidder']}>`) wraps dashboard, wallet, my-wins, and the bid form on the live room. Public pages don't use it.
- Logout clears the context and `localStorage` and disconnects the socket.

### D5. Forms + validation: `react-hook-form` + `zod` resolvers

- One `zod` schema per form; the same shape is validated client-side and sent to the backend. If the backend rejects with a known field error, we surface it on the matching input.
- Currency inputs use integer cents under the hood (consistent with the backend) with a cosmetic BRL formatter on top.

### D6. Styling and theming: Tailwind v4 + `next-themes`

- Tailwind v4 is already in the repo. Use utility classes plus `tailwind-variants` for a small set of primitives (`Button`, `Input`, `Card`, `Badge`, `Tabs`, `Dialog`).
- `next-themes` for light/dark toggle with `class` strategy; respects `prefers-color-scheme` on first visit.
- Minimum component set: `Button`, `Input`, `Numeric`, `Card`, `Badge`, `Tabs`, `Dialog`, `Tooltip`, `Toast` (via `sonner`), `Countdown`, `LotCard`, `BidList`, `IntegrityBadge`.

### D7. Internationalization: Portuguese only, backend error-code mapping

- All visible copy is pt-BR. A single file `lib/i18n/errors.ts` maps every backend error code to the exact brief wording:
  - `below_starting_bid` → "O primeiro lance deve ser maior ou igual ao lance inicial."
  - `below_min_increment` → "O lance deve ser maior ou igual ao atual mais o incremento mínimo."
  - `already_leading` → "Você já está ganhando este lote."
  - `insufficient_available_balance` → "Saldo disponível insuficiente para este lance."
  - `lot_not_started` → "O lote ainda não começou."
  - `lot_ended` → "O lote já foi encerrado."
  - `lot_cancelled` → "O lote foi cancelado."
  - `lot_has_bids_cannot_cancel` → "Este lote já recebeu lances e não pode ser cancelado."
  - `role_forbidden` → "Esta ação não é permitida para o seu perfil."
  - `invalid_credentials` → "E-mail ou senha inválidos."
  - `email_taken` → "Esse e-mail já está cadastrado."
  - `unauthorized` → "Faça login para continuar."
  - `external_source_unavailable` → "Fonte externa indisponível. Tente novamente em instantes."
- Unknown codes fall back to the backend's `message` field.

### D8. Live countdown without drift

- When the server sends a lot's `ends_at`, store it as an absolute timestamp. A `useCountdown(endsAt)` hook computes the remaining time from `Date.now()` every 250 ms. On every `bid.placed` / `lot.extended` the hook receives a new `endsAt` and restarts.
- The hook is pure (no polling); the only network traffic in the live room is the WebSocket.

### D9. Position badge logic

- The live-room page maintains `{ meHandle, currentLeaderHandle, myLastBidSeq }`. It renders:
  - "Você está ganhando" if `meHandle === currentLeaderHandle`.
  - "Você foi superado" if the user has a bid on the lot but is not the leader.
  - "Dê o seu lance" if the user has no bid yet.
  - (Guest viewers see no personal badge.)
- The `you.winning` / `you.outbid` events only *inform* the toast; the badge derives from state so a late-arriving event never desyncs the UI.

### D10. Audit page UX

- Server-rendered, no auth. Shows: lot title, image, status, winner handle (if ended), ordered bid list with `seq / handle / amount / placed_at / curr_hash (short)`, and a prominent **IntegrityBadge** component:
  - Green "Histórico íntegro — verificado em HH:mm" if `integrity.ok`.
  - Red "⚠ Histórico adulterado na seq N (motivo: …)" if not.
- A "copy audit URL" button lives beside the badge; this is the public verification link anyone can share.

### D11. Receipt page UX

- Server-rendered, no auth. Shows image, title, winner handle, amount, settled date, auctioneer handle, and the integrity hash at the time of settlement so viewers can cross-check against the audit page.
- Shareable via `/receipt/:token`. "Copy link" button.

### D12. Error and loading UX

- A global toast system (`sonner`) renders errors from the API client and `you.winning` / `you.outbid` events.
- Every page uses React Suspense boundaries + `loading.tsx` skeletons for first paint.
- Global `error.tsx` catches render errors and shows a reload button.

### D13. Project structure

```
app/
  layout.tsx                 — shell: theme provider, toaster, header
  page.tsx                   — showcase (public, SSR)
  login/page.tsx
  register/page.tsx
  dashboard/
    page.tsx                 — auctioneer dashboard
    new-lot/page.tsx         — item search + create lot form
  lots/[id]/page.tsx         — live lot room (CSR)
  wallet/page.tsx
  my-wins/page.tsx
  audit/lots/[id]/page.tsx   — public audit (SSR)
  receipt/[token]/page.tsx   — public receipt (SSR)
  not-found.tsx
  error.tsx
components/                   — primitives + domain components
lib/
  api/                       — typed REST client + hooks
  ws/                        — socket.io-client wrapper + useLiveLot
  auth/                      — session context, guards
  i18n/errors.ts             — backend-code → pt-BR map
styles/                      — global.css (Tailwind)
```

### D14. Env & deploy

- `NEXT_PUBLIC_API_BASE_URL` (e.g. `https://auction-api.fly.dev/api`).
- `NEXT_PUBLIC_WS_URL` (e.g. `wss://auction-api.fly.dev/live-lots`).
- Deploy target: Vercel. `vercel.json` or `next.config.ts` wires the env vars.

## Risks / Trade-offs

- **[Token in `localStorage` is XSS-sensitive]** → mitigated by not rendering untrusted HTML (we never `dangerouslySetInnerHTML` user content) and keeping the token off the DOM; acceptable for a 7-day test.
- **[WebSocket in a serverless Next.js deploy would be painful]** → we only need WebSocket on the backend; the frontend is just a client. Vercel's static-page + CSR model handles this fine.
- **[Clock skew between client and backend]** → we always use the backend's `ends_at` timestamp as the countdown anchor; local clock drift of a few seconds is cosmetic.
- **[Dark mode flash]** → `next-themes` with `attribute="class"` and a pre-hydration script prevents the common FOUC.
- **[Lots list staleness during a demo]** → the showcase SSR revalidates every 10 seconds and additionally subscribes to a lightweight polling (every 15 s) with React Query on the client to refresh counters without the live-room WebSocket overhead.

## Migration Plan

- First change for the frontend; nothing to migrate.
- Rollout: `vercel --prod` after `npm run build` succeeds.
- Rollback: redeploy a previous Vercel build.

## Open Questions

- Q1: Should the vitrine default tab be `live`, `scheduled`, or "all"? **Default:** `live`, because that is where action is; URL `?status=live` for shareability.
- Q2: Should "Meus arremates" also list bids where the user is currently leading but the lot hasn't ended yet? **Default:** yes, under a separate "Lances ativos" section inside the same page, so the brief's "Interface onde o usuário vê os itens em que deu lance" is covered.
- Q3: Receipt share — should we generate a PDF, or is the public page enough? **Default:** the public page is enough and matches the brief's "pode compartilhar por link". A print-to-PDF button is a stretch.

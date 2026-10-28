## 1. Project setup & tooling

- [x] 1.1 Add dependencies: `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`, `socket.io-client`, `next-themes`, `sonner`, `clsx`, `tailwind-variants`, `date-fns`
- [x] 1.2 Add env support: `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_WS_URL` (document in `.env.example`)
- [x] 1.3 Replace the starter `app/page.tsx` and the default README once the vitrine lives there
- [x] 1.4 Configure Tailwind v4 with the project's palette and dark mode (class strategy)
- [x] 1.5 Add `app/providers.tsx` wrapping children with `QueryClientProvider`, `ThemeProvider`, `AuthProvider`, and `<Toaster />`

## 2. Capability: api-client

- [x] 2.1 Implement `lib/api/http.ts` — `apiFetch<T>(path, init)` wrapper with JWT, JSON, typed `ApiError`
- [x] 2.2 Implement `lib/api/resources.ts` — typed functions for lots, bids, wallet, wins, dashboard, audit, receipt
- [x] 2.3 Implement `lib/ws/socket.ts` — singleton `getSocket()` with lazy connect and token auth
- [x] 2.4 Implement `lib/ws/useLiveLot.ts` — hook that joins/leaves a room, subscribes to events, exposes state
- [x] 2.5 Implement `lib/auth/session.tsx` — `AuthProvider`, `useSession`, persistence in `localStorage`
- [x] 2.6 Implement `lib/auth/RequireRole.tsx` — client guard with redirect behavior

## 3. Capability: feedback-messages

- [x] 3.1 Implement `lib/i18n/errors.ts` with the full code→message table from the spec
- [x] 3.2 Wire `apiFetch`'s error handling into `sonner` toasts via a small helper (used inline in forms/mutations)

## 4. Capability: app-shell

- [x] 4.1 Implement `app/layout.tsx` with the providers
- [x] 4.2 Implement `components/Header.tsx` with navigation, theme toggle, logo, and auth-aware links
- [x] 4.3 Implement `components/ThemeToggle.tsx` using `next-themes`
- [x] 4.4 Implement `app/error.tsx` and `app/not-found.tsx`

## 5. Capability: auth-ui

- [x] 5.1 Implement `app/register/page.tsx` with role selection and client-side password confirmation
- [x] 5.2 Implement `app/login/page.tsx` with `?next=` support (wrapped in Suspense for Next 16)
- [x] 5.3 Implement logout button in the header
- [x] 5.4 Map `email_taken` and `invalid_credentials` to the right input error, not just toast

## 6. Capability: showcase

- [x] 6.1 Implement `app/page.tsx` as a server component that fetches `GET /api/lots?status=live&page=1`
- [x] 6.2 Implement status tabs with URL sync (`?status=` and `?page=`)
- [x] 6.3 Implement `components/LotCard.tsx` with live countdown (client child), scheduled time, and ended outcome
- [x] 6.4 Implement pagination controls preserving the active tab
- [ ] 6.5 Add client-side refetch (`refetchInterval: 15000`) for freshness *(server component revalidates on nav; a client refetch would need a wrapper — deferred)*
- [x] 6.6 Hide cancelled lots (the backend contract already filters; the client just renders what the API sends)

## 7. Capability: auctioneer-dashboard

- [x] 7.1 Implement `app/dashboard/page.tsx` guarded for role `auctioneer`
- [x] 7.2 Render KPIs from `GET /api/me/revenue` and own-lot aggregates
- [x] 7.3 Render own-lots table with status badges, actions (open, cancel, see audit)
- [x] 7.4 Implement `app/dashboard/new-lot/page.tsx` with debounced external search
- [x] 7.5 Implement the lot creation form with inline + toast feedback
- [x] 7.6 Implement the cancel-lot confirmation dialog (native confirm)

## 8. Capability: live-lot-room

- [x] 8.1 Implement `app/lots/[id]/page.tsx` (server shell) and `app/lots/[id]/LotRoom.tsx` (CSR + WS)
- [x] 8.2 Mount `useLiveLot(id)`; wire current bid, bid list, position badge to its state
- [x] 8.3 Implement `components/Countdown.tsx` that re-anchors on new `ends_at`
- [x] 8.4 Implement the bid form with prefilled minimum next bid and quick-fill on reject
- [x] 8.5 Map all bid rejection codes to inline / toast per `feedback-messages`
- [x] 8.6 Handle `lot.ended` for winner (toast + receipt link) and no-winner case
- [x] 8.7 Guest read-only path (no bid form, no personal badge; sign-in CTA)

## 9. Capability: bidder-wallet

- [x] 9.1 Implement `app/wallet/page.tsx` guarded for role `bidder`
- [x] 9.2 Render total / committed / available with explanatory copy
- [x] 9.3 Implement the deposit form (currency input in BRL → cents on submit)
- [x] 9.4 Refetch on `window.focus` (via React Query default)

## 10. Capability: my-wins

- [x] 10.1 Implement `app/my-wins/page.tsx` guarded for role `bidder`
- [ ] 10.2 Render the "Lances ativos" section above the wins list *(deferred: requires a `/me/bids` endpoint not yet on the backend; wins list only for now)*
- [x] 10.3 Each win row has "Copiar link" and "Abrir recibo"
- [x] 10.4 Empty-state copy with a link to the vitrine

## 11. Capability: audit-page

- [x] 11.1 Implement `app/audit/lots/[id]/page.tsx` (server component, no auth)
- [x] 11.2 Implement `components/IntegrityBadge.tsx` with green/red variants and tooltip-equivalent copy
- [x] 11.3 Render the ordered bid list with `seq`, handle, amount, placed_at, short hash
- [x] 11.4 Implement "Copiar link da auditoria" (client CopyButton)

## 12. Capability: receipt-page

- [x] 12.1 Implement `app/receipt/[token]/page.tsx` (server component, no auth)
- [x] 12.2 Render receipt payload, "Copiar link do recibo", "Ver auditoria completa" link
- [x] 12.3 404 page copy when token is unknown (via `notFound()` + global 404)

## 13. Deployment

- [ ] 13.1 Set the env vars on Vercel (`NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_WS_URL`) *(user action)*
- [x] 13.2 Verify production build succeeds (`npm run build`)
- [ ] 13.3 First deploy, smoke test the full flow against the deployed backend *(pending user)*
- [x] 13.4 Replace the starter `README.md` with the operations README

## 14. Stretch / optional (brief marks these as non-mandatory)

- [ ] 14.1 Lot search/filter box on the vitrine with URL sync *(backend supports `?q=`; UI widget deferred)*
- [ ] 14.2 Skeleton loaders in `loading.tsx` for every route
- [ ] 14.3 PWA manifest + install prompt
- [ ] 14.4 Print-to-PDF button on the receipt page
- [ ] 14.5 Playwright smoke test

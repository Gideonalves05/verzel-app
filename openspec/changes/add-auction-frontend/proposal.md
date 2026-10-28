## Why

The Verzel Elite Dev technical test requires a working auction-house frontend within 7 days, deployed and able to walk the evaluator through the full flow: browse → create lot → bid live → win → audit — against the backend specified in `verzel-backend`. The frontend repo currently contains only the Next.js 16 starter page. This proposal introduces, in a single coherent change, every user-facing screen and interaction the brief requires.

## What Changes

- Bootstrap the Next.js 16 App Router shell: global layout, header with navigation, auth state, light/dark theme toggle, toast system, error boundary, 404 page.
- Add a typed REST + WebSocket client that talks to the backend specified in `verzel-backend` (base URL from `NEXT_PUBLIC_API_BASE_URL`), handles JWT storage/refresh-on-reload, and surfaces structured error codes from the backend verbatim.
- Add auth UI: register (with role selection auctioneer/bidder), login, logout.
- Add the public **vitrine (showcase)**: live, scheduled, and ended lots in tabs, with cards (image, title, current bid, countdown or outcome). Cancelled lots never appear.
- Add the **auctioneer dashboard** (`/dashboard`): search items on the backend's external-items proxy, create a lot from the chosen item, cancel a lot without bids, and view own lots + total revenue.
- Add the **live lot room** (`/lots/:id`): current bid, full history, countdown, personal position badge ("you are winning" / "you were outbid" / "you have no bid"), bid form with the exact rejection-reason feedback mapping from the brief, auto-extend on anti-sniping — all driven by the WebSocket gateway, no polling.
- Add the **bidder wallet** page: total, committed, available, deposit form (simulated).
- Add the **my wins** page: lots the bidder has won, with the shareable receipt link.
- Add the **public audit page** (`/audit/lots/:id`): bid history (anonymized handles), integrity badge ("Chain integrity: OK" or "⚠ Tampered at seq N"), no login required.
- Add the **public receipt page** (`/receipt/:token`): winner handle, lot, final amount, settlement date, shareable URL.
- Add a feedback module that maps every backend error code to a localized message (Portuguese) exactly matching the brief's wording.
- Add dark mode support (listed as an optional in the brief, kept because it is scored).

Stretch (marked optional in tasks): lot search/filter in the vitrine, URL-synced filters, skeleton loading, PWA manifest.

## Capabilities

### New Capabilities

- `app-shell`: global layout, navigation, theme toggle, auth-aware header, toast system, error boundaries, 404.
- `api-client`: typed REST client, JWT storage/attach, structured-error handling, WebSocket connector with reconnect.
- `auth-ui`: register (role selection), login, logout flows and route guards.
- `showcase`: public vitrine of lots filtered by status, cancelled hidden, card layout with live countdown.
- `auctioneer-dashboard`: external-item search, lot creation form, cancel-without-bids, own lots + revenue.
- `live-lot-room`: realtime lot room with current bid, history, countdown, personal position, and bid form.
- `bidder-wallet`: wallet page showing total/committed/available and a simulated deposit form.
- `my-wins`: list of won lots with receipt share link.
- `audit-page`: public audit page with ordered bid history and integrity badge.
- `receipt-page`: public receipt page addressable by share token.
- `feedback-messages`: central mapping from backend error codes to Portuguese messages matching the brief.

### Modified Capabilities

None — this is the first change in the repository and introduces the initial frontend specs.

## Impact

- **Code**: all `app/**` routes, `components/**`, `lib/api/**`, `lib/ws/**`, `lib/auth/**`, `lib/i18n/**`, `styles/**`.
- **Dependencies** (added at implementation): `zod`, `axios` (or native `fetch` with a thin wrapper), `socket.io-client`, `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `clsx`, `tailwind-variants` (or `cva`), `sonner` (toasts), `date-fns`, `next-themes`.
- **Env**: `NEXT_PUBLIC_API_BASE_URL` (REST), `NEXT_PUBLIC_WS_URL` (WebSocket base).
- **Deploy**: public URL required by the brief; the Next app runs well on Vercel.

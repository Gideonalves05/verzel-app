## ADDED Requirements

### Requirement: Typed REST client with JWT attachment

The system SHALL provide a thin `apiFetch<T>(path, init)` wrapper over `fetch` that prepends `NEXT_PUBLIC_API_BASE_URL`, attaches `Authorization: Bearer <jwt>` when a token is present in the auth context, parses JSON responses, and raises a typed `ApiError { code, message, status, details? }` for every non-2xx response.

#### Scenario: Logged-in request attaches bearer token

- **GIVEN** a token is present in the auth context
- **WHEN** `apiFetch` is called for any path
- **THEN** the outgoing request includes `Authorization: Bearer <jwt>`

#### Scenario: Non-2xx response raises a typed ApiError

- **WHEN** the backend responds with HTTP `409` and body `{ error: { code: "below_min_increment", message: "...", details: { required_cents: 500 } } }`
- **THEN** `apiFetch` throws `ApiError { code: "below_min_increment", status: 409, details: { required_cents: 500 } }`

#### Scenario: Network error

- **WHEN** the backend is unreachable
- **THEN** `apiFetch` throws `ApiError { code: "network_error", status: 0 }`

### Requirement: React Query provider and resource hooks

The system SHALL provide a `QueryClientProvider` wrapping client components, with resource hooks (`useLot`, `useLots`, `useBids`, `useWallet`, `useMyWins`, `useMyLots`, `useRevenue`, `useAudit`, `useReceipt`, `useSearchExternalItems`) that call `apiFetch` and expose standard React Query state (`data`, `isLoading`, `error`). Mutations (`useCreateLot`, `useCancelLot`, `usePlaceBid`, `useDeposit`, `useRegister`, `useLogin`) SHALL invalidate the relevant query keys on success.

#### Scenario: Successful bid invalidates lot queries

- **WHEN** `usePlaceBid` succeeds
- **THEN** the hook invalidates `['lot', lotId]`, `['bids', lotId]`, and `['wallet']` so the UI refetches current state

#### Scenario: Successful deposit invalidates wallet query

- **WHEN** `useDeposit` succeeds
- **THEN** the hook invalidates `['wallet']` so the wallet page refetches balances

### Requirement: WebSocket connector with reconnect and auth handshake

The system SHALL provide `getSocket()` returning a singleton `socket.io-client` instance connected to `NEXT_PUBLIC_WS_URL` with `auth: { token }` when a JWT is present. The connection SHALL be lazy (created on first use), SHALL retry with Socket.IO's default backoff, and SHALL expose a `useLiveLot(lotId)` hook that joins the lot room on mount and leaves on unmount.

#### Scenario: Hook joins and leaves

- **WHEN** a component calls `useLiveLot("L1")`
- **THEN** on mount the socket emits `join { lot_id: "L1" }`, and on unmount it emits `leave { lot_id: "L1" }`

#### Scenario: Reconnect re-joins the room

- **GIVEN** `useLiveLot("L1")` is mounted
- **WHEN** the socket disconnects and reconnects
- **THEN** the hook re-emits `join { lot_id: "L1" }` and triggers a REST refetch of the lot and bids to catch up on any missed events

#### Scenario: Anonymous connection

- **WHEN** `getSocket()` is called with no token in the auth context
- **THEN** the socket connects without an `auth.token` and the hook still receives broadcast events but no `you.winning` / `you.outbid` targeted events

### Requirement: Session context with persistent JWT

The system SHALL expose an `AuthProvider` and a `useSession()` hook that holds `{ token, user, status }` and persists the token in `localStorage` under a stable key. On mount the provider SHALL rehydrate from `localStorage`, and on logout it SHALL clear the key and disconnect the socket.

#### Scenario: Rehydrate on reload

- **GIVEN** a user is logged in and a JWT is stored in `localStorage`
- **WHEN** the user reloads the page
- **THEN** `useSession()` returns `{ status: "authenticated", token, user }` after the provider mounts

#### Scenario: Logout clears state

- **WHEN** the user triggers logout
- **THEN** the provider clears the token from `localStorage`, resets `useSession()` to `{ status: "unauthenticated" }`, and disconnects the active socket

### Requirement: Route guards by role

The system SHALL provide a `<RequireRole roles={...} />` client component that redirects unauthenticated users to `/login?next=<current>` and users whose role is not in `roles` to `/` with an error toast.

#### Scenario: Bidder-only page accessed by auctioneer

- **WHEN** a logged-in auctioneer navigates to `/wallet`
- **THEN** the user is redirected to `/` and a toast displays "Esta ação não é permitida para o seu perfil."

#### Scenario: Protected page accessed by guest

- **WHEN** a logged-out user navigates to `/dashboard`
- **THEN** the user is redirected to `/login?next=/dashboard`

## ADDED Requirements

### Requirement: Dashboard home for auctioneer

The system SHALL expose `/dashboard` (auctioneer only) that shows: a KPI row with "Lotes ativos", "Lotes encerrados", "Receita total" (sum of settled wins credited), and a table of the auctioneer's own lots with status, current/final bid, and quick actions (ver auditoria, cancelar, abrir).

#### Scenario: Dashboard loads for auctioneer

- **WHEN** an authenticated auctioneer navigates to `/dashboard`
- **THEN** the page calls `GET /api/me/lots` and `GET /api/me/revenue` and renders the KPIs and lot table

#### Scenario: Non-auctioneer blocked

- **WHEN** a bidder or logged-out visitor navigates to `/dashboard`
- **THEN** the route guard redirects to `/` (bidder) or `/login?next=/dashboard` (guest) as defined in `api-client`

### Requirement: External-item search page

The system SHALL expose `/dashboard/new-lot` (auctioneer only) with a search box that queries `GET /api/external-items/search?q=` with a 300 ms debounce. Each result SHALL show the thumbnail, title, culture, date, and a "Usar este item" button that opens the lot creation drawer/form prefilled with that external id and title.

#### Scenario: Debounced search

- **WHEN** the auctioneer types "monet" and pauses
- **THEN** after 300 ms the client issues one search request and renders the result list

#### Scenario: External source unavailable

- **WHEN** the search returns `external_source_unavailable`
- **THEN** the results area shows the message "Fonte externa indisponível. Tente novamente em instantes." and the search box stays usable

### Requirement: Create lot form

The system SHALL render a lot creation form with fields: `title` (optional override, defaulting to the external item's title), `starts_at` (datetime-local), `ends_at` (datetime-local), `starting_bid_cents` (currency input in BRL), `min_increment_cents` (currency input in BRL). On submit the form SHALL call `POST /api/lots` and, on success, navigate to the new lot's live room with a success toast.

#### Scenario: Successful creation

- **WHEN** the auctioneer submits valid data
- **THEN** the client posts to the backend and, on 201, routes to `/lots/<new id>` with a toast "Lote criado."

#### Scenario: End date before start date

- **WHEN** the auctioneer picks an `ends_at` not after `starts_at`
- **THEN** the form shows an inline error on `ends_at` and does not submit

#### Scenario: Backend validation error maps to field

- **WHEN** the backend returns a validation error naming a field (e.g. `starts_at must be now or in the future`)
- **THEN** the error is shown on that input

### Requirement: Cancel a lot without bids

The system SHALL show a "Cancelar lote" button on each own lot that has zero bids. Clicking it SHALL open a confirmation dialog ("Esta ação não pode ser desfeita.") and on confirmation call `POST /api/lots/:id/cancel`. Lots with bids SHALL NOT display the cancel button.

#### Scenario: Cancel confirmation

- **WHEN** the auctioneer clicks "Cancelar lote" on a lot with zero bids
- **THEN** a dialog asks for confirmation and only on confirmation issues the request

#### Scenario: Cancel refused by backend

- **WHEN** the backend returns `lot_has_bids_cannot_cancel`
- **THEN** the dashboard refreshes and shows a toast "Este lote já recebeu lances e não pode ser cancelado."

### Requirement: Own lot details with results

The system SHALL show, for each ended own lot in the table, the final amount, the winner's anonymized handle, and a link to that lot's receipt. The sum of all credited amounts SHALL appear as "Receita total" in the KPI row.

#### Scenario: Ended own lot shows final amount

- **WHEN** the dashboard loads and the auctioneer has at least one ended lot with a winner
- **THEN** the row shows the final amount in BRL, the winner handle, and a "Ver recibo" link to `/receipt/<token>`

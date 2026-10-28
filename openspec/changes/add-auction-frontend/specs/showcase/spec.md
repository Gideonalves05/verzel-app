## ADDED Requirements

### Requirement: Public vitrine lists lots by status, cancelled hidden

The system SHALL render `/` as the public vitrine, listing lots with three tabs: "Ao vivo" (default), "Agendados", "Encerrados". The tab selection SHALL be reflected in the URL as `?status=live|scheduled|ended` so a specific view is shareable. Cancelled lots SHALL NEVER appear in any tab.

#### Scenario: Default landing shows live lots

- **WHEN** a visitor loads `/`
- **THEN** the page shows the "Ao vivo" tab active and lists lots with effective status `live` paginated

#### Scenario: Changing tab updates URL

- **WHEN** the visitor clicks "Encerrados"
- **THEN** the URL changes to `/?status=ended` and the list refetches with that filter

#### Scenario: Cancelled lots are hidden

- **WHEN** the backend has lots whose effective status is `cancelled`
- **THEN** those lots do not appear in any tab of the vitrine

### Requirement: Lot card renders essentials at a glance

The system SHALL render each lot in a `LotCard` with the item image, title, current bid (or starting bid if no bids yet, with the label "Lance inicial"), status-specific badge, and either a countdown ("Encerra em …") for live lots, a scheduled time ("Inicia em …") for scheduled lots, or the outcome ("Arrematado por R$ X" / "Encerrado sem lances") for ended lots. The whole card SHALL link to `/lots/:id`.

#### Scenario: Live lot card

- **WHEN** the vitrine shows a live lot
- **THEN** the card displays the current bid amount in BRL and a live countdown, both updating client-side

#### Scenario: Scheduled lot card

- **WHEN** the vitrine shows a scheduled lot
- **THEN** the card displays "Inicia em dd/MM/yyyy HH:mm" and the starting bid labeled as "Lance inicial: R$ X"

#### Scenario: Ended lot card with winner

- **WHEN** the vitrine shows an ended lot that had a winner
- **THEN** the card displays the outcome "Arrematado por R$ X" and the winner's anonymized handle

#### Scenario: Ended lot card without winner

- **WHEN** the vitrine shows an ended lot with no bids
- **THEN** the card displays "Encerrado sem lances"

### Requirement: Pagination with page size 20

The system SHALL paginate the vitrine with page size 20 and expose standard "Anterior" / "Próxima" controls plus a page indicator. Pagination SHALL preserve the active status tab.

#### Scenario: Next page

- **GIVEN** the "Ao vivo" tab has more than 20 lots
- **WHEN** the user clicks "Próxima"
- **THEN** the URL updates to `/?status=live&page=2` and the next 20 lots are fetched

### Requirement: Freshness without a WebSocket

The system SHALL keep the vitrine reasonably fresh by combining SSR with `revalidate: 10` and a lightweight client-side refetch (React Query `refetchInterval: 15000`). The vitrine SHALL NOT open a WebSocket.

#### Scenario: Open vitrine, wait, see refresh

- **GIVEN** the vitrine is open on a tab
- **WHEN** 15 seconds pass
- **THEN** the client re-fetches the current tab and updates the current bids and countdowns without the user doing anything

### Requirement: Stretch — free-text filter

The system MAY expose a search box above the tabs that filters by lot title via `GET /api/lots?q=<term>&status=…`. The box's value SHALL be synced to the URL as `?q=`.

#### Scenario: Search by title

- **WHEN** the user types "vaso" and submits
- **THEN** the URL becomes `/?status=live&q=vaso` and the vitrine shows only lots whose title matches

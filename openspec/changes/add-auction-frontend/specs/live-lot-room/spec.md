## ADDED Requirements

### Requirement: Live lot room page

The system SHALL expose `/lots/:id` as the live lot room, rendering: the lot header (image, title, source attribution with external id and provider link, auctioneer handle), a prominent current-bid amount in BRL with an "Encerra em" countdown, a bid list with anonymized handles paginated newest-first, a personal position badge for authenticated bidders, and a bid form for authenticated bidders.

#### Scenario: Initial render

- **WHEN** any visitor loads `/lots/:id`
- **THEN** the page fetches the lot and its bids via REST, mounts the `useLiveLot` hook, and renders the header, countdown, current bid, and bid list

#### Scenario: Non-live lot

- **WHEN** the lot's effective status is `scheduled`, `ended`, or `cancelled`
- **THEN** the countdown is replaced by the appropriate message (e.g. "Inicia em …", "Encerrado em …", "Lote cancelado") and the bid form is hidden

### Requirement: Realtime updates with no polling

The system SHALL update the current bid, bid list, countdown's `ends_at`, and personal position in response to WebSocket events (`bid.placed`, `lot.extended`, `lot.ended`, `you.winning`, `you.outbid`). The live room SHALL NOT poll the REST API while connected.

#### Scenario: New bid arrives

- **GIVEN** the page is open on lot L
- **WHEN** the client receives `bid.placed { seq, amount_cents, handle, placed_at, new_ends_at }` for L
- **THEN** the current bid, the bid list, and the countdown's `ends_at` update immediately without a page reload

#### Scenario: Anti-sniping extension

- **WHEN** the client receives `lot.extended { new_ends_at }`
- **THEN** the countdown resets to the new end time and a toast "Lote estendido em 2 minutos" is shown

#### Scenario: Lot ends with a winner

- **WHEN** the client receives `lot.ended { winner_handle, final_amount_cents, settled_at, receipt_token? }`
- **THEN** the bid form is hidden, the header shows "Arrematado por R$ X por <handle>", and if the authenticated user is the winner (receipt_token present) a toast "Você arrematou! Ver recibo" links to `/receipt/<token>`

#### Scenario: Lot ends with no winner

- **WHEN** the client receives `lot.ended { winner_handle: null, final_amount_cents: null }`
- **THEN** the header shows "Encerrado sem lances"

### Requirement: Countdown without drift

The system SHALL compute the remaining time from the absolute `ends_at` provided by the server. Every `bid.placed` or `lot.extended` event with a new `new_ends_at` SHALL restart the countdown anchor.

#### Scenario: Countdown reaches zero

- **WHEN** `ends_at - now` reaches `0`
- **THEN** the countdown displays `00:00` and the page shows "Processando encerramento…" until the `lot.ended` event arrives

### Requirement: Personal position badge for authenticated bidders

The system SHALL show, next to the current bid, a badge driven by local state derived from `{ meHandle, currentLeaderHandle, hasMyBid }`:
- "Você está ganhando" when `meHandle === currentLeaderHandle`,
- "Você foi superado" when `hasMyBid && meHandle !== currentLeaderHandle`,
- "Dê o seu lance" when authenticated bidder with no bid on this lot.
Guests see no personal badge.

#### Scenario: Bidder becomes the leader

- **WHEN** the bidder's bid is accepted
- **THEN** the badge switches to "Você está ganhando" and a `you.winning` toast appears

#### Scenario: Bidder is outbid

- **WHEN** another bid overtakes the user's leading bid
- **THEN** the badge switches to "Você foi superado" and a `you.outbid` toast appears

### Requirement: Bid form with rejection feedback

The system SHALL render a bid form (visible only to authenticated bidders when the lot is live) with a currency input prefilled with the minimum valid next bid (`starting_bid` or `current + increment`), a "Dar lance" button, and inline/toast feedback on backend rejection. Each known rejection code SHALL map to the pt-BR message defined in `feedback-messages`.

#### Scenario: Successful bid

- **WHEN** the backend returns `201` on the bid
- **THEN** the form clears, a toast "Lance aceito" is shown, and the current bid / position badge update via the WebSocket event

#### Scenario: Below minimum increment

- **WHEN** the backend returns `below_min_increment` with `details.required_cents`
- **THEN** the input shows the error "O lance deve ser maior ou igual ao atual mais o incremento mínimo." and the required amount is suggested as a quick-fill button

#### Scenario: Insufficient balance

- **WHEN** the backend returns `insufficient_available_balance`
- **THEN** the form shows "Saldo disponível insuficiente para este lance." and a link to `/wallet`

#### Scenario: Already leading

- **WHEN** the backend returns `already_leading`
- **THEN** the form shows "Você já está ganhando este lote." and disables the submit button until the user is outbid

#### Scenario: Lot not started / lot ended / lot cancelled

- **WHEN** the backend returns `lot_not_started`, `lot_ended`, or `lot_cancelled`
- **THEN** the form hides itself and the lot header updates to reflect the current state

### Requirement: Public read-only view

The system SHALL render the live lot room for guests without the bid form and without personal badges. Guests SHALL still see the current bid, countdown, bid list, and realtime updates (as read-only subscribers to the WebSocket room).

#### Scenario: Guest visits a live lot

- **WHEN** a guest loads `/lots/:id` on a live lot
- **THEN** the page shows the current bid, countdown, bid list, and updates realtime, with a "Entrar para dar lance" link in place of the bid form

## ADDED Requirements

### Requirement: Wallet page shows total, committed, available

The system SHALL expose `/wallet` (bidder only) that calls `GET /api/me/wallet` and renders three prominent amounts in BRL: "Saldo total", "Saldo comprometido", "Saldo disponível", with a short help text under each explaining what it means.

#### Scenario: Wallet renders amounts

- **WHEN** an authenticated bidder loads `/wallet`
- **THEN** the page shows the three amounts formatted as currency and refetches on route re-entry

#### Scenario: Non-bidder blocked

- **WHEN** an auctioneer navigates to `/wallet`
- **THEN** the route guard redirects to `/` with the toast "Esta ação não é permitida para o seu perfil."

### Requirement: Simulated deposit form

The system SHALL render a deposit form on `/wallet` with a currency input "Valor do depósito (R$)" and a "Depositar" button. On success the amount SHALL be added to the total balance and the three amounts SHALL refresh immediately.

#### Scenario: Successful deposit

- **WHEN** the bidder submits `R$ 500,00`
- **THEN** the client calls `POST /api/me/wallet/deposits` with `amount_cents: 50000`, shows the toast "Depósito realizado", clears the input, and the "Saldo total" / "Saldo disponível" increase by R$ 500,00

#### Scenario: Zero or negative amount

- **WHEN** the bidder submits `0` or a negative amount
- **THEN** the form shows an inline validation error and does not submit

### Requirement: Live reflection of commits from other tabs

The system SHALL re-fetch the wallet on window focus so that commits that happened in another tab (e.g. a bid placed in a live room tab) are reflected within one focus cycle without a manual reload.

#### Scenario: Return to the wallet tab after bidding elsewhere

- **GIVEN** the wallet page is open in one tab and a bid was placed in another tab
- **WHEN** the wallet tab regains focus
- **THEN** the wallet query refetches and the committed/available amounts update

## ADDED Requirements

### Requirement: Public receipt page addressable by token

The system SHALL expose `/receipt/:token` as a public server-rendered route (no auth) that calls `GET /api/audit/receipts/:token` and renders the receipt: lot image, title, winning handle, winning amount in BRL, settlement date and time, auctioneer handle, and the integrity head hash at settlement time (first 16 hex chars) with a link to the full audit page.

#### Scenario: Valid token

- **WHEN** a guest opens `/receipt/<valid token>`
- **THEN** the page renders the receipt payload

#### Scenario: Invalid or unknown token

- **WHEN** the token does not exist
- **THEN** the backend returns 404 and the page shows "Recibo não encontrado." with a link back to the vitrine

#### Scenario: Receipt uses anonymized handles

- **WHEN** the page renders the receipt
- **THEN** it shows only the per-lot anonymized handles of winner and auctioneer, not any personal data

### Requirement: Shareable receipt URL and audit link

The system SHALL render a "Copiar link do recibo" button that copies the current URL to the clipboard with a toast, and a "Ver auditoria completa" link that navigates to `/audit/lots/<lot id>`.

#### Scenario: Copy receipt link

- **WHEN** the user clicks "Copiar link do recibo"
- **THEN** the URL is copied and a toast "Link copiado" is shown

#### Scenario: Open full audit

- **WHEN** the user clicks "Ver auditoria completa"
- **THEN** the user is navigated to the lot's audit page

## ADDED Requirements

### Requirement: Public audit page with no login

The system SHALL expose `/audit/lots/:id` as a public route rendered on the server (no auth), that calls `GET /api/audit/lots/:id` and renders: the lot header (image, title, current status, settled info if ended), the ordered bid list showing `seq`, anonymized handle, amount in BRL, placed_at, and a short form of `curr_hash` (first 10 hex chars), and a prominent **IntegrityBadge**.

#### Scenario: Guest opens audit page

- **WHEN** a guest loads `/audit/lots/<id>`
- **THEN** the page renders without requiring login

#### Scenario: Integrity OK

- **WHEN** `integrity.ok` is `true` for the lot
- **THEN** the badge is green with text "Histórico íntegro — verificado em HH:mm" and a tooltip "A auditoria recomputou toda a cadeia de hashes e todos os selos."

#### Scenario: Integrity broken

- **WHEN** `integrity.ok` is `false`
- **THEN** the badge is red with text "Histórico adulterado na seq N" where N is `first_failure.seq`, and a human-readable description of `first_failure.reason` is shown below (e.g. "Um lance foi editado após ser registrado.")

### Requirement: Shareable audit URL

The system SHALL render a "Copiar link da auditoria" button that copies the current audit URL to the clipboard with a toast "Link copiado".

#### Scenario: Copy audit URL

- **WHEN** the user clicks the button
- **THEN** the current full URL is copied to the clipboard and a toast confirms

### Requirement: Audit shows no personal data

The system SHALL display only anonymized per-lot handles for bidders and auctioneer on the audit page. Personal data (email, name) SHALL NEVER appear on the audit page.

#### Scenario: Audit payload lacks personal data

- **WHEN** the audit page renders a bid row
- **THEN** the row shows only `handle`, not any name or email, consistent with the backend's response

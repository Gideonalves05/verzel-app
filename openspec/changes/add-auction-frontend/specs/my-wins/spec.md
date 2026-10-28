## ADDED Requirements

### Requirement: My wins page lists winning lots

The system SHALL expose `/my-wins` (bidder only) that calls `GET /api/me/wins` and renders a list of the bidder's winning settlements with: lot image and title, final amount in BRL, settlement date, a "Copiar link" button that copies the public `/receipt/<token>` URL, and a "Abrir recibo" link.

#### Scenario: Bidder opens page with wins

- **WHEN** an authenticated bidder with wins loads `/my-wins`
- **THEN** the page renders one card per win with the data above and the share actions

#### Scenario: Copy receipt link

- **WHEN** the bidder clicks "Copiar link" on a win
- **THEN** the public receipt URL is copied to the clipboard and a toast "Link copiado" is shown

#### Scenario: Empty state

- **WHEN** an authenticated bidder with zero wins loads the page
- **THEN** the page shows "Você ainda não arrematou nenhum lote." with a link to the vitrine

### Requirement: Active bids section

The system SHALL render, above the wins list, a "Lances ativos" section listing lots where the bidder has at least one bid and the lot is not yet ended, showing the lot, the bidder's position ("ganhando" / "superado"), and the current bid. Each row SHALL link to the live room.

#### Scenario: Bidder has active bids

- **WHEN** an authenticated bidder loads `/my-wins`
- **THEN** the "Lances ativos" section lists their non-ended lots with the current position derived from the backend data

#### Scenario: Bidder has no active bids

- **WHEN** the bidder has no active bids
- **THEN** the "Lances ativos" section is hidden

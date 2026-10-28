## ADDED Requirements

### Requirement: Global layout with auth-aware header

The system SHALL render a global `app/layout.tsx` that wraps every page with a theme provider, a toast outlet, and a header. The header SHALL display the Verzel logo, primary navigation (Vitrine, Auditoria, and role-specific links), the theme toggle, and either a "Entrar / Cadastrar" pair of links (when logged out) or the user's handle with a logout button (when logged in).

#### Scenario: Logged-out user visits any page

- **WHEN** a logged-out user navigates to any page
- **THEN** the header shows the logo, Vitrine link, Auditoria link, theme toggle, and "Entrar" / "Cadastrar" links

#### Scenario: Logged-in bidder sees bidder links

- **WHEN** a logged-in bidder loads any page
- **THEN** the header shows "Carteira", "Meus arremates", the bidder's handle, and a "Sair" button in place of login/register

#### Scenario: Logged-in auctioneer sees dashboard link

- **WHEN** a logged-in auctioneer loads any page
- **THEN** the header shows "Painel" (dashboard) and "Sair" in place of login/register

### Requirement: Light/dark theme toggle persists per user

The system SHALL support light and dark themes using a class strategy. The initial theme SHALL respect `prefers-color-scheme`. The user's manual choice SHALL be persisted in `localStorage` and SHALL be applied before first paint to avoid a theme-flash.

#### Scenario: First visit respects system theme

- **WHEN** a visitor with no stored preference lands on any page while their OS is set to dark mode
- **THEN** the app renders in dark mode immediately, with no flash of light mode

#### Scenario: Toggle persists

- **WHEN** a user clicks the theme toggle to switch themes
- **THEN** the chosen theme is applied immediately and persists across reloads and new tabs

### Requirement: Toast notifications outlet

The system SHALL render a toast container in the layout that handles success, info, and error toasts emitted by any page or hook. Toasts triggered by backend errors SHALL display the localized message mapped from the error code.

#### Scenario: Backend returns a known error code

- **GIVEN** a mutation (bid, deposit, cancel, create lot) returns `{ error: { code, message } }`
- **WHEN** the client receives the response
- **THEN** the toast displays the pt-BR message mapped from `code` in `lib/i18n/errors.ts`

#### Scenario: Backend returns an unknown error code

- **WHEN** the backend returns a code not present in the map
- **THEN** the toast falls back to the backend's `message` field

### Requirement: Global error boundary and not-found page

The system SHALL provide an `app/error.tsx` global error boundary with a "Recarregar" action, and an `app/not-found.tsx` 404 page with a link back to the vitrine.

#### Scenario: Render error in any route

- **WHEN** a route throws during rendering
- **THEN** the error boundary shows a friendly message and a "Recarregar" button that resets the error state

#### Scenario: Unknown route

- **WHEN** a user navigates to a URL that does not match any route
- **THEN** the 404 page is shown with a link back to `/`

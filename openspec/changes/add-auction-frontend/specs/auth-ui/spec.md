## ADDED Requirements

### Requirement: Registration page with role selection

The system SHALL expose `/register` with a form that collects email, password (minimum 8 chars with client-side rule), password confirmation, and a required role selector (`Leiloeiro` or `Licitante`). On successful registration the system SHALL redirect the user to `/login` with a success toast "Cadastro concluído — faça login para continuar."

#### Scenario: Successful registration

- **WHEN** a visitor submits valid email, password, password confirmation, and chooses "Licitante"
- **THEN** the client calls `POST /api/auth/register` with `role: "bidder"`, shows the success toast, and navigates to `/login`

#### Scenario: Password confirmation mismatch

- **WHEN** the password and password confirmation differ
- **THEN** the form shows an inline error "As senhas não conferem" and does not submit

#### Scenario: Email already taken

- **WHEN** the backend returns `email_taken`
- **THEN** the email input shows the error "Esse e-mail já está cadastrado." and no toast is needed

### Requirement: Login page

The system SHALL expose `/login` with a form that collects email and password, submits to the backend, stores the returned JWT via the session context, and redirects to the `next` query parameter if present (defaulting to `/`).

#### Scenario: Successful login redirects to `next`

- **GIVEN** the user navigated here from `/dashboard` so URL is `/login?next=/dashboard`
- **WHEN** login succeeds
- **THEN** the user is redirected to `/dashboard`

#### Scenario: Invalid credentials

- **WHEN** the backend returns `invalid_credentials`
- **THEN** the form shows "E-mail ou senha inválidos." under the password input and no field is pre-cleared

### Requirement: Logout action

The system SHALL expose a "Sair" button in the header for logged-in users that calls the session context's `logout()`, clears local token/state, and navigates to `/`.

#### Scenario: Logout from any page

- **WHEN** a logged-in user clicks "Sair"
- **THEN** the token is cleared from `localStorage`, the socket disconnects, and the user is sent to `/` showing the logged-out header

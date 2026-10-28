## ADDED Requirements

### Requirement: Central map from backend error codes to pt-BR messages

The system SHALL provide a single file `lib/i18n/errors.ts` exporting `errorMessage(code: string, fallback?: string): string` that maps every known backend error code to a pt-BR message matching the brief's wording. Unknown codes SHALL return the fallback (typically the backend's `message` field) or a generic "Ocorreu um erro inesperado."

#### Scenario: Known code

- **WHEN** `errorMessage("below_min_increment")` is called
- **THEN** it returns "O lance deve ser maior ou igual ao atual mais o incremento mínimo."

#### Scenario: Unknown code with fallback

- **WHEN** `errorMessage("brand_new_code", "Algo deu errado")` is called
- **THEN** it returns `"Algo deu errado"`

#### Scenario: Unknown code without fallback

- **WHEN** `errorMessage("brand_new_code")` is called
- **THEN** it returns the generic message `"Ocorreu um erro inesperado."`

### Requirement: Required mappings

The system SHALL provide at minimum the following mappings:

| code                              | message                                                                            |
|-----------------------------------|------------------------------------------------------------------------------------|
| `below_starting_bid`              | O primeiro lance deve ser maior ou igual ao lance inicial.                         |
| `below_min_increment`             | O lance deve ser maior ou igual ao atual mais o incremento mínimo.                 |
| `already_leading`                 | Você já está ganhando este lote.                                                   |
| `insufficient_available_balance`  | Saldo disponível insuficiente para este lance.                                     |
| `lot_not_started`                 | O lote ainda não começou.                                                          |
| `lot_ended`                       | O lote já foi encerrado.                                                           |
| `lot_cancelled`                   | O lote foi cancelado.                                                              |
| `lot_has_bids_cannot_cancel`      | Este lote já recebeu lances e não pode ser cancelado.                              |
| `role_forbidden`                  | Esta ação não é permitida para o seu perfil.                                       |
| `invalid_credentials`             | E-mail ou senha inválidos.                                                         |
| `email_taken`                     | Esse e-mail já está cadastrado.                                                    |
| `unauthorized`                    | Faça login para continuar.                                                         |
| `external_source_unavailable`     | Fonte externa indisponível. Tente novamente em instantes.                          |
| `not_lot_owner`                   | Apenas o leiloeiro dono do lote pode cancelá-lo.                                   |
| `network_error`                   | Falha de conexão com o servidor. Verifique sua internet e tente novamente.         |

#### Scenario: Every required code resolves to its message

- **WHEN** `errorMessage` is called with any code in the table above
- **THEN** it returns the exact message in that row

### Requirement: Feedback is surfaced in the right place

The system SHALL surface feedback via inline field errors when the backend's `details` points to a specific field or when the UI has a matching input, and via toast otherwise. Rejections tied to lot state (`lot_not_started`, `lot_ended`, `lot_cancelled`) SHALL additionally refresh the lot in the live room so the UI reflects the new state.

#### Scenario: Field-level mapping

- **WHEN** `POST /api/auth/register` returns `email_taken`
- **THEN** the error is rendered under the email input of the register form

#### Scenario: Toast-level mapping

- **WHEN** `POST /api/lots/:id/bids` returns `insufficient_available_balance`
- **THEN** the message is rendered next to the bid input and as a toast

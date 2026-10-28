const MESSAGES: Record<string, string> = {
  below_starting_bid:
    "O primeiro lance deve ser maior ou igual ao lance inicial.",
  below_min_increment:
    "O lance deve ser maior ou igual ao atual mais o incremento mínimo.",
  already_leading: "Você já está ganhando este lote.",
  insufficient_available_balance:
    "Saldo disponível insuficiente para este lance.",
  lot_not_started: "O lote ainda não começou.",
  lot_ended: "O lote já foi encerrado.",
  lot_cancelled: "O lote foi cancelado.",
  lot_has_bids_cannot_cancel:
    "Este lote já recebeu lances e não pode ser cancelado.",
  role_forbidden: "Esta ação não é permitida para o seu perfil.",
  invalid_credentials: "E-mail ou senha inválidos.",
  email_taken: "Esse e-mail já está cadastrado.",
  unauthorized: "Faça login para continuar.",
  external_source_unavailable:
    "Fonte externa indisponível. Tente novamente em instantes.",
  not_lot_owner: "Apenas o leiloeiro dono do lote pode cancelá-lo.",
  network_error:
    "Falha de conexão com o servidor. Verifique sua internet e tente novamente.",
  not_found: "Não encontrado.",
};

export function errorMessage(code: string, fallback?: string): string {
  return MESSAGES[code] ?? fallback ?? "Ocorreu um erro inesperado.";
}

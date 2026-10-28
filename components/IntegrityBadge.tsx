import { formatDateTime } from "@/lib/format";
import type { AuditResponse } from "@/lib/api/types";

const REASON_LABEL: Record<string, string> = {
  curr_hash_mismatch:
    "Um lance foi editado após ser registrado (hash do próprio lance não bate).",
  prev_hash_mismatch:
    "A ligação entre dois lances foi quebrada (prev_hash não corresponde ao anterior).",
  seq_gap: "Falta um lance ou a sequência foi reordenada.",
  seal_hmac_invalid:
    "Um selo da auditoria foi forjado (HMAC não verifica com a chave do servidor).",
  seal_mismatch:
    "Um selo aponta para um hash que não corresponde à cadeia atual.",
};

export function IntegrityBadge({
  integrity,
}: {
  integrity: AuditResponse["integrity"];
}) {
  if (integrity.ok) {
    return (
      <div className="rounded-lg border border-success/40 bg-success/10 p-4 text-sm">
        <div className="font-semibold text-success">
          Histórico íntegro — verificado em {formatDateTime(integrity.verified_at)}
        </div>
        <div className="mt-1 text-xs text-success/80">
          A auditoria recomputou toda a cadeia de hashes e todos os selos.
        </div>
        {integrity.head_hash && (
          <div className="mt-2 text-xs text-muted-foreground">
            head hash:{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono">
              {integrity.head_hash.slice(0, 24)}…
            </code>
          </div>
        )}
      </div>
    );
  }
  const fail = integrity.first_failure;
  const label = fail ? (REASON_LABEL[fail.reason] ?? fail.reason) : "";
  return (
    <div className="rounded-lg border border-danger/40 bg-danger/10 p-4 text-sm">
      <div className="font-semibold text-danger">
        ⚠ Histórico adulterado{fail ? ` na seq #${fail.seq}` : ""}
      </div>
      {fail && <div className="mt-1 text-xs text-danger/80">{label}</div>}
    </div>
  );
}

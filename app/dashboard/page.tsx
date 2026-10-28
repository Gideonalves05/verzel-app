"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/resources";
import { ApiError } from "@/lib/api/http";
import { errorMessage } from "@/lib/i18n/errors";
import { formatBRLFromCents, formatDateTime } from "@/lib/format";
import { RequireRole } from "@/lib/auth/RequireRole";

export default function DashboardPage() {
  return (
    <RequireRole roles={["auctioneer"]}>
      <DashboardInner />
    </RequireRole>
  );
}

function DashboardInner() {
  const qc = useQueryClient();
  const lots = useQuery({ queryKey: ["my-lots"], queryFn: api.myLots });
  const revenue = useQuery({ queryKey: ["revenue"], queryFn: api.revenue });

  const cancel = useMutation({
    mutationFn: (id: string) => api.cancelLot(id),
    onSuccess: () => {
      toast.success("Lote cancelado.");
      qc.invalidateQueries({ queryKey: ["my-lots"] });
    },
    onError: (err) => {
      const code = err instanceof ApiError ? err.code : "unknown_error";
      toast.error(errorMessage(code, err.message));
    },
  });

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Painel do leiloeiro</h1>
        <Link
          href="/dashboard/new-lot"
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
        >
          + Novo lote
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Lotes ativos"
          value={
            (lots.data ?? []).filter(
              (l) => l.status === "live" || l.status === "scheduled",
            ).length
          }
        />
        <KpiCard
          label="Lotes encerrados"
          value={(lots.data ?? []).filter((l) => l.status === "ended").length}
        />
        <KpiCard
          label="Receita total"
          value={formatBRLFromCents(revenue.data?.total_received_cents ?? "0")}
          sub={`${revenue.data?.settled_lot_count ?? 0} lote(s) liquidado(s)`}
        />
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Meus lotes</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Lote</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Encerra em</th>
                <th className="px-3 py-2 text-right">Lance atual / Final</th>
                <th className="px-3 py-2 text-left">Vencedor</th>
                <th className="px-3 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {(lots.data ?? []).map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="px-3 py-2">
                    <div className="font-medium">{l.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Inicia em {formatDateTime(l.starts_at)}
                    </div>
                  </td>
                  <td className="px-3 py-2 capitalize">{l.status}</td>
                  <td className="px-3 py-2">{formatDateTime(l.ends_at)}</td>
                  <td className="px-3 py-2 text-right">
                    {l.status === "ended"
                      ? formatBRLFromCents(l.final_amount_cents)
                      : formatBRLFromCents(
                          l.current_bid_amount_cents ?? l.starting_bid_cents,
                        )}
                  </td>
                  <td className="px-3 py-2">
                    {l.status === "ended"
                      ? (l.winner_handle ?? "sem vencedor")
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/lots/${l.id}`}
                        className="rounded-md border px-2 py-1 text-xs hover:bg-muted"
                      >
                        Abrir
                      </Link>
                      <Link
                        href={`/audit/lots/${l.id}`}
                        className="rounded-md border px-2 py-1 text-xs hover:bg-muted"
                      >
                        Auditoria
                      </Link>
                      {l.status !== "ended" &&
                        l.status !== "cancelled" &&
                        l.bid_count === 0 && (
                          <button
                            type="button"
                            className="rounded-md border border-danger/30 bg-danger/10 px-2 py-1 text-xs text-danger hover:bg-danger/20"
                            onClick={() => {
                              if (
                                confirm("Esta ação não pode ser desfeita.")
                              ) {
                                cancel.mutate(l.id);
                              }
                            }}
                          >
                            Cancelar
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
              {!lots.data?.length && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-6 text-center text-muted-foreground"
                  >
                    Você ainda não criou lotes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

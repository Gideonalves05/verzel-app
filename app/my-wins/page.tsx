"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/resources";
import { formatBRLFromCents, formatDateTime } from "@/lib/format";
import { RequireRole } from "@/lib/auth/RequireRole";

export default function MyWinsPage() {
  return (
    <RequireRole roles={["bidder"]}>
      <MyWinsInner />
    </RequireRole>
  );
}

function MyWinsInner() {
  const wins = useQuery({ queryKey: ["wins"], queryFn: api.myWins });

  function copy(token: string) {
    const url = `${window.location.origin}/receipt/${token}`;
    navigator.clipboard.writeText(url).then(() => toast.success("Link copiado"));
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">Meus arremates</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Lotes que você venceu. Compartilhe o recibo pelo link público.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3">
        {wins.data?.map((w) => (
          <div
            key={w.lot.id}
            className="flex items-center gap-4 rounded-xl border bg-card p-3"
          >
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
              {w.lot.image_url && (
                <img
                  src={w.lot.image_url}
                  alt={w.lot.title}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium">{w.lot.title}</div>
              <div className="text-xs text-muted-foreground">
                Encerrado em {formatDateTime(w.settled_at)}
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">
                {formatBRLFromCents(w.amount_cents)}
              </div>
              {w.receipt_token && (
                <div className="mt-1 flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => copy(w.receipt_token!)}
                    className="rounded-md border px-2 py-1 text-xs hover:bg-muted"
                  >
                    Copiar link
                  </button>
                  <Link
                    href={`/receipt/${w.receipt_token}`}
                    className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground"
                  >
                    Abrir recibo
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
        {!wins.data?.length && (
          <div className="rounded-xl border p-10 text-center text-sm text-muted-foreground">
            Você ainda não arrematou nenhum lote.{" "}
            <Link href="/" className="text-primary underline">
              Ir para a vitrine
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

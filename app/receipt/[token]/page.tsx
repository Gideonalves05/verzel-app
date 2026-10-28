import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api/http";
import type { ReceiptResponse } from "@/lib/api/types";
import { formatBRLFromCents, formatDateTime } from "@/lib/format";
import { CopyButton } from "@/components/CopyButton";

export const instant = false;

export default async function ReceiptPage({
  params,
}: PageProps<"/receipt/[token]">) {
  const { token } = await params;
  let data: ReceiptResponse;
  try {
    data = await apiFetch<ReceiptResponse>(`/audit/receipts/${token}`, {
      cache: "no-store",
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <nav className="text-sm">
        <Link href="/" className="text-primary underline">
          ← Vitrine
        </Link>
      </nav>
      <div className="mt-3 overflow-hidden rounded-xl border bg-card">
        {data.lot.image_url && (
          <img
            src={data.lot.image_url}
            alt={data.lot.title}
            className="aspect-video w-full bg-muted object-contain"
          />
        )}
        <div className="p-6">
          <div className="text-xs uppercase text-muted-foreground">
            Recibo de arremate
          </div>
          <h1 className="mt-1 text-2xl font-semibold">{data.lot.title}</h1>
          <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
            <span className="text-muted-foreground">Vencedor</span>
            <span className="font-mono text-right">
              {data.winner_handle ?? "—"}
            </span>
            <span className="text-muted-foreground">Valor</span>
            <span className="text-right font-semibold">
              {formatBRLFromCents(data.amount_cents)}
            </span>
            <span className="text-muted-foreground">Encerrado em</span>
            <span className="text-right">
              {formatDateTime(data.settled_at)}
            </span>
            <span className="text-muted-foreground">Leiloeiro</span>
            <span className="font-mono text-right">
              {data.auctioneer_handle}
            </span>
            {data.integrity_head_hash && (
              <>
                <span className="text-muted-foreground">
                  Hash de integridade
                </span>
                <code className="text-right font-mono text-xs">
                  {data.integrity_head_hash.slice(0, 24)}…
                </code>
              </>
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <CopyButton className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:opacity-90">
              Copiar link do recibo
            </CopyButton>
            <Link
              href={data.audit_url.replace(/^\/api/, "")}
              className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted"
            >
              Ver auditoria completa
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

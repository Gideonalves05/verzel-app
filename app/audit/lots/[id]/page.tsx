import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api/http";
import type { AuditResponse } from "@/lib/api/types";
import { formatBRLFromCents, formatDateTime } from "@/lib/format";
import { IntegrityBadge } from "@/components/IntegrityBadge";
import { CopyButton } from "@/components/CopyButton";

export const instant = false;

export default async function AuditPage({
  params,
}: PageProps<"/audit/lots/[id]">) {
  const { id } = await params;
  let data: AuditResponse;
  try {
    data = await apiFetch<AuditResponse>(`/audit/lots/${id}`, {
      cache: "no-store",
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <nav className="text-sm">
        <Link href="/" className="text-primary underline">
          ← Vitrine
        </Link>
      </nav>
      <header className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Auditoria do lote</h1>
          <div className="mt-1 text-sm text-muted-foreground">{data.lot.title}</div>
        </div>
        <CopyButton>Copiar link da auditoria</CopyButton>
      </header>

      <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-xl border bg-card">
          {data.lot.image_url && (
            <img
              src={data.lot.image_url}
              alt={data.lot.title}
              className="aspect-video w-full rounded-t-xl bg-muted object-contain"
            />
          )}
          <div className="p-4 text-sm">
            <Row k="Status" v={data.lot.status} />
            <Row k="Leiloeiro" v={data.lot.auctioneer_handle} />
            <Row k="Início" v={formatDateTime(data.lot.starts_at)} />
            <Row k="Fim" v={formatDateTime(data.lot.ends_at)} />
            {data.lot.settled_at && (
              <Row k="Liquidado em" v={formatDateTime(data.lot.settled_at)} />
            )}
            {data.lot.winner_handle && (
              <Row k="Vencedor" v={data.lot.winner_handle} />
            )}
            {data.lot.final_amount_cents && (
              <Row
                k="Valor final"
                v={formatBRLFromCents(data.lot.final_amount_cents)}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <IntegrityBadge integrity={data.integrity} />
          <div className="overflow-hidden rounded-xl border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Licitante</th>
                  <th className="px-3 py-2 text-right">Valor</th>
                  <th className="px-3 py-2 text-left">Quando</th>
                  <th className="px-3 py-2 text-left">curr_hash</th>
                </tr>
              </thead>
              <tbody>
                {data.bids.map((b) => (
                  <tr key={b.seq} className="border-t align-top">
                    <td className="px-3 py-2">#{b.seq}</td>
                    <td className="px-3 py-2 font-mono">{b.handle}</td>
                    <td className="px-3 py-2 text-right">
                      {formatBRLFromCents(b.amount_cents)}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {formatDateTime(b.placed_at)}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <code className="font-mono">
                        {b.curr_hash.slice(0, 10)}…
                      </code>
                    </td>
                  </tr>
                ))}
                {data.bids.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-6 text-center text-muted-foreground"
                    >
                      Este lote ainda não recebeu lances.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data.seals.length > 0 && (
            <div className="rounded-xl border bg-card p-4 text-xs">
              <div className="mb-2 font-semibold">
                Selos de auditoria ({data.seals.length})
              </div>
              <ul className="space-y-1">
                {data.seals.map((s) => (
                  <li key={`${s.seq}-${s.hmac}`} className="font-mono">
                    seq #{s.seq} · head{" "}
                    <span className="text-muted-foreground">
                      {s.chain_head_hash.slice(0, 10)}…
                    </span>{" "}
                    · {s.final ? "FINAL" : "periódico"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b py-1 last:border-b-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}


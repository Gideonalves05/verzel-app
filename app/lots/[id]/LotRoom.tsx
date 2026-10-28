"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/resources";
import { ApiError } from "@/lib/api/http";
import { errorMessage } from "@/lib/i18n/errors";
import { formatBRLFromCents, formatDateTime, parseBRLToCents } from "@/lib/format";
import { useSession } from "@/lib/auth/session";
import { useLiveLot } from "@/lib/ws/useLiveLot";
import { Countdown } from "@/components/Countdown";

export function LotRoom({ id }: { id: string }) {
  const qc = useQueryClient();
  const session = useSession();
  const lotQ = useQuery({
    queryKey: ["lot", id],
    queryFn: () => api.lot(id),
    refetchOnWindowFocus: true,
  });
  const bidsQ = useQuery({
    queryKey: ["bids", id],
    queryFn: () => api.bids(id, 1, 50),
  });

  const live = useLiveLot(
    id,
    {
      endsAt: lotQ.data?.ends_at ?? null,
      currentAmount: lotQ.data?.current_bid_amount_cents ?? null,
      currentLeaderHandle: lotQ.data?.current_leader_handle ?? null,
      ended: lotQ.data?.status === "ended",
    },
    {
      onBid: () => {
        qc.invalidateQueries({ queryKey: ["bids", id] });
        qc.invalidateQueries({ queryKey: ["lot", id] });
        qc.invalidateQueries({ queryKey: ["wallet"] });
      },
      onExtended: () => {
        toast.info("Lote estendido em 2 minutos");
      },
      onEnded: (ev) => {
        if (ev.receipt_token) {
          toast.success("Você arrematou! Abra o recibo.");
        } else {
          toast.info("Lote encerrado.");
        }
        qc.invalidateQueries({ queryKey: ["lot", id] });
      },
      onYouWinning: () => toast.success("Você está ganhando!"),
      onYouOutbid: () => toast.warning("Você foi superado."),
    },
  );

  useEffect(() => {
    if (!lotQ.data) return;
  }, [lotQ.data]);

  const lot = lotQ.data;
  const effectiveStatus = live.ended
    ? "ended"
    : (lot?.status ?? "scheduled");

  const currentAmount =
    live.currentAmount ??
    lot?.current_bid_amount_cents ??
    null;
  const currentLeaderHandle =
    live.currentLeaderHandle ?? lot?.current_leader_handle ?? null;
  const endsAtEffective = live.endsAt ?? lot?.ends_at ?? null;

  const myLotHandle = useMemo(() => {
    if (session.status !== "authenticated" || session.user.role !== "bidder")
      return null;
    const myBids = bidsQ.data?.data.filter((b) =>
      currentLeaderHandle ? b.handle === currentLeaderHandle : false,
    );
    return myBids && myBids.length > 0 ? currentLeaderHandle : null;
  }, [session, bidsQ.data, currentLeaderHandle]);

  const myHasBid = !!myLotHandle;

  if (lotQ.isLoading) {
    return <div className="p-10 text-center text-muted-foreground">Carregando…</div>;
  }
  if (lotQ.error || !lot) {
    return (
      <div className="p-10 text-center text-danger">
        {errorMessage(
          lotQ.error instanceof ApiError ? lotQ.error.code : "unknown_error",
          lotQ.error?.message,
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-6 lg:grid-cols-[2fr_1fr]">
      <section>
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="aspect-video w-full bg-muted">
            {lot.image_url ? (
              <img
                src={lot.image_url}
                alt={lot.title}
                className="h-full w-full object-contain"
              />
            ) : null}
          </div>
          <div className="p-5">
            <h1 className="text-xl font-semibold">{lot.title}</h1>
            <div className="mt-1 text-xs text-muted-foreground">
              Leiloeiro: {lot.auctioneer_handle} ·{" "}
              <a
                href={`https://www.metmuseum.org/art/collection/search/${lot.source.external_id}`}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Ver no Met Museum
              </a>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {lot.item_attributes.culture && (
                <span>
                  <strong>Cultura:</strong> {lot.item_attributes.culture}
                </span>
              )}
              {lot.item_attributes.date && (
                <span>
                  <strong>Data:</strong> {lot.item_attributes.date}
                </span>
              )}
              {lot.item_attributes.medium && (
                <span>
                  <strong>Técnica:</strong> {lot.item_attributes.medium}
                </span>
              )}
            </div>
          </div>
        </div>

        <h2 className="mt-6 text-lg font-semibold">Histórico de lances</h2>
        <div className="mt-2 overflow-hidden rounded-xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Licitante</th>
                <th className="px-3 py-2 text-right">Valor</th>
                <th className="px-3 py-2 text-left">Quando</th>
              </tr>
            </thead>
            <tbody>
              {(bidsQ.data?.data ?? []).map((b) => (
                <tr key={b.seq} className="border-t">
                  <td className="px-3 py-2">#{b.seq}</td>
                  <td className="px-3 py-2 font-mono">{b.handle}</td>
                  <td className="px-3 py-2 text-right">
                    {formatBRLFromCents(b.amount_cents)}
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {formatDateTime(b.placed_at)}
                  </td>
                </tr>
              ))}
              {!bidsQ.data?.data.length && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-6 text-center text-muted-foreground"
                  >
                    Ainda sem lances — seja o primeiro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm">
          <Link
            href={`/audit/lots/${lot.id}`}
            className="text-primary underline"
          >
            Abrir página de auditoria pública →
          </Link>
        </div>
      </section>

      <aside className="flex flex-col gap-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="text-xs uppercase text-muted-foreground">
            {effectiveStatus === "live"
              ? "Lance atual"
              : effectiveStatus === "scheduled"
                ? "Lance inicial"
                : "Lance final"}
          </div>
          <div className="mt-1 text-3xl font-semibold">
            {formatBRLFromCents(currentAmount ?? lot.starting_bid_cents)}
          </div>
          {currentLeaderHandle && (
            <div className="mt-1 text-xs text-muted-foreground">
              Líder: <span className="font-mono">{currentLeaderHandle}</span>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between text-sm">
            {effectiveStatus === "live" ? (
              <>
                <span className="text-muted-foreground">Encerra em</span>
                <Countdown endsAt={endsAtEffective} />
              </>
            ) : effectiveStatus === "scheduled" ? (
              <>
                <span className="text-muted-foreground">Inicia em</span>
                <span>{formatDateTime(lot.starts_at)}</span>
              </>
            ) : (
              <>
                <span className="text-muted-foreground">Encerrado em</span>
                <span>
                  {formatDateTime(live.settledAt ?? lot.settled_at ?? lot.ends_at)}
                </span>
              </>
            )}
          </div>
        </div>

        {effectiveStatus === "live" && (
          <BidPanel
            lotId={lot.id}
            startingBid={lot.starting_bid_cents}
            minIncrement={lot.min_increment_cents}
            currentAmount={currentAmount}
            currentLeaderHandle={currentLeaderHandle}
            myHandle={myLotHandle}
            myHasBid={myHasBid}
          />
        )}

        {effectiveStatus === "ended" && (
          <div className="rounded-xl border bg-card p-5 text-sm">
            {currentAmount ? (
              <>
                <div className="text-muted-foreground">Vencedor</div>
                <div className="font-mono text-base">
                  {live.winnerHandle ?? currentLeaderHandle ?? "—"}
                </div>
                <div className="mt-2 font-semibold">
                  {formatBRLFromCents(live.finalAmount ?? currentAmount)}
                </div>
                {live.receiptToken && (
                  <Link
                    href={`/receipt/${live.receiptToken}`}
                    className="mt-3 inline-block rounded-md bg-accent px-3 py-1.5 text-sm text-accent-foreground"
                  >
                    Abrir meu recibo →
                  </Link>
                )}
              </>
            ) : (
              <div className="text-muted-foreground">Encerrado sem lances</div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}

function BidPanel({
  lotId,
  startingBid,
  minIncrement,
  currentAmount,
  currentLeaderHandle,
  myHandle,
  myHasBid,
}: {
  lotId: string;
  startingBid: string;
  minIncrement: string;
  currentAmount: string | null;
  currentLeaderHandle: string | null;
  myHandle: string | null;
  myHasBid: boolean;
}) {
  const session = useSession();
  const [value, setValue] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [requiredQuick, setRequiredQuick] = useState<string | null>(null);
  const qc = useQueryClient();

  const required = useMemo(() => {
    if (!currentAmount) return BigInt(startingBid);
    return BigInt(currentAmount) + BigInt(minIncrement);
  }, [currentAmount, startingBid, minIncrement]);

  useEffect(() => {
    setValue((Number(required) / 100).toFixed(2).replace(".", ","));
  }, [required]);

  const place = useMutation({
    mutationFn: (cents: string) => api.placeBid(lotId, cents),
    onSuccess: () => {
      setFieldError(null);
      setRequiredQuick(null);
      toast.success("Lance aceito");
      qc.invalidateQueries({ queryKey: ["wallet"] });
    },
    onError: (err) => {
      const code = err instanceof ApiError ? err.code : "unknown_error";
      const msg = errorMessage(code, err.message);
      setFieldError(msg);
      if (
        err instanceof ApiError &&
        err.details?.required_cents &&
        (code === "below_min_increment" || code === "below_starting_bid")
      ) {
        setRequiredQuick(String(err.details.required_cents));
      } else {
        toast.error(msg);
      }
    },
  });

  if (session.status !== "authenticated") {
    return (
      <div className="rounded-xl border bg-card p-5 text-sm">
        Entre para dar lance.
        <Link
          href={`/login?next=/lots/${lotId}`}
          className="ml-2 rounded-md bg-primary px-3 py-1 text-primary-foreground"
        >
          Entrar
        </Link>
      </div>
    );
  }
  if (session.user.role !== "bidder") {
    return (
      <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">
        Leiloeiros não dão lances.
      </div>
    );
  }

  const isLeader = !!myHandle && myHandle === currentLeaderHandle;
  const positionBadge = isLeader
    ? { text: "Você está ganhando", cls: "bg-success/15 text-success" }
    : myHasBid
      ? { text: "Você foi superado", cls: "bg-danger/15 text-danger" }
      : { text: "Dê o seu lance", cls: "bg-muted text-muted-foreground" };

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cents = parseBRLToCents(value);
    if (!cents) {
      setFieldError("Valor inválido.");
      return;
    }
    place.mutate(cents);
  }

  function applyQuick() {
    if (!requiredQuick) return;
    setValue((Number(requiredQuick) / 100).toFixed(2).replace(".", ","));
    setRequiredQuick(null);
    setFieldError(null);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border bg-card p-5">
      <div
        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${positionBadge.cls}`}
      >
        {positionBadge.text}
      </div>
      <label className="mt-3 flex flex-col gap-1 text-sm">
        Seu lance (R$)
        <input
          className="auth-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputMode="decimal"
          disabled={isLeader}
          required
        />
      </label>
      {fieldError && (
        <div className="mt-2 text-sm text-danger">{fieldError}</div>
      )}
      {requiredQuick && (
        <button
          type="button"
          onClick={applyQuick}
          className="mt-2 text-xs text-primary underline"
        >
          Usar o mínimo exigido: {formatBRLFromCents(requiredQuick)}
        </button>
      )}
      <button
        type="submit"
        disabled={place.isPending || isLeader}
        className="mt-3 w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {place.isPending ? "Enviando…" : "Dar lance"}
      </button>
      <div className="mt-2 text-right text-xs">
        <Link href="/wallet" className="text-muted-foreground underline">
          Ver minha carteira
        </Link>
      </div>
    </form>
  );
}

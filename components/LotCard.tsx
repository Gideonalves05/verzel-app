"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Lot } from "@/lib/api/types";
import { formatBRLFromCents, formatDateTime } from "@/lib/format";

function useCountdown(endsAt: string | null): string {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!endsAt) return "—";
  const end = new Date(endsAt).getTime();
  const diff = end - now;
  if (diff <= 0) return "00:00:00";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function LotCard({ lot }: { lot: Lot }) {
  const countdown = useCountdown(lot.status === "live" ? lot.ends_at : null);
  return (
    <Link
      href={`/lots/${lot.id}`}
      className="group block overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
        {lot.image_url ? (
          <img
            src={lot.image_url}
            alt={lot.title}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            sem imagem
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold">{lot.title}</h3>
          <StatusBadge status={lot.status} />
        </div>
        <div className="mt-3 text-sm">
          {lot.status === "scheduled" ? (
            <>
              <div className="text-muted-foreground">Lance inicial</div>
              <div className="font-semibold">
                {formatBRLFromCents(lot.starting_bid_cents)}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Inicia em {formatDateTime(lot.starts_at)}
              </div>
            </>
          ) : lot.status === "live" ? (
            <>
              <div className="text-muted-foreground">Lance atual</div>
              <div className="font-semibold">
                {formatBRLFromCents(
                  lot.current_bid_amount_cents ?? lot.starting_bid_cents,
                )}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Encerra em</span>
                <span className="font-mono text-foreground">{countdown}</span>
              </div>
            </>
          ) : lot.status === "ended" ? (
            lot.current_bid_amount_cents ? (
              <>
                <div className="text-muted-foreground">Arrematado por</div>
                <div className="font-semibold">
                  {formatBRLFromCents(lot.current_bid_amount_cents)}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  por {lot.current_leader_handle ?? "—"}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                Encerrado sem lances
              </div>
            )
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: Lot["status"] }) {
  const label =
    status === "live"
      ? "Ao vivo"
      : status === "scheduled"
        ? "Agendado"
        : "Encerrado";
  const cls =
    status === "live"
      ? "bg-success/15 text-success"
      : status === "scheduled"
        ? "bg-accent/20 text-accent-foreground"
        : "bg-muted text-muted-foreground";
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${cls}`}>
      {label}
    </span>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/resources";
import { ApiError } from "@/lib/api/http";
import { errorMessage } from "@/lib/i18n/errors";
import { parseBRLToCents } from "@/lib/format";
import { RequireRole } from "@/lib/auth/RequireRole";
import type { ExternalItemHit } from "@/lib/api/types";

export default function NewLotPage() {
  return (
    <RequireRole roles={["auctioneer"]}>
      <NewLotInner />
    </RequireRole>
  );
}

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function NewLotInner() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const debouncedQ = useDebounced(q, 350);
  const [chosen, setChosen] = useState<ExternalItemHit | null>(null);

  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [startingBid, setStartingBid] = useState("");
  const [minIncrement, setMinIncrement] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const search = useQuery({
    queryKey: ["external-search", debouncedQ],
    queryFn: () => api.searchExternal(debouncedQ, 1),
    enabled: debouncedQ.length >= 2,
  });

  const resultSummary = useMemo(() => {
    if (!search.data) return null;
    return `${search.data.data.length} de ${search.data.total} resultados exibidos`;
  }, [search.data]);

  useEffect(() => {
    if (chosen) setTitle(chosen.title);
  }, [chosen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!chosen) {
      toast.error("Escolha um item primeiro.");
      return;
    }
    const starting = parseBRLToCents(startingBid);
    const increment = parseBRLToCents(minIncrement);
    if (!starting) {
      toast.error("Lance inicial inválido.");
      return;
    }
    if (!increment) {
      toast.error("Incremento mínimo inválido.");
      return;
    }
    const startsAtIso = new Date(startsAt).toISOString();
    const endsAtIso = new Date(endsAt).toISOString();
    setSubmitting(true);
    try {
      const lot = await api.createLot({
        provider: chosen.provider,
        external_id: chosen.external_id,
        title: title || undefined,
        starts_at: startsAtIso,
        ends_at: endsAtIso,
        starting_bid_cents: starting,
        min_increment_cents: increment,
      });
      toast.success("Lote criado.");
      router.push(`/lots/${lot.id}`);
    } catch (err) {
      const code = err instanceof ApiError ? err.code : "unknown_error";
      toast.error(errorMessage(code, err instanceof Error ? err.message : ""));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 p-6 lg:grid-cols-2">
      <section>
        <h1 className="text-xl font-semibold">1. Busque um item</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Fonte: Metropolitan Museum of Art — API pública.
        </p>
        <input
          className="auth-input mt-3"
          placeholder="ex: van gogh, monet, armor…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {resultSummary && (
          <div className="mt-2 text-xs text-muted-foreground">
            {resultSummary}
          </div>
        )}
        {search.error && (
          <div className="mt-3 rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            {errorMessage(
              search.error instanceof ApiError
                ? search.error.code
                : "unknown_error",
              search.error.message,
            )}
          </div>
        )}
        <div className="mt-3 grid max-h-[600px] grid-cols-2 gap-2 overflow-y-auto">
          {search.data?.data.map((hit) => (
            <button
              key={`${hit.provider}:${hit.external_id}`}
              type="button"
              className={`overflow-hidden rounded-md border text-left transition ${chosen?.external_id === hit.external_id ? "ring-2 ring-primary" : "hover:bg-muted"}`}
              onClick={() => setChosen(hit)}
            >
              <div className="aspect-square w-full bg-muted">
                {hit.thumbnail_url ? (
                  <img
                    src={hit.thumbnail_url}
                    alt={hit.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="p-2">
                <div className="line-clamp-2 text-xs font-medium">
                  {hit.title}
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">
                  {hit.culture || hit.date || `#${hit.external_id}`}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h1 className="text-xl font-semibold">2. Dados do lote</h1>
        <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
          <div className="rounded-md border bg-muted/30 p-3 text-sm">
            Item escolhido:{" "}
            {chosen ? (
              <span className="font-medium">{chosen.title}</span>
            ) : (
              <span className="text-muted-foreground">
                nenhum (escolha ao lado)
              </span>
            )}
          </div>
          <label className="flex flex-col gap-1 text-sm">
            Título (opcional)
            <input
              className="auth-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Deixe em branco para usar o título do item"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              Início
              <input
                type="datetime-local"
                className="auth-input"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Fim
              <input
                type="datetime-local"
                className="auth-input"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                required
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              Lance inicial (R$)
              <input
                className="auth-input"
                value={startingBid}
                onChange={(e) => setStartingBid(e.target.value)}
                placeholder="100,00"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Incremento mínimo (R$)
              <input
                className="auth-input"
                value={minIncrement}
                onChange={(e) => setMinIncrement(e.target.value)}
                placeholder="5,00"
                required
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={submitting || !chosen}
            className="mt-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Criando…" : "Criar lote"}
          </button>
        </form>
      </section>
    </div>
  );
}

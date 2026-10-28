import Link from "next/link";
import { apiFetch } from "@/lib/api/http";
import type { Lot, Paginated } from "@/lib/api/types";
import { LotCard } from "@/components/LotCard";
import { Tabs } from "@/components/Tabs";

export const instant = false;

const TABS = [
  { key: "live", label: "Ao vivo" },
  { key: "scheduled", label: "Agendados" },
  { key: "ended", label: "Encerrados" },
];

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const status = (typeof sp.status === "string" ? sp.status : "live") || "live";
  const page = Number(sp.page ?? 1) || 1;
  const q = typeof sp.q === "string" ? sp.q : "";

  const qs = new URLSearchParams();
  qs.set("status", status);
  qs.set("page", String(page));
  qs.set("pageSize", "20");
  if (q) qs.set("q", q);

  let payload: Paginated<Lot> | null = null;
  let errored = false;
  try {
    payload = await apiFetch<Paginated<Lot>>(`/lots?${qs.toString()}`, {
      cache: "no-store",
    });
  } catch {
    errored = true;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">
          Casa de leilões Verzel
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Vitrine pública de lotes. Entre no lote ao vivo para dar lances em
          tempo real ou abra a página de auditoria de qualquer lote para
          verificar o histórico íntegro, sem precisar logar.
        </p>
      </section>

      <Tabs items={TABS} active={status} />

      {errored && (
        <div className="mt-6 rounded-md border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          Não consegui carregar a vitrine agora. Confira se o backend está no ar
          e recarregue a página.
        </div>
      )}

      {payload && payload.data.length === 0 && (
        <div className="mt-10 text-center text-sm text-muted-foreground">
          Nenhum lote nesta aba.
        </div>
      )}

      {payload && payload.data.length > 0 && (
        <>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {payload.data.map((lot) => (
              <LotCard key={lot.id} lot={lot} />
            ))}
          </div>

          <Pagination
            page={payload.page}
            total={payload.total}
            pageSize={payload.pageSize}
            status={status}
            q={q}
          />
        </>
      )}
    </div>
  );
}

function Pagination({
  page,
  total,
  pageSize,
  status,
  q,
}: {
  page: number;
  total: number;
  pageSize: number;
  status: string;
  q: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  function href(p: number) {
    const qs = new URLSearchParams();
    qs.set("status", status);
    qs.set("page", String(p));
    if (q) qs.set("q", q);
    return `/?${qs.toString()}`;
  }
  return (
    <div className="mt-6 flex items-center justify-between text-sm">
      <div className="text-muted-foreground">
        Página {page} de {totalPages} — {total} lotes
      </div>
      <div className="flex gap-2">
        <Link
          href={href(Math.max(1, page - 1))}
          aria-disabled={page <= 1}
          className={`rounded-md border px-3 py-1.5 ${page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-muted"}`}
        >
          Anterior
        </Link>
        <Link
          href={href(Math.min(totalPages, page + 1))}
          aria-disabled={page >= totalPages}
          className={`rounded-md border px-3 py-1.5 ${page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-muted"}`}
        >
          Próxima
        </Link>
      </div>
    </div>
  );
}

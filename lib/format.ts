const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRLFromCents(cents: string | number | null | undefined): string {
  if (cents === null || cents === undefined) return "—";
  const num = typeof cents === "string" ? Number(cents) : cents;
  if (!Number.isFinite(num)) return "—";
  return BRL.format(num / 100);
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function parseBRLToCents(value: string): string | null {
  if (!value) return null;
  const normalized = value.replace(/\./g, "").replace(",", ".").trim();
  const n = Number(normalized);
  if (!Number.isFinite(n) || n <= 0) return null;
  return String(Math.round(n * 100));
}

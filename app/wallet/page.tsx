"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/resources";
import { ApiError } from "@/lib/api/http";
import { errorMessage } from "@/lib/i18n/errors";
import { formatBRLFromCents, parseBRLToCents } from "@/lib/format";
import { RequireRole } from "@/lib/auth/RequireRole";

export default function WalletPage() {
  return (
    <RequireRole roles={["bidder"]}>
      <WalletInner />
    </RequireRole>
  );
}

function WalletInner() {
  const qc = useQueryClient();
  const wallet = useQuery({ queryKey: ["wallet"], queryFn: api.wallet });
  const [amount, setAmount] = useState("");

  const deposit = useMutation({
    mutationFn: (cents: string) => api.deposit(cents),
    onSuccess: () => {
      toast.success("Depósito realizado");
      setAmount("");
      qc.invalidateQueries({ queryKey: ["wallet"] });
    },
    onError: (err) => {
      const code = err instanceof ApiError ? err.code : "unknown_error";
      toast.error(errorMessage(code, err.message));
    },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cents = parseBRLToCents(amount);
    if (!cents) {
      toast.error("Valor inválido.");
      return;
    }
    deposit.mutate(cents);
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Minha carteira</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Saldo <strong>comprometido</strong> é o total dos lances em que você
        está ganhando agora. Ao ser superado, o valor volta ao disponível na
        hora.
      </p>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <WalletCard
          label="Saldo total"
          value={formatBRLFromCents(wallet.data?.total_cents)}
        />
        <WalletCard
          label="Comprometido"
          value={formatBRLFromCents(wallet.data?.committed_cents)}
        />
        <WalletCard
          label="Disponível"
          value={formatBRLFromCents(wallet.data?.available_cents)}
          highlight
        />
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-8 flex flex-col gap-3 rounded-xl border bg-card p-5"
      >
        <h2 className="text-lg font-semibold">Depósito simulado</h2>
        <label className="flex flex-col gap-1 text-sm">
          Valor do depósito (R$)
          <input
            className="auth-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="500,00"
            required
          />
        </label>
        <button
          type="submit"
          disabled={deposit.isPending}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {deposit.isPending ? "Processando…" : "Depositar"}
        </button>
      </form>
    </div>
  );
}

function WalletCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${highlight ? "bg-accent/15" : "bg-card"}`}
    >
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

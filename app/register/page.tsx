"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api/resources";
import { ApiError } from "@/lib/api/http";
import { errorMessage } from "@/lib/i18n/errors";
import type { UserRole } from "@/lib/api/types";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<UserRole>("bidder");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError(null);
    if (password.length < 8) {
      toast.error("A senha precisa ter ao menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não conferem");
      return;
    }
    setLoading(true);
    try {
      await api.register({ email, password, role });
      toast.success("Cadastro concluído — faça login para continuar.");
      router.replace("/login");
    } catch (err) {
      const code = err instanceof ApiError ? err.code : "unknown_error";
      const msg = errorMessage(
        code,
        err instanceof Error ? err.message : undefined,
      );
      if (code === "email_taken") setEmailError(msg);
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-semibold">Cadastrar</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="text-primary underline">
          Entrar
        </Link>
      </p>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          E-mail
          <input
            className="auth-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          {emailError && (
            <span className="text-sm text-danger">{emailError}</span>
          )}
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Senha
          <input
            className="auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            autoComplete="new-password"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Confirmar senha
          <input
            className="auth-input"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            minLength={8}
            required
            autoComplete="new-password"
          />
        </label>
        <fieldset className="flex flex-col gap-2 text-sm">
          <legend className="mb-1">Como você vai usar a plataforma?</legend>
          <label className="flex items-start gap-2 rounded-md border p-3 cursor-pointer hover:bg-muted">
            <input
              type="radio"
              name="role"
              value="bidder"
              checked={role === "bidder"}
              onChange={() => setRole("bidder")}
            />
            <div>
              <div className="font-medium">Licitante</div>
              <div className="text-muted-foreground text-xs">
                Depositar saldo, dar lances e arrematar lotes.
              </div>
            </div>
          </label>
          <label className="flex items-start gap-2 rounded-md border p-3 cursor-pointer hover:bg-muted">
            <input
              type="radio"
              name="role"
              value="auctioneer"
              checked={role === "auctioneer"}
              onChange={() => setRole("auctioneer")}
            />
            <div>
              <div className="font-medium">Leiloeiro</div>
              <div className="text-muted-foreground text-xs">
                Criar e gerenciar lotes a partir de itens de uma API pública.
              </div>
            </div>
          </label>
        </fieldset>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Enviando…" : "Criar conta"}
        </button>
      </form>
    </div>
  );
}

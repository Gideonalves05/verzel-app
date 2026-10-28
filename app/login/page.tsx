"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api/resources";
import { ApiError } from "@/lib/api/http";
import { errorMessage } from "@/lib/i18n/errors";
import { useSession } from "@/lib/auth/session";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Carregando…</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const session = useSession();
  const next = search.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    if (session.status === "authenticated") router.replace(next);
  }, [session.status, next, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);
    setLoading(true);
    try {
      const resp = await api.login({ email, password });
      session.login(resp.access_token, resp.user);
      toast.success(`Olá, ${resp.user.handle}`);
      router.replace(next);
    } catch (err) {
      const code = err instanceof ApiError ? err.code : "unknown_error";
      const msg = errorMessage(
        code,
        err instanceof Error ? err.message : undefined,
      );
      if (code === "invalid_credentials") setFieldError(msg);
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-semibold">Entrar</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Use um dos usuários de teste ou cadastre o seu em{" "}
        <Link href="/register" className="text-primary underline">
          Cadastrar
        </Link>
        .
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
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Senha
          <input
            className="auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {fieldError && (
            <span className="text-sm text-danger">{fieldError}</span>
          )}
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}

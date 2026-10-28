"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth/session";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const session = useSession();
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <span className="inline-block h-6 w-6 rounded-md bg-accent" />
          <span className="text-foreground">Verzel Leilões</span>
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/"
            className="text-foreground/80 hover:text-foreground transition"
          >
            Vitrine
          </Link>
          {session.status === "authenticated" &&
            session.user.role === "bidder" && (
              <>
                <Link
                  href="/wallet"
                  className="text-foreground/80 hover:text-foreground transition"
                >
                  Carteira
                </Link>
                <Link
                  href="/my-wins"
                  className="text-foreground/80 hover:text-foreground transition"
                >
                  Meus arremates
                </Link>
              </>
            )}
          {session.status === "authenticated" &&
            session.user.role === "auctioneer" && (
              <Link
                href="/dashboard"
                className="text-foreground/80 hover:text-foreground transition"
              >
                Painel
              </Link>
            )}

          <ThemeToggle />

          {session.status === "authenticated" ? (
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full border px-2 py-1 text-xs text-muted-foreground sm:inline">
                {session.user.handle}
              </span>
              <button
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
                onClick={session.logout}
              >
                Sair
              </button>
            </div>
          ) : session.status === "unauthenticated" ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
              >
                Cadastrar
              </Link>
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

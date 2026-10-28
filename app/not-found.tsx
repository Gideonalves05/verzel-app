import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl p-8 text-center">
      <h1 className="text-3xl font-semibold">Página não encontrada</h1>
      <p className="mt-2 text-muted-foreground">
        O endereço que você acessou não existe.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
      >
        Voltar à vitrine
      </Link>
    </div>
  );
}

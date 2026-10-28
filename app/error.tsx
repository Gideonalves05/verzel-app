"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl p-8 text-center">
      <h1 className="text-2xl font-semibold">Algo deu errado</h1>
      <p className="mt-2 text-muted-foreground">
        {error.message || "Ocorreu um erro inesperado."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
      >
        Recarregar
      </button>
    </div>
  );
}

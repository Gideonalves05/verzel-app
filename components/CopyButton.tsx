"use client";

import { toast } from "sonner";

export function CopyButton({
  getText,
  children = "Copiar link",
  className = "rounded-md border px-3 py-1.5 text-xs hover:bg-muted",
}: {
  getText?: () => string;
  children?: React.ReactNode;
  className?: string;
}) {
  function copy() {
    const text = getText ? getText() : window.location.href;
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Link copiado"));
  }
  return (
    <button type="button" onClick={copy} className={className}>
      {children}
    </button>
  );
}

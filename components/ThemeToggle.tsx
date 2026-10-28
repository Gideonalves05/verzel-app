"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const current = mounted ? resolvedTheme : undefined;
  const next = current === "dark" ? "light" : "dark";
  return (
    <button
      aria-label="Alternar tema"
      className="rounded-md border px-2 py-1.5 text-sm hover:bg-muted"
      onClick={() => setTheme(next)}
      type="button"
    >
      {current === "dark" ? "☀️" : "🌙"}
    </button>
  );
}

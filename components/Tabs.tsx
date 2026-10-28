"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export type TabItem = { key: string; label: string };

export function Tabs({
  items,
  active,
  param = "status",
}: {
  items: TabItem[];
  active: string;
  param?: string;
}) {
  const pathname = usePathname();
  const sp = useSearchParams();

  function hrefFor(key: string) {
    const next = new URLSearchParams(sp.toString());
    next.set(param, key);
    next.delete("page");
    return `${pathname}?${next.toString()}`;
  }

  return (
    <div className="flex gap-1 border-b border-border">
      {items.map((it) => {
        const isActive = it.key === active;
        return (
          <Link
            key={it.key}
            href={hrefFor(it.key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm transition ${
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {it.label}
          </Link>
        );
      })}
    </div>
  );
}

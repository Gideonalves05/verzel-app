"use client";

import { useEffect, useState } from "react";

export function Countdown({ endsAt }: { endsAt: string | null }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);
  if (!endsAt) return <span className="font-mono">—</span>;
  const end = new Date(endsAt).getTime();
  const diff = end - now;
  if (diff <= 0) return <span className="font-mono">00:00:00</span>;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return (
    <span className="font-mono">
      {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:
      {String(s).padStart(2, "0")}
    </span>
  );
}

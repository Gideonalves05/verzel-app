"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "./session";
import type { UserRole } from "../api/types";
import { errorMessage } from "../i18n/errors";

export function RequireRole({
  roles,
  children,
}: {
  roles: UserRole[];
  children: React.ReactNode;
}) {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (session.status === "loading") return;
    if (session.status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!roles.includes(session.user.role)) {
      toast.error(errorMessage("role_forbidden"));
      router.replace("/");
    }
  }, [session, pathname, roles, router]);

  if (session.status !== "authenticated") {
    return (
      <div className="p-6 text-sm text-muted-foreground">Carregando…</div>
    );
  }
  if (!roles.includes(session.user.role)) return null;
  return <>{children}</>;
}

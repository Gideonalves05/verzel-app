"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiFetch, readStoredToken, storeToken } from "../api/http";
import { closeSocket } from "../ws/socket";
import type { User } from "../api/types";

type SessionState =
  | { status: "loading"; token: null; user: null }
  | { status: "unauthenticated"; token: null; user: null }
  | { status: "authenticated"; token: string; user: User };

type SessionContextValue = SessionState & {
  login: (token: string, user: User) => void;
  logout: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>({
    status: "loading",
    token: null,
    user: null,
  });

  useEffect(() => {
    const token = readStoredToken();
    if (!token) {
      setState({ status: "unauthenticated", token: null, user: null });
      return;
    }
    apiFetch<User>("/me", { token })
      .then((user) => {
        setState({ status: "authenticated", token, user });
      })
      .catch(() => {
        storeToken(null);
        setState({ status: "unauthenticated", token: null, user: null });
      });
  }, []);

  const login = useCallback((token: string, user: User) => {
    storeToken(token);
    setState({ status: "authenticated", token, user });
  }, []);

  const logout = useCallback(() => {
    storeToken(null);
    closeSocket();
    setState({ status: "unauthenticated", token: null, user: null });
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({ ...state, login, logout }),
    [state, login, logout],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside AuthProvider");
  return ctx;
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    status: number,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

const TOKEN_STORAGE_KEY = "verzel.auth.token";

export function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token === null) window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    else window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // ignore
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  const token = init.token ?? readStoredToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let resp: Response;
  try {
    resp = await fetch(url, { ...init, headers });
  } catch (err) {
    throw new ApiError(
      "network_error",
      (err as Error).message || "Network error",
      0,
    );
  }

  if (resp.status === 204) return undefined as T;

  let body: unknown = null;
  const text = await resp.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }
  }

  if (!resp.ok) {
    const asObj = body as {
      error?: { code?: string; message?: string; details?: Record<string, unknown> };
      message?: string;
    } | null;
    const code = asObj?.error?.code ?? inferCode(resp.status);
    const message =
      asObj?.error?.message ?? asObj?.message ?? `HTTP ${resp.status}`;
    throw new ApiError(code, message, resp.status, asObj?.error?.details);
  }

  return body as T;
}

function inferCode(status: number): string {
  if (status === 401) return "unauthorized";
  if (status === 403) return "role_forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 503) return "external_source_unavailable";
  return "unknown_error";
}

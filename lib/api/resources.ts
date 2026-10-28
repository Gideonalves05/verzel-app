import type {
  AuditResponse,
  ExternalItemHit,
  Lot,
  LoginResponse,
  MyLot,
  Paginated,
  ReceiptResponse,
  RevenueSummary,
  User,
  Wallet,
  Win,
  BidRow,
  UserRole,
} from "./types";
import { apiFetch } from "./http";

export const api = {
  register: (body: { email: string; password: string; role: UserRole }) =>
    apiFetch<{ user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  me: () => apiFetch<User>("/me"),

  lots: (params: {
    status?: string;
    q?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params.status) qs.set("status", params.status);
    if (params.q) qs.set("q", params.q);
    if (params.page) qs.set("page", String(params.page));
    if (params.pageSize) qs.set("pageSize", String(params.pageSize));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return apiFetch<Paginated<Lot>>(`/lots${suffix}`);
  },

  lot: (id: string) => apiFetch<Lot>(`/lots/${id}`),

  bids: (id: string, page = 1, pageSize = 20) =>
    apiFetch<Paginated<BidRow>>(
      `/lots/${id}/bids?page=${page}&pageSize=${pageSize}`,
    ),

  placeBid: (id: string, amount_cents: string) =>
    apiFetch<{
      id: string;
      seq: number;
      lot_id: string;
      amount_cents: string;
      handle: string;
      placed_at: string;
      new_ends_at: string;
      extended: boolean;
    }>(`/lots/${id}/bids`, {
      method: "POST",
      body: JSON.stringify({ amount_cents }),
    }),

  createLot: (body: {
    provider: string;
    external_id: string;
    title?: string;
    starts_at: string;
    ends_at: string;
    starting_bid_cents: string;
    min_increment_cents: string;
  }) =>
    apiFetch<Lot>("/lots", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  cancelLot: (id: string) =>
    apiFetch<Lot>(`/lots/${id}/cancel`, { method: "POST" }),

  myLots: () => apiFetch<MyLot[]>("/me/lots"),
  revenue: () => apiFetch<RevenueSummary>("/me/revenue"),
  wallet: () => apiFetch<Wallet>("/me/wallet"),
  deposit: (amount_cents: string) =>
    apiFetch<Wallet>("/me/wallet/deposits", {
      method: "POST",
      body: JSON.stringify({ amount_cents }),
    }),

  myWins: () => apiFetch<Win[]>("/me/wins"),

  searchExternal: (q: string, page = 1) =>
    apiFetch<Paginated<ExternalItemHit>>(
      `/external-items/search?q=${encodeURIComponent(q)}&page=${page}`,
    ),

  audit: (lotId: string) =>
    apiFetch<AuditResponse>(`/audit/lots/${lotId}`),

  receipt: (token: string) =>
    apiFetch<ReceiptResponse>(`/audit/receipts/${token}`),
};

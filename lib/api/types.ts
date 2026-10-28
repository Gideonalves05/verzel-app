export type UserRole = "auctioneer" | "bidder";
export type LotStatus = "scheduled" | "live" | "ended" | "cancelled";

export type User = {
  id: string;
  email: string;
  role: UserRole;
  handle: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
};

export type Lot = {
  id: string;
  title: string;
  status: LotStatus;
  starts_at: string;
  ends_at: string;
  starting_bid_cents: string;
  min_increment_cents: string;
  current_bid_amount_cents: string | null;
  current_leader_handle: string | null;
  bid_count: number;
  image_url: string | null;
  thumbnail_url: string | null;
  item_attributes: {
    culture: string | null;
    date: string | null;
    medium: string | null;
  };
  source: { provider: string; external_id: string };
  auctioneer_handle: string;
  settled_at: string | null;
};

export type Paginated<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type BidRow = {
  seq: number;
  amount_cents: string;
  handle: string;
  placed_at: string;
};

export type Wallet = {
  total_cents: string;
  committed_cents: string;
  available_cents: string;
};

export type ExternalItemHit = {
  provider: string;
  external_id: string;
  title: string;
  primary_image_url: string | null;
  thumbnail_url: string | null;
  culture: string | null;
  date: string | null;
};

export type MyLot = Lot & {
  winner_handle: string | null;
  final_amount_cents: string | null;
};

export type RevenueSummary = {
  total_received_cents: string;
  settled_lot_count: number;
};

export type Win = {
  lot: { id: string; title: string; image_url: string | null };
  amount_cents: string;
  settled_at: string;
  receipt_token: string | null;
};

export type AuditResponse = {
  lot: {
    id: string;
    title: string;
    status: LotStatus;
    image_url: string | null;
    source: { provider: string; external_id: string };
    starts_at: string;
    ends_at: string;
    settled_at: string | null;
    auctioneer_handle: string;
    winner_handle: string | null;
    final_amount_cents: string | null;
  };
  bids: Array<BidRow & { prev_hash: string; curr_hash: string }>;
  seals: Array<{
    seq: number;
    chain_head_hash: string;
    created_at: string;
    key_id: string;
    hmac: string;
    final: boolean;
  }>;
  integrity: {
    ok: boolean;
    verified_at: string;
    head_hash: string | null;
    first_failure?: { seq: number; reason: string };
  };
};

export type ReceiptResponse = {
  lot: {
    id: string;
    title: string;
    image_url: string | null;
    source: { provider: string; external_id: string };
  };
  winner_handle: string | null;
  amount_cents: string;
  settled_at: string;
  auctioneer_handle: string;
  integrity_head_hash: string | null;
  audit_url: string;
};

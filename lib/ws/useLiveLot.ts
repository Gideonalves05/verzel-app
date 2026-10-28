"use client";

import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { getSocket } from "./socket";

export type BidPlacedEvent = {
  lot_id: string;
  seq: number;
  amount_cents: string;
  handle: string;
  placed_at: string;
  new_ends_at: string;
  extended: boolean;
};

export type LotEndedEvent = {
  lot_id: string;
  winner_handle: string | null;
  final_amount_cents: string | null;
  settled_at: string;
  receipt_token?: string | null;
};

export type LiveLotState = {
  endsAt: string | null;
  currentAmount: string | null;
  currentLeaderHandle: string | null;
  lastBidSeq: number | null;
  ended: boolean;
  winnerHandle: string | null;
  finalAmount: string | null;
  settledAt: string | null;
  receiptToken: string | null;
};

export type UseLiveLotHandlers = {
  onBid?: (ev: BidPlacedEvent) => void;
  onExtended?: (payload: { new_ends_at: string }) => void;
  onEnded?: (ev: LotEndedEvent) => void;
  onYouWinning?: (ev: {
    lot_id: string;
    current_amount_cents: string;
  }) => void;
  onYouOutbid?: (ev: {
    lot_id: string;
    current_amount_cents: string;
  }) => void;
};

export function useLiveLot(
  lotId: string | null,
  initial: Partial<LiveLotState>,
  handlers: UseLiveLotHandlers = {},
) {
  const [state, setState] = useState<LiveLotState>({
    endsAt: initial.endsAt ?? null,
    currentAmount: initial.currentAmount ?? null,
    currentLeaderHandle: initial.currentLeaderHandle ?? null,
    lastBidSeq: initial.lastBidSeq ?? null,
    ended: initial.ended ?? false,
    winnerHandle: initial.winnerHandle ?? null,
    finalAmount: initial.finalAmount ?? null,
    settledAt: initial.settledAt ?? null,
    receiptToken: initial.receiptToken ?? null,
  });
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!lotId) return;
    const socket: Socket = getSocket();
    const join = () => socket.emit("join", { lot_id: lotId });
    if (socket.connected) join();
    socket.on("connect", join);

    const onBidPlaced = (ev: BidPlacedEvent) => {
      if (ev.lot_id !== lotId) return;
      setState((prev) => ({
        ...prev,
        endsAt: ev.new_ends_at,
        currentAmount: ev.amount_cents,
        currentLeaderHandle: ev.handle,
        lastBidSeq: ev.seq,
      }));
      handlersRef.current.onBid?.(ev);
    };
    const onLotExtended = (payload: {
      lot_id: string;
      new_ends_at: string;
    }) => {
      if (payload.lot_id !== lotId) return;
      setState((prev) => ({ ...prev, endsAt: payload.new_ends_at }));
      handlersRef.current.onExtended?.(payload);
    };
    const onLotEnded = (ev: LotEndedEvent) => {
      if (ev.lot_id !== lotId) return;
      setState((prev) => ({
        ...prev,
        ended: true,
        winnerHandle: ev.winner_handle,
        finalAmount: ev.final_amount_cents,
        settledAt: ev.settled_at,
        receiptToken: ev.receipt_token ?? prev.receiptToken,
      }));
      handlersRef.current.onEnded?.(ev);
    };
    const onYouWinning = (ev: {
      lot_id: string;
      current_amount_cents: string;
    }) => {
      if (ev.lot_id !== lotId) return;
      handlersRef.current.onYouWinning?.(ev);
    };
    const onYouOutbid = (ev: {
      lot_id: string;
      current_amount_cents: string;
    }) => {
      if (ev.lot_id !== lotId) return;
      handlersRef.current.onYouOutbid?.(ev);
    };

    socket.on("bid.placed", onBidPlaced);
    socket.on("lot.extended", onLotExtended);
    socket.on("lot.ended", onLotEnded);
    socket.on("you.winning", onYouWinning);
    socket.on("you.outbid", onYouOutbid);

    return () => {
      socket.emit("leave", { lot_id: lotId });
      socket.off("connect", join);
      socket.off("bid.placed", onBidPlaced);
      socket.off("lot.extended", onLotExtended);
      socket.off("lot.ended", onLotEnded);
      socket.off("you.winning", onYouWinning);
      socket.off("you.outbid", onYouOutbid);
    };
  }, [lotId]);

  return state;
}

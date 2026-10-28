"use client";

import { io, type Socket } from "socket.io-client";
import { readStoredToken } from "../api/http";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3001";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket && socket.connected) return socket;
  if (socket) return socket;
  const token = readStoredToken();
  socket = io(`${WS_URL}/live-lots`, {
    transports: ["websocket", "polling"],
    auth: token ? { token } : undefined,
    autoConnect: true,
  });
  return socket;
}

export function closeSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

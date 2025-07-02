import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');
  }
  if (!socket) {
    socket = io(backendUrl, {
      auth: { token: typeof window !== "undefined" ? localStorage.getItem("token") : "" },
      autoConnect: false,
    });
  } else {
    // Always update token before connecting
    socket.auth = { token: localStorage.getItem("token") };
  }
  return socket;
} 
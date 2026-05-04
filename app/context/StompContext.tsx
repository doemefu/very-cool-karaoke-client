"use client";

import { createContext, useContext, useEffect, ReactNode, useState } from "react";
import { Client } from "@stomp/stompjs";
import { getApiDomain } from "@/utils/domain";
import SockJS from "sockjs-client";

interface StompContextValue {
  client: Client | null;
  connected: boolean;
}

const StompContext = createContext<StompContextValue>({ client: null, connected: false });

export function StompProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<Client | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let token = "";
    try { token = JSON.parse(localStorage.getItem("token") ?? ""); }
    catch { /* no token */ }

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(`${getApiDomain()}/ws`),
      connectHeaders: { token },
      reconnectDelay: 5000,
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
      onStompError: (frame) => console.error("STOMP error", frame),
      onWebSocketError: (event) => console.error("WebSocket error", event),
    });

    stompClient.activate();
    setClient(stompClient);

    return () => { stompClient.deactivate(); };
  }, []);

  return (
    <StompContext.Provider value={{ client, connected }}>
      {children}
    </StompContext.Provider>
  );
}

export function useStomp(): StompContextValue {
  return useContext(StompContext);
}

"use client";

import {createContext, useContext, useEffect, ReactNode, useState} from "react";
import { Client } from "@stomp/stompjs";
import { getApiDomain } from "@/utils/domain";
import SockJS from "sockjs-client";

const StompContext = createContext<Client | null>(null);

export function StompProvider({ children }: { children: ReactNode }) {
    const [client, setClient] = useState<Client | null>(null);

    useEffect(() => {
        let token = "";
        try { token = JSON.parse(localStorage.getItem("token") ?? ""); }
        catch { /* no token */ }

        const stompClient = new Client({
            webSocketFactory: () => new SockJS(`${getApiDomain()}/ws`),
            connectHeaders: { token },
            reconnectDelay: 5000,
            onStompError: () => {},
            onWebSocketError: () => {},
        });

        stompClient.activate();
        setClient(stompClient)

        return () => { stompClient.deactivate(); };
    }, []);

    return (
        <StompContext.Provider value={client}>
            {children}
        </StompContext.Provider>
    );
}

export function useStomp(): Client | null {
    return useContext(StompContext);
}
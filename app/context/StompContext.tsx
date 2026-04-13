"use client";

import { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { Client } from "@stomp/stompjs";
import { getApiDomain } from "@/utils/domain";

const StompContext = createContext<Client | null>(null);

export function StompProvider({ children }: { children: ReactNode }) {
    const clientRef = useRef<Client | null>(null);

    if (!clientRef.current) {
        const wsUrl = getApiDomain()
            .replace("https://", "wss://")
            .replace("http://", "ws://") + "/ws";

        const token = (() => {
            try { return JSON.parse(localStorage.getItem("token") ?? ""); }
            catch { return ""; }
        })();

        clientRef.current = new Client({
            brokerURL: wsUrl,
            connectHeaders: { token },
        });

        clientRef.current.activate();
    }

    useEffect(() => {
        return () => { clientRef.current?.deactivate(); };
    }, []);

    return (
        <StompContext.Provider value={clientRef.current}>
            {children}
        </StompContext.Provider>
    );
}

export function useStomp(): Client {
    const client = useContext(StompContext);
    if (!client) throw new Error("useStomp must be used inside StompProvider");
    return client;
}
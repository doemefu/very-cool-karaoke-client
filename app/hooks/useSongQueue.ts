import {useCallback, useEffect, useState} from "react";
import {useApi} from "@/hooks/useApi";
import {Song} from "@/types/song";
import {useStomp} from "@/context/StompContext";

export function useSongQueue(sessionId: string) {
    const [queue, setSongQueue] = useState<Song[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    // const [error, setError] = useState(null);
    const apiService = useApi();
    const stompClient = useStomp();

    const fetchPlaylist = useCallback(async () => {
        if (!sessionId) return;
        try {
            const res = await apiService.get(`/sessions/${sessionId}/songs`) as Song[];
            setSongQueue(res);
        } catch (error) {
            console.error(`Error reading actual SessionID "${sessionId}":`, error);
        } finally {
            setIsLoading(false);
        }
    }, [sessionId, apiService]);

    useEffect(() => {
        if (!sessionId) return;
        if (!stompClient) return;

        // Initial load via REST
        fetchPlaylist();

        // Subscribe to WebSocket topic for real-time updates
        const subscribe = () => {
            return stompClient.subscribe(
                `/topic/sessions/${sessionId}/queue`,
                (frame) => {
                    try {
                        const updatedQueue: Song[] = JSON.parse(frame.body);
                        setSongQueue(updatedQueue);
                    } catch (e) {
                        console.error("Failed to parse queue update:", e);
                    }
                }
            );
        };

        let subscription: ReturnType<typeof stompClient.subscribe> | null = null;
        let unmounted = false;

        if (stompClient.connected) {
            subscription = subscribe();

            return () => {
                unmounted = true;
                subscription?.unsubscribe();
            };
        } else {
            const prevOnConnect = stompClient.onConnect;
            stompClient.onConnect = (frame) => {
                prevOnConnect?.(frame);
                if (!unmounted) {
                    subscription = subscribe();
                }
            };

            return () => {
                unmounted = true;
                stompClient.onConnect = prevOnConnect;
                subscription?.unsubscribe();
            };
        }
    }, [sessionId, stompClient, fetchPlaylist]);

    return { queue, isLoading, refresh: fetchPlaylist };
}
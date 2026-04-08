import { useState, useEffect, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { Song } from "@/types/song";

export function useSongQueue(sessionId: string) {
    const [queue, setSongQueue] = useState<Song[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    // const [error, setError] = useState(null);
    const apiService = useApi();

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
        fetchPlaylist();
        const interval = setInterval(fetchPlaylist, 5000);
        return () => clearInterval(interval);
    }, [fetchPlaylist]);

    return { queue, isLoading, refresh: fetchPlaylist };
}
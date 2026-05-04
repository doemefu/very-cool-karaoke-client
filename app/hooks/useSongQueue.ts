import { useCallback, useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { Song } from "@/types/song";
import { useStomp } from "@/context/StompContext";

export function useSongQueue(sessionId: string) {
  const [queue, setSongQueue] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const apiService = useApi();
  const { client, connected } = useStomp();

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
    if (!sessionId || !client || !connected) return;

    fetchPlaylist();

    const subscription = client.subscribe(
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

    return () => subscription.unsubscribe();
  }, [sessionId, client, connected, fetchPlaylist]);

  return { queue, isLoading, refresh: fetchPlaylist };
}

import { useState, useEffect, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { Song } from "@/types/song";
import { ApplicationError } from "@/types/error";
import { useStomp } from "@/context/StompContext";

export interface UseLyricsResult {
  /** The song currently playing, including its lyrics field. Null if nothing plays. */
  currentSong: Song | null;
  /** True only during the very first fetch — used to show the loading spinner. */
  isLoading: boolean;
  /** Non-null when an unexpected error occurred (404 session, network error, etc). */
  fetchError: string | null;
  /** Force an immediate re-fetch (e.g. when the host skips a song). */
  refresh: () => void;
}

export const useLyrics = (sessionId: string): UseLyricsResult => {
  const apiService = useApi();
  const { client, connected } = useStomp();

  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchCurrentSong = useCallback(async () => {
    if (!sessionId) return;
    try {
      const song = await apiService.get<Song | null>(
        `/sessions/${sessionId}/songs/current`,
      );
      setFetchError(null);
      setCurrentSong(song);
    } catch (err: unknown) {
      const appError = err as ApplicationError;
      setFetchError(
        appError?.status === 404
          ? "Session not found."
          : "Could not load the current song.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, apiService]);

  // Initial REST fetch on entry
  useEffect(() => {
    if (!sessionId) return;
    fetchCurrentSong();
  }, [sessionId, fetchCurrentSong]);

  // WebSocket subscription for live updates
  useEffect(() => {
    if (!sessionId || !client || !connected) return;

    const sub = client.subscribe(
      `/topic/sessions/${sessionId}/currentSong`,
      (msg) => {
        try {
          const song: Song | null = msg.body ? JSON.parse(msg.body) : null;
          setFetchError(null);
          setCurrentSong(song);
        } catch {
          console.error("Failed to parse currentSong message:", msg.body);
        }
      },
    );

    return () => sub.unsubscribe();
  }, [sessionId, client, connected]);

  return {
    currentSong,
    isLoading,
    fetchError,
    refresh: fetchCurrentSong,
  };
};

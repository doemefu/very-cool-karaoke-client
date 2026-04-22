import {useState, useEffect, useCallback} from "react";
import { useApi } from "@/hooks/useApi";
import { Song } from "@/types/song";
import { ApplicationError } from "@/types/error";
import { useStomp } from "@/context/StompContext";

// poll interval: 5 seconds keeps all participants in sync and avoids
// hammering the server. 
// const POLL_INTERVAL_MS = 5_000;

export interface UseLyricsResult {
  /** The song currently playing, including its lyrics field. Null if nothing plays. */
  currentSong: Song | null;
  /** True only during the very first fetch — used to show the loading spinner. */
  isLoading: boolean;
  /**
   * True when a song is playing but lyrics === null.
   * Triggers the required "Lyrics not available for this song" message.
   */
  lyricsNotAvailable: boolean;
  /** True when the server returned 204 — queue is empty or session not started. */
  noSongPlaying: boolean;
  /** Non-null when an unexpected error occurred (404 session, network error, etc). */
  fetchError: string | null;
  /** Force an immediate re-fetch (e.g. when the host skips a song). */
  refresh: () => void;
}

export const useLyrics = (sessionId: string): UseLyricsResult => {
  const apiService = useApi();
  const stompClient = useStomp();

  const [currentSong, setCurrentSong]               = useState<Song | null>(null);
  const [isLoading, setIsLoading]                   = useState<boolean>(true);
  const [lyricsNotAvailable, setLyricsNotAvailable] = useState<boolean>(false);
  const [noSongPlaying, setNoSongPlaying]           = useState<boolean>(false);
  const [fetchError, setFetchError]                 = useState<string | null>(null);

  const fetchCurrentSong = useCallback(async () => {
    if (!sessionId) return;
    //
    try {
    //   // apiService.get already sets the Authorization header from localStorage.
    //   // processResponse converts 204 → null, so a null return here means
    //   // "no song currently playing" (queue empty / session not active).
      const song = await apiService.get<Song | null>(
        `/sessions/${sessionId}/songs/current`,
      );

      // Clear any previous error on a successful response
      setFetchError(null);

      if (song === null) {
        // 204: queue is empty or session hasn't started yet
        setNoSongPlaying(true);
        setCurrentSong(null);
        setLyricsNotAvailable(false);
      } else {
        // 200: a song is playing
        setNoSongPlaying(false);
        setCurrentSong(song);
        // lyrics === null means the backend found the song but has no lyrics
        setLyricsNotAvailable(song.lyrics === null);
      }
    } catch (err: unknown) {
      const appError = err as ApplicationError;
  //
  //     if (appError?.status === 404) {
  //       // Session does not exist
        setFetchError(
            appError?.status === 404
            ? "Session not found."
            : "Could not load the current song.",
        );
  //     } else {
  //       // Network error, 500, etc. — keep retrying via the interval
  //       setFetchError("Could not load the current song. Retrying…");
  //     }
    } finally {
  //     // After the very first fetch, hide the initial loading spinner
      setIsLoading(false);
    }
  }, [sessionId, apiService]);

    // 1) initial REST-Fetch on entry
    useEffect(() => {
      if (!sessionId) return;
      fetchCurrentSong();
    }, [sessionId, fetchCurrentSong]);

  // 2) WebSocket-Subscription for Live Updates
  useEffect(() => {
    if (!sessionId || !stompClient) return;

    // Fetch immediately on mount so there is no blank wait before first render
    // fetchCurrentSong();

    // Then poll so all participants stay in sync automatically.
    // When the admin skips a song the backend changes its current song and
    // every polling client picks the update up within POLL_INTERVAL_MS.
    // const intervalId = setInterval(fetchCurrentSong, POLL_INTERVAL_MS);

  //   return () => clearInterval(intervalId);
  // }, [sessionId, fetchCurrentSong]);


    let sub = { unsubscribe: () => {} };

    const doSubscribe = () => {
      sub = stompClient.subscribe(
          `/topic/sessions/${sessionId}/currentSong`,
          (msg) => {
            try {
              const song: Song | null = msg.body ? JSON.parse(msg.body) : null;
              setFetchError(null);
              if (song === null) {
                setNoSongPlaying(true);
                setCurrentSong(null);
                setLyricsNotAvailable(false);
              } else {
                setNoSongPlaying(false);
                setCurrentSong(song);
                setLyricsNotAvailable(song.lyrics === null);
              }
            } catch {
              console.error("Failed to parse currentSong message:", msg.body);
            }
          },
      );
    };

    if (stompClient.connected) {
      doSubscribe();
    } else {
      stompClient.onConnect = () => doSubscribe();
    }

    return () => sub.unsubscribe();
  }, [sessionId, stompClient]);

  return {
    currentSong,
    isLoading,
    lyricsNotAvailable,
    noSongPlaying,
    fetchError,
    refresh: fetchCurrentSong,
  };
};
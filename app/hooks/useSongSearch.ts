"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { SongSearchResult } from "@/types/song";
import { App } from "antd";

export function useSongSearch(sessionId: string, onSuccess: () => void) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SongSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { notification } = App.useApp();
  const apiService = useApi();

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ query });
        const data = await apiService.get<SongSearchResult[]>(`/songs/search?${params}`);
        setSearchResults(data);
      } catch {
        notification.error({
          title: "Search failed",
          description: "Could not reach the server.",
        });
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, notification, apiService]);

  const handleAddSong = async (song: SongSearchResult) => {
    try {
      await apiService.post(`/sessions/${sessionId}/songs`, {
        spotifyId: song.spotifyId,
        title: song.title,
        artist: song.artist,
        durationMs: song.durationMs,
      });
      notification.success({
        title: "Song Added",
        description: `"${song.title}" by ${song.artist} has been added to the queue.`,
        placement: "bottomRight",
      });
      setSearchQuery("");
      setSearchResults([]);
      onSuccess();
    } catch {
      notification.error({
        title: "Failed to add song",
        description: "Could not add the song to the queue.",
      });
    }
  };

  return { searchQuery, setSearchQuery, searchResults, isLoading, handleAddSong };
}

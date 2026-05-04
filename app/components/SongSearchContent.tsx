"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { SongSearchResult } from "@/types/song";
import { Input, Avatar, Empty, App } from "antd";
import { SearchOutlined, PlusOutlined, WarningOutlined } from "@ant-design/icons";

const { Search } = Input;

interface SongSearchContentProps {
  sessionId: string;
  onSongAdded: () => void;
}

export default function SongSearchContent({ sessionId, onSongAdded }: SongSearchContentProps) {
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
      onSongAdded();
    } catch {
      notification.error({
        title: "Failed to add song",
        description: "Could not add the song to the queue.",
      });
    }
  };

  const showEmpty = !isLoading && !!searchQuery.trim() && searchResults.length === 0;
  const showResults = !isLoading && searchResults.length > 0;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Search
          placeholder="Search by title or artist"
          size="large"
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          loading={isLoading}
          allowClear
        />
      </div>

      {showEmpty && <Empty description="No songs found" style={{ marginTop: 48 }} />}

      {showResults && (
        <div>
          {searchResults.map((item) => (
            <div
              key={item.spotifyId}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "16px 0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {item.albumArt ? (
                  <Avatar size={48} src={item.albumArt} />
                ) : (
                  <Avatar
                    size={48}
                    style={{
                      background: "linear-gradient(135deg, #FF2D7E 0%, #C91F5E 100%)",
                      flexShrink: 0,
                    }}
                  />
                )}
                <div>
                  <div style={{ color: "#FFFFFF", fontWeight: 500 }}>{item.title}</div>
                  <div style={{ color: "rgba(255, 255, 255, 0.65)", fontSize: 13 }}>{item.artist}</div>
                  {!item.lyricsAvailable && (
                    <div style={{ color: "#faad14", fontSize: 12 }}>
                      <WarningOutlined /> No lyrics available
                    </div>
                  )}
                </div>
              </div>
              <PlusOutlined
                onClick={() => handleAddSong(item)}
                style={{ fontSize: 18, color: "#FF2D7E", cursor: "pointer", marginRight: 16 }}
              />
            </div>
          ))}
        </div>
      )}

      {!searchQuery && (
        <Empty
          description="Search for songs to add to your queue"
          style={{ marginTop: 48 }}
        />
      )}
    </div>
  );
}

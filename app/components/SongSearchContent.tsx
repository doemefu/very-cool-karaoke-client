"use client";

import { Input, Avatar, Empty } from "antd";
import { SearchOutlined, PlusOutlined, WarningOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useSongSearch } from "@/hooks/useSongSearch";

const { Search } = Input;

interface SongSearchContentProps {
  sessionId: string;
  onSongAdded: () => void;
}

export default function SongSearchContent({ sessionId, onSongAdded }: SongSearchContentProps) {
  const { searchQuery, setSearchQuery, searchResults, isLoading, handleAddSong } = useSongSearch(sessionId, onSongAdded);

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
          allowClear={{ clearIcon: <CloseCircleOutlined style={{ color: "rgba(255,255,255,0.55)" }} /> }}
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
          description={<span style={{ color: "rgba(255,255,255,0.55)" }}>Search for songs to add to your queue</span>}
          style={{ marginTop: 48 }}
        />
      )}
    </div>
  );
}

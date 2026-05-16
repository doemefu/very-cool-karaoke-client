"use client";

import { Drawer, Input, Empty, Avatar } from "antd";
import { SearchOutlined, PlusOutlined, WarningOutlined } from "@ant-design/icons";
import { useSongSearch } from "@/hooks/useSongSearch";

const { Search } = Input;

interface SongSearchDrawerProps {
  open: boolean;
  onClose: () => void;
  onAddSong: () => void;
  sessionId: string;
}

export default function SongSearchDrawer({ open, onClose, onAddSong, sessionId }: SongSearchDrawerProps) {
  const { searchQuery, setSearchQuery, searchResults, isLoading, handleAddSong } = useSongSearch(sessionId, onAddSong);

  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  const showEmpty = !isLoading && searchQuery && searchResults.length === 0;
  const showResults = !isLoading && searchResults.length > 0;

  return (
    <Drawer
      title="Search Songs"
      placement="right"
      onClose={handleClose}
      open={open}
      size={400}
    >
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

      {showEmpty && (
        <Empty description="No songs found" style={{ marginTop: 48 }} />
      )}

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
                style={{ fontSize: 18, color: "#FF2D7E", cursor: "pointer" }}
              />
            </div>
          ))}
        </div>
      )}

      {!searchQuery && (
        <Empty description="Search for songs to add to your queue" style={{ marginTop: 48 }} />
      )}
    </Drawer>
  );
}

"use client";

import { Layout, Button, Typography, Tooltip, Badge, Avatar, Space } from "antd";
import { DeleteOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { Song } from "@/types/song";
import { Participant } from "@/types/session";
import { SIDEBAR_WIDTH } from "@/constants/dimensions";

const { Text } = Typography;

interface SessionSidebarProps {
  queue: Song[];
  currentSong: Song | null;
  participants: Participant[];
  isAdmin: boolean;
  userId: string;
  onAddSong: () => void;
  onDeleteSong: (songId: number) => void;
  onSkipSong: () => void;
}

export default function SessionSidebar({ queue, currentSong, participants, isAdmin, userId, onAddSong, onDeleteSong, onSkipSong }: SessionSidebarProps) {
  return (
    <Layout.Sider
      width={SIDEBAR_WIDTH}
      style={{
        background: "#1A1A2E",
        borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* ── Queue section (70%) ── */}
        <div style={{ flex: "7 1 0", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "24px 24px 0 24px", flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ color: "#FFFFFF", fontWeight: 600, fontSize: 15 }}>
                Party Playlist <Badge count={queue.length} style={{ backgroundColor: "#FF2D7E" }} />
              </Text>
              <Space size={8}>
                {isAdmin && (
                  <Tooltip title={queue.length === 0 && !currentSong ? "No songs in queue" : "Skip Song"}>
                    <Button
                      type="primary"
                      disabled={queue.length === 0 && !currentSong}
                      size="small"
                      style={{ background: "#1DB954", borderColor: "#1DB954" }}
                      onClick={onSkipSong}
                    >
                      Skip
                    </Button>
                  </Tooltip>
                )}
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={onAddSong}>
                  Add Song
                </Button>
              </Space>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 24px 12px 24px" }}>
            {currentSong && (
              <div style={{ background: "#0D0D1A", borderRadius: 8, border: "1px solid rgba(255, 45, 126, 0.4)", marginBottom: 8, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                <div>
                  <div style={{ color: "#FF2D7E", fontSize: 13, fontWeight: 600 }}>{currentSong.title}</div>
                  <div style={{ color: "rgba(255, 45, 126, 0.6)", fontSize: 12 }}>
                    {currentSong.artist}{currentSong.addedBy && <span style={{ marginLeft: 6, opacity: 0.7 }}>· 🎤 {currentSong.addedBy.username}</span>}
                  </div>
                </div>
              </div>
            )}

            {queue.length === 0 ? (
              <Text style={{ color: "rgba(255,255,255,0.3)" }}>No songs yet</Text>
            ) : (
              queue.map((song: Song) => (
                <div
                  key={song.id}
                  style={{ background: "#0D0D1A", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", marginBottom: 8, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#FFFFFF", fontSize: 13 }}>{song.title}</div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                      {song.artist}{song.addedBy && <span style={{ marginLeft: 6, opacity: 0.7 }}>· 🎤 {song.addedBy.username}</span>}
                    </div>
                  </div>
                  {isAdmin && (
                    <Tooltip title="Remove song">
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => onDeleteSong(song.id)}
                        style={{ color: "rgba(255,80,80,0.7)", flexShrink: 0 }}
                      />
                    </Tooltip>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Participants section (30%) ── */}
        <div
          style={{
            flex: "3 1 0",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div style={{ padding: "12px 24px 0 24px", flexShrink: 0 }}>
            <Text style={{ color: "#FFFFFF", fontWeight: 600, fontSize: 15, display: "block", marginBottom: 12 }}>
              Party People <Badge count={participants.length} style={{ backgroundColor: "#00C2FF" }} />
            </Text>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 24px 24px 24px" }}>
            {participants.length === 0 ? (
              <Text style={{ color: "rgba(255,255,255,0.3)" }}>No one here yet</Text>
            ) : (
              participants.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                    padding: "6px 8px",
                    borderRadius: 8,
                    background: String(p.id) === String(userId) ? "rgba(0, 194, 255, 0.08)" : "transparent",
                  }}
                >
                  <Avatar size={28} icon={<UserOutlined />} style={{ background: "rgba(0, 194, 255, 0.3)", flexShrink: 0 }} />
                  <Text style={{ color: "#FFFFFF", fontSize: 13 }}>
                    {p.username}
                    {String(p.id) === String(userId) && (
                      <span style={{ color: "#00C2FF", marginLeft: 6, fontSize: 11 }}>
                        {isAdmin ? "(host)" : "(you)"}
                      </span>
                    )}
                  </Text>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </Layout.Sider>
  );
}

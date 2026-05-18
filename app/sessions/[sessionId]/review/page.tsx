"use client";

import { useParams, useRouter } from "next/navigation";
import { useSessionReview } from "@/hooks/useSessionReview";
import { useSessionStatus } from "@/hooks/useSessionStatus";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Layout, Button, Typography, Spin, Avatar, Badge } from "antd";
import { ArrowLeftOutlined, TrophyOutlined, UserOutlined } from "@ant-design/icons";
import ParticipantLabel from "@/components/ParticipantLabel";

const { Header, Content } = Layout;
const { Text, Title } = Typography;

export default function SessionReviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const { clear: clearSessionId } = useLocalStorage<string>("sessionId", "");
  const { value: userId } = useLocalStorage<string>("id", "");
  const { reviewSongs, isLoading } = useSessionReview(sessionId, true);
  const { participants, adminId } = useSessionStatus(sessionId, userId ?? "");

  const handleBackToDashboard = () => {
    clearSessionId();
    router.push("/dashboard");
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#0D0D1A" }}>
      <Header
        style={{
          background: "rgba(13, 13, 26, 0.97)",
          borderBottom: "1px solid rgba(255, 45, 126, 0.20)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          height: 56,
        }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleBackToDashboard}
          style={{ color: "#FFFFFF" }}
        >
          Back to Dashboard
        </Button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TrophyOutlined style={{ color: "#FF2D7E", fontSize: 18 }} />
          <Text style={{ color: "#FFFFFF", fontWeight: 600, fontSize: 15 }}>Session Review</Text>
        </div>
        <div style={{ width: 160 }} />
      </Header>

      <Layout style={{ background: "transparent", height: "calc(100vh - 56px)", overflow: "hidden" }}>
        <Content style={{ padding: "40px 24px", overflowY: "auto" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>

            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
              <Title level={2} style={{ color: "#FFFFFF", margin: 0 }}>
                {"That's a wrap!"}
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 15 }}>
                Here&apos;s everything that was performed tonight
              </Text>
            </div>

            {isLoading ? (
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 40 }}>
                <Spin size="large" />
              </div>
            ) : reviewSongs.length === 0 ? (
              <Text style={{ color: "rgba(255,255,255,0.3)", display: "block", textAlign: "center" }}>
                No songs were played this session.
              </Text>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {reviewSongs.map((song, index) => (
                  <div
                    key={song.id}
                    style={{
                      background: "#1A1A2E",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12,
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, width: 24, textAlign: "right", flexShrink: 0 }}>
                      {index + 1}
                    </Text>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "#FFFFFF", fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {song.title}
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                        {song.artist}
                        {song.addedBy && (
                          <span style={{ marginLeft: 8, color: "rgba(255, 45, 126, 0.7)" }}>
                            · added by {song.addedBy.username}
                          </span>
                        )}
                      </div>
                    </div>
                    {song.currentVoteCount > 0 && (
                      <div style={{ background: "rgba(255,45,126,0.1)", border: "1px solid rgba(255,45,126,0.25)", borderRadius: 12, padding: "2px 10px", flexShrink: 0 }}>
                        <Text style={{ color: "#FF2D7E", fontSize: 12 }}>
                          {song.currentVoteCount} {song.currentVoteCount === 1 ? "vote" : "votes"}
                        </Text>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        </Content>

        <Layout.Sider
          width={280}
          style={{
            background: "#1A1A2E",
            borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
            overflowY: "auto",
            padding: "24px",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: 600, fontSize: 15, display: "block", marginBottom: 16 }}>
            Party People <Badge count={participants.length} style={{ backgroundColor: "#00C2FF" }} />
          </Text>
          {participants.length === 0 ? (
            <Text style={{ color: "rgba(255,255,255,0.3)" }}>No participants</Text>
          ) : (
            participants.map((p) => {
              const isMe = String(p.id) === String(userId);
              return (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                    padding: "6px 8px",
                    borderRadius: 8,
                    background: isMe ? "rgba(0, 194, 255, 0.08)" : "transparent",
                  }}
                >
                  <Avatar size={28} icon={<UserOutlined />} style={{ background: "rgba(0, 194, 255, 0.3)", flexShrink: 0 }} />
                  <Text style={{ color: "#FFFFFF", fontSize: 13 }}>
                    {p.username}
                    <ParticipantLabel participantId={p.id} userId={userId ?? ""} adminId={adminId} />
                  </Text>
                </div>
              );
            })
          )}
        </Layout.Sider>
      </Layout>
    </Layout>
  );
}

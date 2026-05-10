"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useLyrics } from "@/hooks/useLyrics";
import { useSongQueue } from "@/hooks/useSongQueue";
import { useVotingRound } from "@/hooks/useVotingRound";
import { useSessionStatus } from "@/hooks/useSessionStatus";
import { useApi } from "@/hooks/useApi";
import LyricsDisplay from "../../components/LyricsDisplay";
import VotingPhase from "../../components/VotingPhase";
import useLocalStorage from "@/hooks/useLocalStorage";
import SongSearchDrawer from "../../components/SongSearchDrawer";
import ReactionBar from "../../components/ReactionBar";
import { Song } from "@/types/song";
import { ApplicationError } from "@/types/error";
import YouTubePlayer from "../../components/YouTubePlayer";
import Image from "next/image";
import {
  Layout,
  Button,
  Typography,
  Tooltip,
  Badge,
  Alert,
  Spin,
  Avatar,
} from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Header, Content } = Layout;
const { Text, Title } = Typography;

export default function SessionPage() {
  const router = useRouter();
  const { sessionId } = useParams<{ sessionId: string }>();
  const apiService = useApi();
  const { value: userId } = useLocalStorage<string>("id", "");
  const { clear: clearSessionId } = useLocalStorage<string>("sessionId", "");

  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [playerActivated, setPlayerActivated] = useState(false);
  const [error, setError] = useState("");
  const [startingSession, setStartingSession] = useState(false);

  const { status, isAdmin, gamePin, sessionName, participants, isLoading: sessionLoading } =
    useSessionStatus(sessionId, userId);

  const { currentSong, isLoading, fetchError, refresh } = useLyrics(sessionId);
  const { queue } = useSongQueue(sessionId);
  const displayQueue = queue.filter((s: Song) => s.id !== currentSong?.id);
  const { openRound, clearRound } = useVotingRound(sessionId);

  const handleLeaveSession = async () => {
    setError("");
    try {
      await apiService.delete(`/sessions/${sessionId}/participants/${userId}`);
      clearSessionId();
      router.push("/dashboard");
    } catch (err) {
      const appError = err as ApplicationError;
      if (appError.status === 404) {
        clearSessionId();
        router.push("/dashboard");
      } else {
        setError("Could not leave the session. Please try again.");
      }
    }
  };

  const handleStartSession = async () => {
    setError("");
    setStartingSession(true);
    try {
      await apiService.put(`/sessions/${sessionId}`, { status: "ACTIVE" });
    } catch {
      setError("Could not start the session. Please try again.");
    } finally {
      setStartingSession(false);
    }
  };

  const handleRoundClosed = () => {
    clearRound();
    setPlayerActivated(true);
    refresh();
  };

  if (openRound) {
    return (
      <VotingPhase sessionId={sessionId} round={openRound} onRoundClosed={handleRoundClosed} />
    );
  }

  // ── Loading state ────────────────────────────────────────────────────────────
  if (sessionLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0D0D1A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // ── Waiting Lobby (status === "CREATED") ─────────────────────────────────────
  if (status === "CREATED") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0D0D1A",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
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
            onClick={() => { clearSessionId(); router.push("/dashboard"); }}
            style={{ color: "#FFFFFF" }}
          >
            Back to Dashboard
          </Button>

          {gamePin && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>PIN</Text>
              <Text
                style={{
                  color: "#FF2D7E",
                  fontWeight: 700,
                  fontSize: 20,
                  letterSpacing: "0.18em",
                }}
              >
                {gamePin}
              </Text>
            </div>
          )}

          <div style={{ width: 160 }} />
        </div>

        {/* Lobby content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 24px",
            gap: 40,
          }}
        >
          {/* Title */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 48,
                marginBottom: 12,
                filter: "drop-shadow(0 0 20px rgba(255, 45, 126, 0.5))",
              }}
            >
              🎤
            </div>
            <Title
              level={2}
              style={{
                color: "#FFFFFF",
                margin: 0,
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              {sessionName || "Karaoke Session"}
            </Title>
            <Text
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: 15,
                display: "block",
                marginTop: 8,
              }}
            >
              {isAdmin
                ? "Everyone ready? Let's get this party started!"
                : "Waiting for the party to begin..."}
            </Text>
          </div>

          {/* PIN card */}
          {gamePin && (
            <div
              style={{
                background: "rgba(255, 45, 126, 0.08)",
                border: "1px solid rgba(255, 45, 126, 0.30)",
                borderRadius: 12,
                padding: "16px 40px",
                textAlign: "center",
              }}
            >
              <Text
                style={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Join with PIN
              </Text>
              <Text
                style={{
                  color: "#FF2D7E",
                  fontSize: 34,
                  fontWeight: 800,
                  letterSpacing: "0.22em",
                }}
              >
                {gamePin}
              </Text>
            </div>
          )}

          {/* Participants list */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 12,
              padding: "16px 24px",
              width: "100%",
              maxWidth: 400,
            }}
          >
            <Text
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 12,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 12,
              }}
            >
              Teilnehmer{" "}
              <Badge
                count={participants.length}
                style={{ backgroundColor: "#FF2D7E" }}
              />
            </Text>
            {participants.length === 0 ? (
              <Text style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
                No participants yet...
              </Text>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {participants.map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar
                      size={30}
                      icon={<UserOutlined />}
                      style={{ background: "rgba(255, 45, 126, 0.3)", flexShrink: 0 }}
                    />
                    <Text style={{ color: "#FFFFFF", fontSize: 14 }}>{p.username}</Text>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <Alert
              type="error"
              description={error}
              closable
              style={{ maxWidth: 400, width: "100%" }}
            />
          )}

          {/* Start button (admin only) */}
          {isAdmin && (
            <Button
              type="primary"
              size="large"
              loading={startingSession}
              onClick={handleStartSession}
              style={{ height: 56, fontSize: 18, fontWeight: 600 }}
            >
              🎉 Start the Party
            </Button>
          )}

          {/* Pulsing dots + label for guests waiting */}
          {!isAdmin && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#FF2D7E",
                      animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                      opacity: 0.7,
                    }}
                  />
                ))}
                <style>{`
                  @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.4; }
                    50% { transform: scale(1.4); opacity: 1; }
                  }
                `}</style>
              </div>
              <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                Waiting for the Admin to start the Party...
              </Text>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Main Session View (ACTIVE / PAUSED) ──────────────────────────────────────
  return (
    <Layout style={{ minHeight: "100vh", background: "#0D0D1A" }}>

      {/* Header bar */}
      <Header
        style={{
          background: "rgba(13, 13, 26, 0.97)",
          borderBottom: "1px solid rgba(255, 45, 126, 0.20)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          height: 56,
        }}
      >
        {/* Left: Back to Dashboard + Leave Session */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => { clearSessionId(); router.push("/dashboard"); }}
            style={{ color: "#FFFFFF" }}
          >
            Back to Dashboard
          </Button>
          {!isAdmin && (
            <Tooltip title="Leave Session">
              <Button
                onClick={handleLeaveSession}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,80,80,0.4)",
                  borderRadius: 8,
                  color: "rgba(255,100,100,0.9)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "0 12px",
                }}
              >
                <span style={{ fontSize: 13 }}>Leave</span>
              </Button>
            </Tooltip>
          )}
        </div>

        {/* Center: Game PIN */}
        {gamePin && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>PIN</Text>
            <Text style={{ color: "#FF2D7E", fontWeight: 700, fontSize: 20, letterSpacing: "0.18em" }}>
              {gamePin}
            </Text>
          </div>
        )}

        {/* Right: playback controls + add song */}
        <div style={{ display: "flex", gap: 8 }}>
          {isAdmin && (
            <Tooltip title={queue.length === 0 ? "No songs in queue" : ""}>
              <Button
                type="primary"
                disabled={queue.length === 0}
                style={{ background: "#1DB954", borderColor: "#1DB954" }}
                onClick={() => {
                  apiService
                    .post(`/sessions/${sessionId}/songs/next`, {})
                    .catch(console.error);
                }}
              >
                Skip Song
              </Button>
            </Tooltip>
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setSearchDrawerOpen(true)}
          >
            Add Song
          </Button>
        </div>
      </Header>

      {/* Main content */}
      <Layout style={{ background: "transparent" }}>

        {/* Lyrics */}
        <Content style={{ display: "flex", justifyContent: "center", padding: "32px 16px", flex: 1 }}>
          <div style={{ width: "100%", maxWidth: 860 }}>
            {error && (
              <Alert
                type="error"
                description={error}
                closable
                style={{ marginBottom: 16, position: "absolute", top: 64, left: "50%", transform: "translateX(-50%)", zIndex: 99, minWidth: 400 }}
              />
            )}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 45, 126, 0.15)",
                borderRadius: 16,
                overflow: "hidden",
                height: "100%",
              }}
            >
              <LyricsDisplay
                currentSong={currentSong}
                isLoading={isLoading}
                fetchError={fetchError}
              />
            </div>
          </div>
        </Content>

        {/* Queue Sidebar */}
        <Layout.Sider
          width={320}
          style={{
            background: "#1A1A2E",
            borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
            padding: 24,
            overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ color: "#FFFFFF", fontWeight: 600, fontSize: 15 }}>
              Party Playlist <Badge count={displayQueue.length} style={{ backgroundColor: "#FF2D7E" }} />
            </Text>
          </div>

          {currentSong && (
            <div
              style={{
                background: "#0D0D1A",
                borderRadius: 8,
                border: "1px solid rgba(255, 45, 126, 0.4)",
                marginBottom: 8,
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              {currentSong.albumArt && (
                <Image src={currentSong.albumArt} alt="album art" width={40} height={40} style={{ borderRadius: 4, flexShrink: 0 }} />
              )}
              <div>
                <div style={{ color: "#FF2D7E", fontSize: 13, fontWeight: 600 }}>{currentSong.title}</div>
                <div style={{ color: "rgba(255, 45, 126, 0.6)", fontSize: 12 }}>{currentSong.artist}</div>
              </div>
            </div>
          )}

          {displayQueue.length === 0 ? (
            <Text style={{ color: "rgba(255,255,255,0.3)" }}>No songs yet</Text>
          ) : (
            displayQueue.map((song: Song) => (
              <div
                key={song.id}
                style={{
                  background: "#0D0D1A",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.08)",
                  marginBottom: 8,
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {song.albumArt && (
                  <Image src={song.albumArt} alt="album art" width={40} height={40} style={{ borderRadius: 4, flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#FFFFFF", fontSize: 13 }}>{song.title}</div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{song.artist}</div>
                </div>
                {isAdmin && (
                  <Tooltip title="Remove song">
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        setError("");
                        apiService
                          .delete(`/sessions/${sessionId}/songs/${song.id}`)
                          .catch((err: ApplicationError) => {
                            setError(err.message ?? "Could not remove song. Please try again.");
                          });
                      }}
                      style={{ color: "rgba(255,80,80,0.7)", flexShrink: 0 }}
                    />
                  </Tooltip>
                )}
              </div>
            ))
          )}
        </Layout.Sider>

      </Layout>

      {/* Song Search Drawer */}
      <SongSearchDrawer
        open={searchDrawerOpen}
        onClose={() => setSearchDrawerOpen(false)}
        onAddSong={() => setSearchDrawerOpen(false)}
        sessionId={sessionId}
      />

      <YouTubePlayer
        currentSong={currentSong}
        isAdmin={isAdmin}
        isActive={playerActivated}
        onTrackEnd={() => apiService.post(`/sessions/${sessionId}/songs/next`, {}).catch(console.error)}
      />

      <ReactionBar sessionId={sessionId} />

    </Layout>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useLyrics } from "@/hooks/useLyrics";
import { useSongQueue } from "@/hooks/useSongQueue";
import { useVotingRound } from "@/hooks/useVotingRound";
import { useApi } from "@/hooks/useApi";
import LyricsDisplay from "../../components/LyricsDisplay";
import VotingPhase from "../../components/VotingPhase";
import useLocalStorage from "@/hooks/useLocalStorage";
import SongSearchDrawer from "../../components/SongSearchDrawer";
import ReactionBar from "../../components/ReactionBar";
import { Song } from "@/types/song";
import { Session } from "@/types/session";
import { ApplicationError } from "@/types/error";
import YouTubePlayer from "../../components/YouTubePlayer";
import Image from "next/image";
import { Layout, Button, Typography, Tooltip, Badge, Alert } from "antd";
import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";

const { Header, Content } = Layout;
const { Text } = Typography;

export default function SessionPage() {
  const router = useRouter();
  const { sessionId } = useParams<{ sessionId: string }>();
  const apiService = useApi();
  const { value: userId } = useLocalStorage<string>("id", "");
  const { clear: clearSessionId } = useLocalStorage<string>("sessionId", "");

  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [gamePin, setGamePin] = useState<string>("");
  const [playerActivated, setPlayerActivated] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId || !userId) return;
    apiService.get<Session>(`/sessions/${sessionId}`).then((session) => {
      setIsAdmin(String(session.admin?.id) === String(userId));
      setGamePin(session.gamePin ?? "");
    }).catch(() => {/* silently ignore */});
  }, [apiService, sessionId, userId]);

  const {
    currentSong,
    isLoading,
    fetchError,
    refresh
  } = useLyrics(sessionId);

  const { queue } = useSongQueue(sessionId);
  const displayQueue = queue.filter((s: Song) => s.id !== currentSong?.id);

<<<<<<< 21-fe-show-live-vote-counts-per-song-during-voting
  const openRound = useVotingRound(sessionId);
=======
  const { openRound, clearRound } = useVotingRound(sessionId);

>>>>>>> dev
  // test data for voting phase UI development
  // const openRound = {
  //   id: 1,
  //   roundNumber: 1,
  //   status: "OPEN" as const,
  //   startedAt: new Date().toISOString(),
  //   endsAt: new Date(Date.now() + 30_000).toISOString(),
  //   candidates: [
  //     { id: 1, title: "Bohemian Rhapsody", artist: "Queen", currentVoteCount: 3, lyrics: null, spotifyId: null, geniusId: null, albumArt: null, durationMs: 0, performed: false, addedBy: { id: 1, username: "alice", status: "ONLINE" } },
  //     { id: 2, title: "Mr. Brightside", artist: "The Killers", currentVoteCount: 1, lyrics: null, spotifyId: null, geniusId: null, albumArt: null, durationMs: 0, performed: false, addedBy: { id: 2, username: "bob", status: "ONLINE" } },
  //   ],
  // };

  const handleLeaveSession = async () => {
    setError("");
    try {
      await apiService.delete(`/sessions/${sessionId}/participants/${userId}`);
      clearSessionId();
      router.push("/dashboard");
    } catch (err) {
      const status = (err as ApplicationError).status;
      if (status === 404) {
        clearSessionId();
        router.push("/dashboard");
      } else {
        setError("Could not leave the session. Please try again.");
      }
    }
  };

  if (openRound) {
<<<<<<< 21-fe-show-live-vote-counts-per-song-during-voting
    return (
      <VotingPhase
        sessionId={sessionId}
        round={openRound}
        onRoundClosed={() => {/* hook picks up the change automatically on next poll */}}
      />
    );
=======
    return <VotingPhase sessionId={sessionId} round={openRound} onRoundClosed={clearRound} />;
>>>>>>> dev
  }

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
        {/* Left: Back to Dashboard */}
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={isAdmin ? () => { clearSessionId(); router.push("/dashboard"); } : handleLeaveSession}
          style={{ color: "#FFFFFF" }}
        >
          Back to Dashboard
        </Button>

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
          {isAdmin && !playerActivated && (
            <Tooltip title={queue.length === 0 ? "No songs in queue" : ""}>
              <Button
                type="primary"
                disabled={queue.length === 0}
                style={{ background: "#1DB954", borderColor: "#1DB954" }}
                onClick={() => {
                  setPlayerActivated(true);
                  refresh();
                }}
              >
                Play Now
              </Button>
            </Tooltip>
          )}
          {isAdmin && playerActivated && (
            <Tooltip title={displayQueue.length === 0 ? "No songs in queue" : ""}>
              <Button
                type="primary"
                style={{ background: "#1DB954", borderColor: "#1DB954" }}
                disabled={displayQueue.length === 0}
                onClick={() => {
                  apiService
                    .post(`/sessions/${sessionId}/songs/next`, {})
                    .catch(console.error);
                }}
              >
                Skip
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
                <div>
                  <div style={{ color: "#FFFFFF", fontSize: 13 }}>{song.title}</div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{song.artist}</div>
                </div>
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

// This page wires useLyrics (data) -> LyricsDisplay (render).
// All participants navigate to this same URL for the same sessionId,
// subscribe to the same WebSocket topics
// current song and lyrics — satisfying "all participants see the same
// lyrics view" from the issue requirements.


"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {Layout, Button, Typography, Tooltip, Badge, message, Progress} from "antd";
import { ArrowLeftOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useLyrics } from "@/hooks/useLyrics";
import { useSongQueue } from "@/hooks/useSongQueue";
import LyricsDisplay from "../../components/LyricsDisplay";
import useLocalStorage from "@/hooks/useLocalStorage";
import SongSearchDrawer from "../../components/SongSearchDrawer";
// import { StompProvider } from "@/context/StompContext";
import ReactionBar from "../../components/ReactionBar";
import { Song } from "@/types/song";
import { useApi } from "@/hooks/useApi";
import { Session } from "@/types/session";
import { useSpotifyPlayerContext } from "@/context/SpotifyPlayerContext";
import { useSpotifyPlayback } from "@/hooks/useSpotifyPlayback";


const { Header, Content } = Layout;
const { Text } = Typography;

export default function SessionPage() {
  // Redirect to "/" if no token in localStorage
  // const { isAuthenticated } = useAuth();

  // const params  = useParams();
  const router  = useRouter();
  const apiService = useApi();

  const { value: sessionId } = useLocalStorage<string>("sessionId", "");
  const { value: userId } = useLocalStorage<string>("id", "");

  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [gamePin, setGamePin] = useState<string>("");

  useEffect(() => {
    if (!sessionId || !userId) return;
    apiService.get<Session>(`/sessions/${sessionId}`).then((session) => {
      setIsAdmin(String(session.admin?.id) === String(userId));
      setGamePin(session.gamePin ?? "");
    }).catch(() => {/* silently ignore */});
  }, [apiService, sessionId, userId]);

  // All lyrics state comes from the hook — this page stays thin
  const {
    currentSong,
    isLoading,
    lyricsNotAvailable,
    noSongPlaying,
    fetchError,
    refresh,
  } = useLyrics(sessionId);

  const { queue } = useSongQueue(sessionId);

  // Do not render anything while useAuth is redirecting
  // if (!isAuthenticated) return null;


  const [playerActivated, setPlayerActivated] = useState(false);

  const { accessToken, deviceId, player } = useSpotifyPlayerContext();
  useSpotifyPlayback({
      sessionId,
      currentSong,
      deviceId,
      accessToken,
      player,
      isAdmin: isAdmin && playerActivated,
  });

  const [localProgress, setLocalProgress] = useState(0);

    useEffect(() => {
        if (!currentSong) return;
        setLocalProgress(0);
        const duration = currentSong.durationMs ?? 0;
        if (!duration) return;

        const interval = setInterval(() => {
            setLocalProgress(prev => {
                const next = prev + (100 / (duration / 1000));
                return next >= 100 ? 100 : next;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [currentSong?.id]);

  const handleLeaveSession = async () => {
    try {
      await apiService.delete(`/sessions/${sessionId}/participants/${userId}`);
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to leave session:", err);
      message.error("Could not leave the session. Please try again.");
    }
  };

  const handleAddSong = () => {
        // refreshQueue();
        setSearchDrawerOpen(false);
    };

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
        {/* Admin: show game pin | Participant: leave button */}
        {isAdmin && gamePin ? (
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
        ) : (!isAdmin && userId && (
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleLeaveSession}
            style={{ color: "rgba(255,255,255,0.65)", fontSize: 14 }}
          >
            Leave Session
          </Button>
        ))}

        {/* Live indicator */}
        <Text
          style={{
            color: "#FF2D7E",
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: "0.08em",
          }}
        >
          🎤 LIVE
        </Text>

        {/* Manual refresh button — picks up the new song immediately
            instead of waiting for the next 5-second poll tick */}
        <div style={{ display: "flex", gap: 8 }}>
          {isAdmin && !playerActivated && deviceId && (
            <Button
              type="primary"
              style={{ background: "#1DB954", borderColor: "#1DB954" }}
              onClick={() => {
                // activateElement() resumes the SDK's AudioContext synchronously
                // within this user gesture, satisfying Safari's autoplay policy.
                // Must be called before playback starts, not after.
                player?.activateElement();
                setPlayerActivated(true);
                refresh();
              }}
            >
              Play Now
            </Button>
          )}
          <Tooltip title="Refresh current song">
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={refresh}
              style={{ color: "rgba(255,255,255,0.65)" }}
            />
          </Tooltip>
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
        <Layout style={{ background: "transparent", paddingBottom: 80 }}>

            {/* Song Info + Progress  */}
            {currentSong && (
                <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <div>
                            <Text style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 16 }}>
                                {currentSong.title}
                            </Text>
                            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginLeft: 8 }}>
                                {currentSong.artist}
                            </Text>
                        </div>
                    </div>
                    <Progress
                        percent={Math.round(localProgress)}
                        showInfo={false}
                        strokeColor="#1DB954"
                        railColor="rgba(255,255,255,0.1)"
                    />
                </div>
            )}


            {/* Lyrics */}
            <Content style={{ display: "flex", justifyContent: "center", padding: "32px 16px" }}>
                <div style={{ width: "100%", maxWidth: 780 }}>
                    <div
                        style={{
                            background: "rgba(255, 255, 255, 0.04)",
                            border: "1px solid rgba(255, 45, 126, 0.15)",
                            borderRadius: 16,
                            overflow: "hidden",
                            minHeight: 500,
                        }}
                    >
                        <LyricsDisplay
                            currentSong={currentSong}
                            isLoading={isLoading}
                            lyricsNotAvailable={lyricsNotAvailable}
                            noSongPlaying={noSongPlaying}
                            fetchError={fetchError}
                        />
                    </div>

                    {!isLoading && !fetchError && (
                        <div style={{ textAlign: "center", marginTop: 12 }}>
                            <Text style={{ color: "rgba(255,255,255,0.22)", fontSize: 12 }}>
                                Updates automatically · Session {sessionId}
                            </Text>
                        </div>
                    )}
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
                        Party Playlist <Badge count={queue.length} style={{ backgroundColor: "#FF2D7E" }} />
                    </Text>
                </div>

                {queue.length === 0 ? (
                    <Text style={{ color: "rgba(255,255,255,0.3)" }}>No songs yet</Text>
                ) : (
                    queue.map((song: Song) => (
                        <div
                            key={song.id}
                            style={{
                                background: "#0D0D1A",
                                borderRadius: 8,
                                border: "1px solid rgba(255,255,255,0.08)",
                                marginBottom: 8,
                                padding: "10px 12px",
                            }}
                        >
                            <div style={{ color: "#FFFFFF", fontSize: 13 }}>{song.title}</div>
                            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                                {song.artist}
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
        onAddSong={handleAddSong}
        sessionId={sessionId}
      />

      <ReactionBar sessionId={sessionId} />

    </Layout>
  );
}
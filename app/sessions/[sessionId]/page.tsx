"use client";

import { useState, useEffect, useCallback } from "react";
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
import WaitingLobby from "../../components/WaitingLobby";
import SessionSidebar from "../../components/SessionSidebar";
import { Layout, Button, Typography, Tooltip, Badge, Alert, Spin, Space, Popconfirm, Modal, Descriptions } from "antd";
import { ArrowLeftOutlined, PauseCircleOutlined, PlayCircleOutlined, PoweroffOutlined, InfoCircleOutlined } from "@ant-design/icons";

const { Header, Content } = Layout;
const { Text } = Typography;

export default function SessionPage() {
  const router = useRouter();
  const { sessionId } = useParams<{ sessionId: string }>();
  const apiService = useApi();
  const { value: userId } = useLocalStorage<string>("id", "");
  const { clear: clearSessionId } = useLocalStorage<string>("sessionId", "");

  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [error, setError] = useState("");
  const [startingSession, setStartingSession] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);

  const { status, isAdmin, gamePin, sessionName, sessionDescription, participants, isLoading: sessionLoading } =
    useSessionStatus(sessionId, userId);

  useEffect(() => {
    if (!sessionLoading && status === "ENDED") {
      clearSessionId();
      router.replace(`/sessions/${sessionId}/review`);
    }
  }, [status, sessionLoading, sessionId, router, clearSessionId]);

  const handlePauseResume = async () => {
    const newStatus = status === "PAUSED" ? "ACTIVE" : "PAUSED";
    try {
      await apiService.put(`/sessions/${sessionId}`, { status: newStatus });
    } catch {
      setError("Could not update session status. Please try again.");
    }
  };

  const handleEndSession = async () => {
    try {
      await apiService.put(`/sessions/${sessionId}`, { status: "ENDED" });
      clearSessionId();
      router.push(`/sessions/${sessionId}/review`);
    } catch {
      setError("Could not end the session. Please try again.");
    }
  };

  const { currentSong, isLoading, fetchError, refresh } = useLyrics(sessionId);
  const { queue } = useSongQueue(sessionId);
  const displayQueue = queue.filter((s: Song) => s.id !== currentSong?.id);
  const { openRound, clearRound } = useVotingRound(sessionId);

const handleBackToDashboard = async () => {
    if (isAdmin && status === "ACTIVE") {
      try {
        await apiService.put(`/sessions/${sessionId}`, { status: "PAUSED" });
      } catch {
        // navigate anyway even if pause fails
      }
    }
    clearSessionId();
    router.push("/dashboard");
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

  const handleRoundClosed = useCallback(() => {
    clearRound();
    refresh();
  }, [clearRound, refresh]);

  if (openRound) {
    return (
      <VotingPhase sessionId={sessionId} round={openRound} onRoundClosed={handleRoundClosed} currentSong={currentSong} />
    );
  }

  // ── Loading state ────────────────────────────────────────────────────────────
  if (sessionLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0D0D1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  // ── Waiting Lobby (status === "CREATED") ─────────────────────────────────────
  if (status === "CREATED") {
    return (
      <WaitingLobby
        sessionName={sessionName}
        sessionDescription={sessionDescription}
        gamePin={gamePin}
        participants={participants}
        isAdmin={isAdmin}
        error={error}
        startingSession={startingSession}
        onStart={handleStartSession}
        onBack={handleBackToDashboard}
      />
    );
  }

  // ── Main Session View (ACTIVE / PAUSED) ──────────────────────────────────────
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
          position: "sticky",
          top: 0,
          zIndex: 100,
          height: 56,
        }}
      >
        {/* Left: Back + Leave */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBackToDashboard}
            style={{ color: "#FFFFFF" }}
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Center: session name + info modal */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Text style={{ color: "#FF2D7E", fontWeight: 600, fontSize: 16 }}>
            {sessionName || "Karaoke Session"}
          </Text>
          <Tooltip title="Session details">
            <Button
              type="text"
              icon={<InfoCircleOutlined />}
              size="small"
              style={{ color: "rgba(255,255,255,0.45)" }}
              onClick={() => setSessionModalOpen(true)}
            />
          </Tooltip>
        </div>

        <Modal
          title={<span style={{ color: "#FF2D7E", fontSize: 20 }}>Session Details</span>}
          open={sessionModalOpen}
          onCancel={() => setSessionModalOpen(false)}
          footer={null}
          width={600}
          closeIcon={<span style={{ color: "#FF2D7E", fontSize: 16 }}>✕</span>}
          styles={{
            wrapper: { background: "transparent" },
            container: { background: "#1A1A2E", padding: 0 },
            header: { background: "#1A1A2E", borderBottom: "1px solid rgba(255,45,126,0.2)", padding: "16px 24px", marginBottom: 0 },
            body: { background: "#1A1A2E", padding: "24px" },
          }}

>
          <Descriptions
            bordered
            column={1}
            size="middle"
            labelStyle={{ background: "#0D0D1A", color: "rgba(255,255,255,0.85)", fontWeight: 600, width: "30%" }}
            contentStyle={{ background: "#1A1A2E", color: "#FFFFFF" }}
            style={{ background: "#1A1A2E" }}
          >
            <Descriptions.Item label="Name">{sessionName}</Descriptions.Item>
            <Descriptions.Item label="Description">{sessionDescription || "—"}</Descriptions.Item>
            <Descriptions.Item label="PIN">
              <Text copyable style={{ color: "#00C2FF", fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>
                {gamePin}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Badge
                status={status === "ACTIVE" ? "processing" : "warning"}
                text={<Text style={{ color: "#FFFFFF", fontSize: 14 }}>{status === "ACTIVE" ? "Live" : "Paused"}</Text>}
              />
            </Descriptions.Item>
          </Descriptions>
        </Modal>

        {/* Right: controls */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {!isAdmin && (status === "ACTIVE" || status === "PAUSED") && (
            <Badge
              status={status === "ACTIVE" ? "processing" : "warning"}
              text={
                <Text style={{ color: "#FFFFFF", fontSize: 12 }}>
                  {status === "ACTIVE" ? "Live" : "Paused"}
                </Text>
              }
            />
          )}
          {isAdmin && (
            <Space size={8}>
              <Tooltip title={status === "PAUSED" ? "Resume Session" : "Pause Session"}>
                <Button
                  type="text"
                  icon={status === "PAUSED" ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
                  onClick={handlePauseResume}
                  className="session-control-btn"
                  style={{ color: "#FFFFFF", fontSize: 20 }}
                />
              </Tooltip>
              <Popconfirm
                title="End Session"
                description="Are you sure you want to end this session?"
                onConfirm={handleEndSession}
                okText="Yes"
                cancelText="No"
                styles={{ root: { backgroundColor: "#1A1A2E", border: "1px solid rgba(255,45,126,0.3)", borderRadius: 8 }, container: { backgroundColor: "#1A1A2E", borderRadius: 8 } }}
              >
                <Tooltip title="End Session">
                  <Button type="text" danger icon={<PoweroffOutlined />} style={{ fontSize: 20 }} />
                </Tooltip>
              </Popconfirm>
            </Space>
          )}
        </div>
      </Header>

      <Layout style={{ background: "transparent", height: "calc(100vh - 56px)", overflow: "hidden" }}>
        <Content style={{ display: "flex", justifyContent: "center", padding: "32px 16px", flex: 1, overflowY: "auto" }}>
          <div style={{ width: "100%", maxWidth: 860 }}>
            {error && (
              <Alert type="error" description={error} closable style={{ position: "absolute", top: 64, left: "50%", transform: "translateX(-50%)", zIndex: 99, minWidth: 400, background: "#391b2c" }} />
            )}
            <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 45, 126, 0.15)", borderRadius: 16, overflow: "hidden", height: "100%" }}>
              <LyricsDisplay currentSong={currentSong} isLoading={isLoading} fetchError={fetchError} />
            </div>
          </div>
        </Content>

        <SessionSidebar
          queue={displayQueue}
          currentSong={currentSong}
          participants={participants}
          isAdmin={isAdmin}
          userId={userId}
          onAddSong={() => setSearchDrawerOpen(true)}
          onDeleteSong={(songId) => {
            setError("");
            apiService.delete(`/sessions/${sessionId}/songs/${songId}`)
              .catch((err: ApplicationError) => {
                setError(err.message ?? "Could not remove song. Please try again.");
              });
          }}
          onSkipSong={() => apiService.post(`/sessions/${sessionId}/songs/next`, {}).catch(console.error)}
        />
      </Layout>

      <SongSearchDrawer
        open={searchDrawerOpen}
        onClose={() => setSearchDrawerOpen(false)}
        onAddSong={() => setSearchDrawerOpen(false)}
        sessionId={sessionId}
      />

      <YouTubePlayer
        currentSong={currentSong}
        isAdmin={isAdmin}
        isActive={status === "ACTIVE" || status === "PAUSED"}
        isPaused={status === "PAUSED"}
        onTrackEnd={() => apiService.post(`/sessions/${sessionId}/songs/next`, {}).catch(console.error)}
      />

      <ReactionBar sessionId={sessionId} />

    </Layout>
  );
}

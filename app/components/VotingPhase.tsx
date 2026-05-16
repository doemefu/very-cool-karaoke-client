"use client";

import { useState, useEffect } from "react";
import { Alert, Badge, Button, Card, Progress, Typography } from "antd";
import { TrophyOutlined } from "@ant-design/icons";
import { useApi } from "@/hooks/useApi";
import { VotingRound } from "@/types/voting";
import { Song } from "@/types/song";
import Image from "next/image";

const { Title, Text } = Typography;

const WINNER_DISPLAY_MS = 4_000;

interface VotingPhaseProps {
  sessionId: string;
  round: VotingRound;
  onRoundClosed: () => void;
  currentSong: Song | null;
}

export default function VotingPhase({
  sessionId,
  round,
  onRoundClosed,
  currentSong,
}: VotingPhaseProps) {
  const apiService = useApi();

  const [candidates, setCandidates] = useState<Song[]>(round.candidates);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedSongId, setVotedSongId] = useState<number | null>(null);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [totalSeconds, setTotalSeconds] = useState<number | null>(null);
  const [showWinner, setShowWinner] = useState(round.status === "CLOSED");

  // Keep live vote bars in sync with incoming updates from the hook.
  useEffect(() => {
    setCandidates(round.candidates);
  }, [round.candidates]);

  // Show winner screen when round closes.
  useEffect(() => {
    if (round.status !== "CLOSED") return;
    setShowWinner(true);
    const id = setTimeout(() => onRoundClosed(), WINNER_DISPLAY_MS);
    return () => clearTimeout(id);
  }, [round.status, round.id, onRoundClosed]);

  // Countdown timer
  useEffect(() => {
    if (!round.endsAt) return;
    const total = Math.max(0, Math.floor((new Date(round.endsAt).getTime() - new Date(round.startedAt).getTime()) / 1000));
    setTotalSeconds(total);
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(round.endsAt!).getTime() - Date.now()) / 1000));
      setSecondsLeft(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [round.endsAt, round.startedAt]);


  const handleVote = async (song: Song) => {
    setVoting(true);
    try {
      await apiService.post(
        `/sessions/${sessionId}/votingRounds/${round.id}/votes`,
        { songId: song.id }
      );
      setHasVoted(true);
      setVotedSongId(song.id);
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 409) {
        // already voted — treat as success
        setHasVoted(true);
        setVotedSongId(song.id);
      } else if (status === 410) {
        setShowWinner(true);
        setTimeout(() => onRoundClosed(), WINNER_DISPLAY_MS);
      } else {
        setError("Could not cast vote. Please try again.");
      }
    } finally {
      setVoting(false);
    }
  };

  const maxVotes = Math.max(...candidates.map((s) => s.currentVoteCount ?? 0), 1);
  const timerPercent = secondsLeft !== null && totalSeconds ? (secondsLeft / totalSeconds) * 100 : 0;
  const timerColor = secondsLeft !== null && secondsLeft <= 10 ? "#FF2D7E" : "#00C2FF";
  const sortedCandidates = [...candidates].sort((a, b) => (b.currentVoteCount ?? 0) - (a.currentVoteCount ?? 0));

  // Winner screen
  if (showWinner) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(13, 13, 26, 0.98)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 24,
        }}
      >
        <Text style={{ color: "#FFD700", fontSize: 18, letterSpacing: "0.15em", marginBottom: 16 }}>
          🏆 WINNER
        </Text>
        <Title level={1} style={{ color: "#FFFFFF", textAlign: "center", marginBottom: 24 }}>
          Next up...
        </Title>

        {currentSong && (
          <div
            style={{
              background: "linear-gradient(135deg, #FF2D7E 0%, #C91F5E 100%)",
              borderRadius: 16,
              padding: 32,
              textAlign: "center",
              maxWidth: 400,
              width: "100%",
              boxShadow: "0 0 60px rgba(255, 45, 126, 0.4)",
            }}
          >
            {currentSong.albumArt && (
              <Image
                src={currentSong.albumArt}
                alt="album art"
                width={120}
                height={120}
                style={{ borderRadius: 8, marginBottom: 16 }}
              />
            )}
            <Title level={2} style={{ color: "#FFFFFF", margin: 0 }}>
              {currentSong.title}
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 16 }}>
              {currentSong.artist}
            </Text>
            {currentSong.addedBy && (
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, display: "block", marginTop: 12 }}>
                🎤 {currentSong.addedBy.username}
              </Text>
            )}
            <div style={{ marginTop: 8 }}>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
                {currentSong.currentVoteCount ?? 0} votes
              </Text>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13, 13, 26, 0.98)",
        overflow: "auto",
        padding: 24,
        zIndex: 1000,
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Title level={1} style={{ color: "#FFFFFF", marginBottom: 16 }}>
            Vote for the next song! ⚡
          </Title>

          {secondsLeft !== null && (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <Progress
                type="circle"
                percent={timerPercent}
                format={() => `${secondsLeft}s`}
                strokeColor={timerColor}
                railColor="rgba(255, 255, 255, 0.1)"
                size={80}
              />
            </div>
          )}

          {hasVoted && (
            <Text style={{ color: "rgba(255,255,255,0.45)", display: "block", marginTop: 12 }}>
              Your vote has been cast!
            </Text>
          )}
          {error && (
            <Alert type="error" title={error} showIcon closable style={{ marginTop: 16, maxWidth: 560, margin: "16px auto 0" }} />
          )}
        </div>

        {/* Content: Song Cards + Leaderboard */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>

          {/* Song Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, alignContent: "start" }}>
            {candidates.map((song) => {
              const isVoted = votedSongId === song.id;
              const votePercentage = ((song.currentVoteCount ?? 0) / maxVotes) * 100;

              return (
                <div
                  key={song.id}
                  style={{
                    background: isVoted
                      ? "linear-gradient(135deg, #FF2D7E 0%, #C91F5E 100%)"
                      : "#1A1A2E",
                    border: isVoted ? "2px solid #FF2D7E" : "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    padding: 16,
                  }}
                >
                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ color: "#FFFFFF", fontSize: 16, display: "block", marginBottom: 4 }}>
                      {song.title}
                    </Text>
                    <Text style={{ color: "rgba(255,255,255,0.65)" }}>{song.artist}</Text>
                    {song.addedBy && (
                      <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>🎤 {song.addedBy.username}</Text>
                    )}
                  </div>

                  <Progress
                    percent={votePercentage}
                    showInfo={false}
                    strokeColor="#00C2FF"
                    railColor="rgba(255,255,255,0.1)"
                    style={{ marginBottom: 12 }}
                  />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ color: "#FFFFFF" }}>{song.currentVoteCount ?? 0} votes</Text>
                    {isVoted && (
                      <span style={{ color: "#FFFFFF", fontWeight: 600, fontSize: 14 }}>✓ Voted</span>
                    )}
                    {!hasVoted && (
                      <Button type="primary" loading={voting} onClick={() => handleVote(song)}>
                        Vote
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Leaderboard */}
          <Card
            title={
              <span style={{ color: "#FFFFFF", fontSize: 18 }}>
                <TrophyOutlined style={{ marginRight: 8, color: "#FFD700" }} />
                Live Leaderboard
              </span>
            }
            style={{ height: "fit-content", position: "sticky", top: 24, background: "#1A1A2E", border: "1px solid rgba(255,255,255,0.08)" }}
            styles={{ header: { background: "#1A1A2E", borderBottom: "1px solid rgba(255,255,255,0.08)" } }}
          >
            <div>
              {sortedCandidates.map((song, index) => (
                <div key={song.id} style={{ borderBottom: index < sortedCandidates.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none", padding: "12px 0", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                    background: index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : index === 2 ? "#CD7F32" : "#2A2A3E",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: "bold", color: index < 3 ? "#000000" : "#FFFFFF", fontSize: 14,
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{ color: "#FFFFFF", display: "block", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {song.title}
                    </Text>
                    <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{song.artist}</Text>
                  </div>
                  <Badge count={song.currentVoteCount ?? 0} showZero style={{ backgroundColor: index === 0 ? "#FF2D7E" : "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}

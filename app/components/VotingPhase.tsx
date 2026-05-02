"use client";

import { useState, useEffect } from "react";
import { Alert, Button, Progress, Typography } from "antd";
import { useApi } from "@/hooks/useApi";
import { useStomp } from "@/context/StompContext";
import { VotingRound } from "@/types/voting";
import { Song } from "@/types/song";
import Image from "next/image";

const { Title, Text } = Typography;

const WINNER_DISPLAY_MS = 4_000;

interface VotingPhaseProps {
  sessionId: string;
  round: VotingRound;
  onRoundClosed: () => void;
}

export default function VotingPhase({
  sessionId,
  round,
  onRoundClosed,
}: VotingPhaseProps) {
  const apiService = useApi();
  const stompClient = useStomp();

  const [candidates, setCandidates] = useState<Song[]>(round.candidates);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedSongId, setVotedSongId] = useState<number | null>(null);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [totalSeconds, setTotalSeconds] = useState<number | null>(null);
  const [winner, setWinner] = useState<Song | null>(() =>
    round.status === "CLOSED" ? (round.candidates[0] ?? null) : null
  );

  // If round is already closed on mount, auto-transition after display time
  useEffect(() => {
    if (round.status !== "CLOSED") return;
    const id = setTimeout(() => onRoundClosed(), WINNER_DISPLAY_MS);
    return () => clearTimeout(id);
  }, [round.status, onRoundClosed]);

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

  // WebSocket subscription for live vote count updates and round close detection
  useEffect(() => {
    if (!stompClient) return;

    let sub = { unsubscribe: () => {} };

    const doSubscribe = () => {
      sub = stompClient.subscribe(
        `/topic/sessions/${sessionId}/votingRound`,
        (msg) => {
          try {
            const updated: VotingRound = JSON.parse(msg.body);
            if (updated.id !== round.id) return;
            setCandidates(updated.candidates);
            if (updated.status === "CLOSED") {
              setWinner(updated.candidates[0] ?? null);
              setTimeout(() => onRoundClosed(), WINNER_DISPLAY_MS);
            }
          } catch {
            console.error("Failed to parse votingRound message:", msg.body);
          }
        }
      );
    };

    if (stompClient.connected) {
      doSubscribe();
    } else {
      stompClient.onConnect = () => doSubscribe();
    }

    return () => sub.unsubscribe();
  }, [sessionId, round.id, stompClient, onRoundClosed]);

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
        onRoundClosed();
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

  // Winner screen
  if (winner) {
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
          {winner.albumArt && (
            <Image
              src={winner.albumArt}
              alt="album art"
              width={120}
              height={120}
              style={{ borderRadius: 8, marginBottom: 16 }}
            />
          )}
          <Title level={2} style={{ color: "#FFFFFF", margin: 0 }}>
            {winner.title}
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 16 }}>
            {winner.artist}
          </Text>
          <div style={{ marginTop: 16 }}>
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
              {winner.currentVoteCount ?? 0} votes
            </Text>
          </div>
        </div>
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
            <Alert type="error" title={error} showIcon style={{ marginTop: 16, maxWidth: 560, margin: "16px auto 0" }} />
          )}
        </div>

        {/* Song Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
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
                  <Button
                    type={isVoted ? "default" : "primary"}
                    disabled={hasVoted || voting}
                    onClick={() => handleVote(song)}
                  >
                    {isVoted ? "Voted" : "Vote"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

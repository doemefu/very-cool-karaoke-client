"use client";

import { useState, useEffect, useCallback } from "react";
import { Alert, Button, Progress, Typography } from "antd";
import { useApi } from "@/hooks/useApi";
import { VotingRound } from "@/types/voting";
import { Song } from "@/types/song";

const { Title, Text } = Typography;

const POLL_INTERVAL_MS = 3_000;

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
  const [candidates, setCandidates] = useState<Song[]>(round.candidates);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedSongId, setVotedSongId] = useState<number | null>(null);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [totalSeconds, setTotalSeconds] = useState<number | null>(null);

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

  // Poll the round to keep vote counts up to date
  const fetchRound = useCallback(async () => {
    try {
      const updated = await apiService.get<VotingRound>(
        `/sessions/${sessionId}/votingRounds/${round.id}`
      );
      setCandidates(updated.candidates);
      if (updated.status === "CLOSED") {
        onRoundClosed();
      }
    } catch {
      // silently ignore poll errors
    }
  }, [sessionId, round.id, apiService, onRoundClosed]);

  useEffect(() => {
    const id = setInterval(fetchRound, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchRound]);

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
                trailColor="rgba(255, 255, 255, 0.1)"
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
            <Alert type="error" message={error} showIcon style={{ marginTop: 16, maxWidth: 560, margin: "16px auto 0" }} />
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
                  trailColor="rgba(255,255,255,0.1)"
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

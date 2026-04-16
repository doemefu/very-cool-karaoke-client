"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Typography, message } from "antd";
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
        // already voted — treat as success
        setHasVoted(true);
        setVotedSongId(song.id);
      } else if (status === 410) {
        message.info("Voting round already closed.");
        onRoundClosed();
      } else {
        message.error("Could not cast vote. Please try again.");
      }
    } finally {
      setVoting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0D0D1A",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
      }}
    >
      <Title style={{ color: "#FF2D7E", marginBottom: 8 }}>Vote for the next song</Title>
      <Text style={{ color: "rgba(255,255,255,0.45)", marginBottom: 40, display: "block" }}>
        {hasVoted ? "Your vote has been cast!" : "Pick one — buttons lock after voting."}
      </Text>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: "100%",
          maxWidth: 560,
        }}
      >
        {candidates.map((song) => {
          const isVoted = votedSongId === song.id;
          return (
            <div
              key={song.id}
              style={{
                background: isVoted ? "rgba(255, 45, 126, 0.12)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${isVoted ? "#FF2D7E" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 12,
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ color: "#FFFFFF", fontWeight: 600, fontSize: 15 }}>
                  {song.title}
                </div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
                  {song.artist}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Text style={{ color: "#00C2FF", fontWeight: 700, fontSize: 18, minWidth: 32, textAlign: "right" }}>
                  {song.currentVoteCount}
                </Text>
                <Button
                  type="primary"
                  disabled={hasVoted || voting}
                  onClick={() => handleVote(song)}
                  style={
                    isVoted
                      ? { background: "#FF2D7E", borderColor: "#FF2D7E" }
                      : {}
                  }
                >
                  {isVoted ? "Voted" : "Vote"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

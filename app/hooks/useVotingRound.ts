import { useState, useEffect, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { VotingRound } from "@/types/voting";

const POLL_INTERVAL_MS = 3_000;

export const useVotingRound = (sessionId: string): VotingRound | null => {
  const apiService = useApi();
  const [openRound, setOpenRound] = useState<VotingRound | null>(null);

  const fetchRounds = useCallback(async () => {
    if (!sessionId) return;
    try {
      const rounds = await apiService.get<VotingRound[]>(
        `/sessions/${sessionId}/votingRounds`
      );
      const open = rounds.find((r) => r.status === "OPEN") ?? null;
      setOpenRound(open);
    } catch {
      // silently ignore — session page handles its own errors
    }
  }, [sessionId, apiService]);

  useEffect(() => {
    if (!sessionId) return;
    fetchRounds();
    const id = setInterval(fetchRounds, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [sessionId, fetchRounds]);

  return openRound;
};

import { useState, useEffect, useCallback } from "react";
import { useStomp } from "@/context/StompContext";
import { useApi } from "@/hooks/useApi";
import { VotingRound } from "@/types/voting";

export const useVotingRound = (sessionId: string): { openRound: VotingRound | null; clearRound: () => void } => {
  const { client, connected } = useStomp();
  const apiService = useApi();
  const [openRound, setOpenRound] = useState<VotingRound | null>(null);

  const clearRound = useCallback(() => setOpenRound(null), []);

  // REST fetch on mount and on reconnect: check if there is already an active voting round
  // (handles joining mid-session or WebSocket reconnections where the broadcast was missed)
  useEffect(() => {
    if (!sessionId || !connected) return;
    apiService
      .get<VotingRound[]>(`/sessions/${sessionId}/votingRounds`)
      .then((rounds) => {
        if (!Array.isArray(rounds) || rounds.length === 0) return;
        const active = rounds.find((r) => r.status === "OPEN") ?? null;
        setOpenRound((prev) => active ?? prev);
      })
      .catch((err) => {
        console.error("Failed to fetch voting rounds:", err);
      });
  }, [sessionId, connected, apiService]);

  // WebSocket subscription for live voting round updates
  useEffect(() => {
    if (!sessionId || !client || !connected) return;

    const subscription = client.subscribe(
      `/topic/sessions/${sessionId}/votingRound`,
      (frame) => {
        try {
          const round: VotingRound = JSON.parse(frame.body);
          setOpenRound(round);
        } catch (e) {
          console.error("Failed to parse votingRound update:", e);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [sessionId, client, connected]);

  return { openRound, clearRound };
};

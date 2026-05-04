import { useState, useEffect, useCallback } from "react";
import { useStomp } from "@/context/StompContext";
import { VotingRound } from "@/types/voting";

export const useVotingRound = (sessionId: string): { openRound: VotingRound | null; clearRound: () => void } => {
  const { client, connected } = useStomp();
  const [openRound, setOpenRound] = useState<VotingRound | null>(null);

  const clearRound = useCallback(() => setOpenRound(null), []);

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

import { useState, useEffect } from "react";
import { VotingRound } from "@/types/voting";
import { useStomp } from "@/context/StompContext";

export const useVotingRound = (sessionId: string): VotingRound | null => {
  const stompClient = useStomp();
  const [openRound, setOpenRound] = useState<VotingRound | null>(null);

  useEffect(() => {
    if (!sessionId || !stompClient) return;

    let sub = { unsubscribe: () => {} };

    const doSubscribe = () => {
      sub = stompClient.subscribe(
        `/topic/sessions/${sessionId}/votingRound`,
        (msg) => {
          try {
            const round: VotingRound = JSON.parse(msg.body);
            if (round.status === "OPEN") {
              setOpenRound(round);
            } else {
              // CLOSED — VotingPhase handles the winner screen, then clears
              setOpenRound((prev) => prev ? { ...prev, status: "CLOSED", candidates: round.candidates } : null);
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
  }, [sessionId, stompClient]);

  return openRound;
};

import { useState, useEffect, useCallback } from "react";
import { useStomp } from "@/context/StompContext";
import { VotingRound } from "@/types/voting";

export const useVotingRound = (sessionId: string): { openRound: VotingRound | null; clearRound: () => void } => {
  const stompClient = useStomp();
  const [openRound, setOpenRound] = useState<VotingRound | null>(null);

  const clearRound = useCallback(() => setOpenRound(null), []);

  useEffect(() => {
    if (!sessionId || !stompClient) return;

    const subscribe = () => {
      return stompClient.subscribe(
        `/topic/sessions/${sessionId}/votingRound`,
        (frame) => {
          try {
            const round: VotingRound = JSON.parse(frame.body);
            if (round.status === "OPEN") setOpenRound(round);
          } catch (e) {
            console.error("Failed to parse votingRound update:", e);
          }
        }
      );
    };

    let subscription: ReturnType<typeof stompClient.subscribe> | null = null;
    let unmounted = false;

    if (stompClient.connected) {
      subscription = subscribe();

      return () => {
        unmounted = true;
        subscription?.unsubscribe();
      };
    } else {
      const prevOnConnect = stompClient.onConnect;
      stompClient.onConnect = (frame) => {
        prevOnConnect?.(frame);
        if (!unmounted) {
          subscription = subscribe();
        }
      };

      return () => {
        unmounted = true;
        stompClient.onConnect = prevOnConnect;
        subscription?.unsubscribe();
      };
    }
  }, [sessionId, stompClient]);

  return { openRound, clearRound };
};

import { useEffect, useRef, useCallback } from "react";
import { useStomp } from "@/context/StompContext";
import { useApi } from "@/hooks/useApi";
import { ReactionType, Reaction } from "@/types/reaction";

interface UseReactionsOptions {
  sessionId: string;
  onReaction: (reaction: Reaction) => void;
}

export function useReactions({ sessionId, onReaction }: UseReactionsOptions) {
  const client = useStomp();
  const apiService = useApi();

  const onReactionRef = useRef(onReaction);
  useEffect(() => { onReactionRef.current = onReaction; }, [onReaction]);

  useEffect(() => {
    if (!sessionId || !client) return;

    let sub: { unsubscribe: () => void } = { unsubscribe: () => {} };

    const doSubscribe = () => {
      sub = client.subscribe(
        `/topic/sessions/${sessionId}/reactions`,
        (msg) => {
          try {
            const reaction: Reaction = JSON.parse(msg.body);
            onReactionRef.current(reaction);
          } catch {
            console.error("Failed to parse reaction:", msg.body);
          }
        }
      );
    };

    if (client.connected) {
      doSubscribe();
    } else {
      const prevOnConnect = client.onConnect;
      client.onConnect = (frame) => {
        prevOnConnect?.(frame);
        doSubscribe();
      };
    }

    return () => sub.unsubscribe();
  }, [sessionId, client]);

  const sendReaction = useCallback((type: ReactionType) => {
    apiService.post(`/sessions/${sessionId}/reactions`, { type }).catch(console.error);
  }, [sessionId, apiService]);

  return { sendReaction };
}

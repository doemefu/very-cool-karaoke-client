import { useEffect, useRef, useCallback } from "react";
import { useStomp } from "@/context/StompContext";
import useLocalStorage from "@/hooks/useLocalStorage";
import { ReactionType, Reaction } from "@/types/reaction";

interface UseReactionsOptions {
  sessionId: string;
  onReaction: (reaction: Reaction) => void;
}

export function useReactions({ sessionId, onReaction }: UseReactionsOptions) {
  const { client, connected } = useStomp();
  const { value: userId } = useLocalStorage<string>("id", "");

  const onReactionRef = useRef(onReaction);
  useEffect(() => { onReactionRef.current = onReaction; }, [onReaction]);

  useEffect(() => {
    if (!sessionId || !client || !connected) return;

    const sub = client.subscribe(
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

    return () => sub.unsubscribe();
  }, [sessionId, client, connected]);

  const sendReaction = useCallback((type: ReactionType) => {
    if (!client || !connected || !userId) return;
    client.publish({
      destination: `/app/sessions/${sessionId}/reactions`,
      body: JSON.stringify({ type, userId }),
    });
  }, [sessionId, client, connected, userId]);

  return { sendReaction };
}

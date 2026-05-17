import { useState, useEffect, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { useStomp } from "@/context/StompContext";
import { Session, SessionStatus, Participant } from "@/types/session";

export interface UseSessionStatusResult {
  status: SessionStatus | null;
  isAdmin: boolean;
  gamePin: string;
  sessionName: string;
  participants: Participant[];
  isLoading: boolean;
}

export const useSessionStatus = (sessionId: string, userId: string): UseSessionStatusResult => {
  const apiService = useApi();
  const { client, connected } = useStomp();

  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [gamePin, setGamePin] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useCallback((session: Session, currentUserId: string) => {
    const newStatus = session.status ?? null;
    setStatus(newStatus);
    setIsAdmin(String(session.admin?.id) === String(currentUserId));
    setGamePin(session.gamePin ?? "");
    setSessionName(session.name ?? "");
    setParticipants(session.participants ?? []);
  }, []);

  const fetchSession = useCallback(async () => {
    if (!sessionId || !userId) {
      setIsLoading(false);
      return;
    }
    try {
      const session = await apiService.get<Session>(`/sessions/${sessionId}`);
      applySession(session, userId);
    } catch {
      // silently ignore
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, userId, apiService, applySession]);

  // Initial fetch
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // WebSocket subscription for live status updates
  useEffect(() => {
    if (!sessionId || !client || !connected) return;

    const sub = client.subscribe(
      `/topic/sessions/${sessionId}/status`,
      (frame) => {
        let data: unknown;
        try {
          data = JSON.parse(frame.body);
        } catch {
          // Raw string payload (e.g. "ACTIVE")
          data = frame.body;
        }
        // Server may send full session DTO or just a raw status string
        const newStatus: SessionStatus =
          typeof data === "string" ? data as SessionStatus : (data as { status?: SessionStatus })?.status ?? null;
        if (newStatus) {
          setStatus(newStatus);
        }
        if (data && typeof data === "object" && (data as { participants?: unknown }).participants) {
          setParticipants((data as { participants: typeof participants }).participants);
        }
      }
    );

    const participantsSub = client.subscribe(
      `/topic/sessions/${sessionId}/participants`,
      (frame) => {
        try {
          const updated: { id: number; username: string }[] = JSON.parse(frame.body);
          setParticipants(updated);
        } catch {
          console.error("Failed to parse participants update:", frame.body);
        }
      }
    );

    return () => {
      sub.unsubscribe();
      participantsSub.unsubscribe();
    };
  }, [sessionId, client, connected]);

  return { status, isAdmin, gamePin, sessionName, participants, isLoading };
};

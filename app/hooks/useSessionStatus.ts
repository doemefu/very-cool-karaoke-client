import { useState, useEffect, useCallback, useRef } from "react";
import { useApi } from "@/hooks/useApi";
import { useStomp } from "@/context/StompContext";
import { Session, SessionStatus } from "@/types/session";

export interface UseSessionStatusResult {
  status: SessionStatus | null;
  isAdmin: boolean;
  gamePin: string;
  sessionName: string;
  participants: { id: number; username: string }[];
  isLoading: boolean;
}

const POLL_INTERVAL_MS = 3000;

export const useSessionStatus = (sessionId: string, userId: string): UseSessionStatusResult => {
  const apiService = useApi();
  const { client, connected } = useStomp();

  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [gamePin, setGamePin] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [participants, setParticipants] = useState<{ id: number; username: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const statusRef = useRef<SessionStatus | null>(null);

  const applySession = useCallback((session: Session, currentUserId: string) => {
    const newStatus = session.status ?? null;
    statusRef.current = newStatus;
    setStatus(newStatus);
    setIsAdmin(String(session.admin?.id) === String(currentUserId));
    setGamePin(session.gamePin ?? "");
    setSessionName(session.name ?? "");
    setParticipants(session.participants ?? []);
  }, []);

  const fetchSession = useCallback(async () => {
    if (!sessionId) return;
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
        try {
          const data = JSON.parse(frame.body);
          // Server may send full session DTO or just the status string
          const newStatus: SessionStatus =
            typeof data === "string" ? data : data.status;
          if (newStatus) {
            statusRef.current = newStatus;
            setStatus(newStatus);
          }
          // If we got a full session, also update participants
          if (data && typeof data === "object" && data.participants) {
            setParticipants(data.participants);
          }
        } catch {
          console.error("Failed to parse status update:", frame.body);
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

  // Polling fallback while session is in CREATED state
  // (in case the WebSocket publisher is not yet implemented server-side)
  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(() => {
      if (statusRef.current === "CREATED") {
        fetchSession();
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [sessionId, fetchSession]);

  return { status, isAdmin, gamePin, sessionName, participants, isLoading };
};

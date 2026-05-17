import { useCallback, useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { Song } from "@/types/song";

export function useSessionReview(sessionId: string, enabled: boolean) {
  const [reviewSongs, setReviewSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const apiService = useApi();

  const fetchReview = useCallback(async () => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      const res = await apiService.get<Song[]>(`/sessions/${sessionId}/review`);
      setReviewSongs(res);
    } catch (error) {
      console.error("Failed to fetch session review:", error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, apiService]);

  useEffect(() => {
    if (enabled) fetchReview();
  }, [enabled, fetchReview]);

  return { reviewSongs, isLoading };
}

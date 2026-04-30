"use client";

import { useEffect, useRef, useState } from "react";
import { Song } from "@/types/song";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
  }
}

interface Props {
  currentSong: Song | null;
  isAdmin: boolean;
  isActive: boolean;
  onTrackEnd: () => void;
}

const PLAYER_ID = "yt-player-hidden";

export default function YouTubePlayer({ currentSong, isAdmin, isActive, onTrackEnd }: Props) {
  const playerRef = useRef<YT.Player | null>(null);
  const playerReadyRef = useRef(false);
  const pendingVideoIdRef = useRef<string | null>(null);
  const onTrackEndRef = useRef(onTrackEnd);
  onTrackEndRef.current = onTrackEnd;

  const [ytReady, setYtReady] = useState(false);

  // Load YouTube IFrame API once
  useEffect(() => {
    if (!isAdmin) return;

    if (window.YT?.Player) {
      setYtReady(true);
      return;
    }

    window.onYouTubeIframeAPIReady = () => setYtReady(true);

    const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
    }
  }, [isAdmin]);

  // Initialize player once — separate from song changes
  useEffect(() => {
    if (!isAdmin || !ytReady || playerRef.current) return;

    playerRef.current = new window.YT.Player(PLAYER_ID, {
      height: "1",
      width: "1",
      playerVars: { autoplay: 1 as YT.AutoPlay },
      events: {
        onReady: () => {
          playerReadyRef.current = true;
          if (pendingVideoIdRef.current) {
            playerRef.current?.loadVideoById(pendingVideoIdRef.current);
            pendingVideoIdRef.current = null;
          }
        },
        onStateChange: (event: YT.OnStateChangeEvent) => {
          if (event.data === window.YT.PlayerState.ENDED) {
            onTrackEndRef.current();
          }
        },
      },
    });
  }, [isAdmin, ytReady]);

  // Search YouTube and play when song changes
  useEffect(() => {
    if (!isAdmin || !isActive || !ytReady || !currentSong) return;

    const searchAndPlay = async () => {
      const query = encodeURIComponent(`${currentSong.artist} ${currentSong.title}`);
      const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&key=${apiKey}`
        );
        const data = await res.json();
        const videoId: string | undefined = data.items?.[0]?.id?.videoId;
        if (!videoId) return;

        if (playerReadyRef.current && playerRef.current) {
          playerRef.current.loadVideoById(videoId);
        } else {
          pendingVideoIdRef.current = videoId;
        }
      } catch (err) {
        console.error("YouTubePlayer: search or playback failed", err);
      }
    };

    searchAndPlay();
  }, [currentSong, isAdmin, isActive, ytReady]);

  // Destroy player on unmount
  useEffect(() => {
    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
      playerReadyRef.current = false;
    };
  }, []);

  if (!isAdmin) return null;

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, width: 1, height: 1, overflow: "hidden", opacity: 0 }}>
      <div id={PLAYER_ID} />
    </div>
  );
}

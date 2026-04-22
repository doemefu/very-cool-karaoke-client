import { useEffect, useRef } from 'react';
import { useApi } from '@/hooks/useApi';
import { Song } from '@/types/song';

interface UseSpotifyPlaybackOptions {
    sessionId: string;
    currentSong: Song | null;
    deviceId: string | null;
    accessToken: string | null;
    player: Spotify.Player | null;
    isAdmin: boolean;
}

export function useSpotifyPlayback({
   sessionId,
   currentSong,
   deviceId,
   accessToken,
   player,
   isAdmin,
}: UseSpotifyPlaybackOptions) {
    const apiService = useApi();
    const prevSongIdRef = useRef<number | null>(null);
    const advancedRef = useRef(false);

    useEffect(() => {
        advancedRef.current = false;
    }, [currentSong?.id]);

    useEffect(() => {
        if (!isAdmin || !currentSong || !currentSong.spotifyId || !deviceId || !accessToken) return;
        if (currentSong.id === prevSongIdRef.current) return;

        prevSongIdRef.current = currentSong.id;

        fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uris: [`spotify:track:${currentSong.spotifyId}`],
            }),
        }).then(async (res) => {
            if (!res.ok) {
                const body = await res.text();
                console.error(`Spotify play failed: ${res.status}`, body);
            }
        }).catch(console.error);

    }, [currentSong, deviceId, accessToken, isAdmin]);

    // Detect track end and advance to next song
    useEffect(() => {
        if (!isAdmin || !player || !currentSong) return;

        const handleStateChange = (state: Spotify.PlaybackState | null) => {
            if (!state) return;

            // Track ends when paused at position 0 after having played something
            const trackEnded =
                state.paused &&
                state.position === 0 &&
                state.track_window.previous_tracks.length > 0;

            if (trackEnded && !advancedRef.current) {
                advancedRef.current = true;
                apiService
                    .post(`/sessions/${sessionId}/songs/next`, {})
                    .catch(console.error);
            }
        };

        player.addListener('player_state_changed', handleStateChange);
        return () => player.removeListener('player_state_changed', handleStateChange);
    }, [player, currentSong, sessionId, isAdmin, apiService]);
}

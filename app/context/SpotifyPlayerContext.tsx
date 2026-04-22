"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth';
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';

interface SpotifyPlayerContextValue {
    accessToken: string | null;
    deviceId: string | null;
    player: Spotify.Player | null;
    isReady: boolean;
    playerError: string | null;
    initiateLogin: () => void;
    spotifyAuthError: string | null;
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextValue | null>(null);

export function SpotifyPlayerProvider({ children }: { children: ReactNode }) {
    const { accessToken, initiateLogin, error: spotifyAuthError } = useSpotifyAuth();
    const { deviceId, player, isReady, error: playerError } = useSpotifyPlayer(accessToken);

    return (
        <SpotifyPlayerContext.Provider value={{ accessToken, deviceId, player, isReady, playerError, initiateLogin, spotifyAuthError }}>
            {children}
        </SpotifyPlayerContext.Provider>
    );
}

export function useSpotifyPlayerContext() {
    const ctx = useContext(SpotifyPlayerContext);
    if (!ctx) throw new Error('useSpotifyPlayerContext must be used within SpotifyPlayerProvider');
    return ctx;
}

import { useState, useEffect } from 'react';

const SCOPES = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
].join(' ');

function generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
        .map(b => chars[b % chars.length])
        .join('');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function useSpotifyAuth() {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('spotify_access_token');
        if (stored) { setAccessToken(stored); return; }

        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const verifier = localStorage.getItem('spotify_code_verifier');

        if (code && verifier) {
            exchangeCodeForToken(code, verifier);
        }
    }, []);

    const exchangeCodeForToken = async (code: string, verifier: string) => {
        try {
            const res = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: `${window.location.origin}/create-session`,
                    client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
                    code_verifier: verifier,
                }),
            });
            const data = await res.json();
            if (data.access_token) {
                localStorage.setItem('spotify_access_token', data.access_token);
                localStorage.setItem('spotify_token_expiry', String(Date.now() + data.expires_in * 1000));
                if (data.refresh_token) {                                                                    // ← NEU
                    localStorage.setItem('spotify_refresh_token', data.refresh_token);                      // ← NEU
                }
                localStorage.removeItem('spotify_code_verifier');
                setAccessToken(data.access_token);
                window.history.replaceState({}, '', window.location.pathname);
            } else {
                setError('Spotify token could not be retrieved');
            }
        } catch {
            setError('Connection to Spotify failed.');
        }
    };

    const refreshToken = async () => {
        const storedRefresh = localStorage.getItem('spotify_refresh_token');
        if (!storedRefresh) return;
        try {
            const res = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: storedRefresh,
                    client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
                }),
            });
            const data = await res.json();
            if (data.access_token) {
                localStorage.setItem('spotify_access_token', data.access_token);
                localStorage.setItem('spotify_token_expiry', String(Date.now() + data.expires_in * 1000));
                if (data.refresh_token) {
                    localStorage.setItem('spotify_refresh_token', data.refresh_token);
                }
                setAccessToken(data.access_token);
            }
        } catch {
            setError('Token could not be renewed.');
        }
    };

    const initiateLogin = async () => {
        const verifier = generateRandomString(64);
        const challenge = await generateCodeChallenge(verifier);
        localStorage.setItem('spotify_code_verifier', verifier);

        const params = new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
            response_type: 'code',
            redirect_uri: `${window.location.origin}/create-session`,
            scope: SCOPES,
            code_challenge_method: 'S256',
            code_challenge: challenge,
        });

        window.location.href = `https://accounts.spotify.com/authorize?${params}`;
    };

    useEffect(() => {
        if (!accessToken) return;
        const expiry = Number(localStorage.getItem('spotify_token_expiry') ?? 0);
        const msUntilRefresh = expiry - Date.now() - 5 * 60 * 1000;
        if (msUntilRefresh <= 0) {
            refreshToken();
            return;
        }

        const timeout = setTimeout(refreshToken, msUntilRefresh);
        return () => clearTimeout(timeout);
    }, [accessToken]);


    return { accessToken, initiateLogin, error };


}
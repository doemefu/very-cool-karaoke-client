import { useEffect, useState } from 'react';

declare global {
    interface Window {
        onSpotifyWebPlaybackSDKReady: () => void;
    }
}

export function useSpotifyPlayer(accessToken: string | null) {
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!accessToken) return;

        const initPlayer = () => {
            const player = new window.Spotify.Player({
                name: 'Karaoke Host Player',
                getOAuthToken: (cb) => cb(accessToken),
                volume: 0.8,
            });

            player.addListener('ready', ({ device_id }) => {
                setDeviceId(device_id);
                setIsReady(true);
                localStorage.setItem('spotify_device_id', device_id);
            });

            player.addListener('not_ready', () => {
                setIsReady(false);
                setError('Spotify Player ist offline gegangen.');
            });

            player.addListener('initialization_error', ({ message }) => setError(`Initialisierungsfehler: ${message}`));
            player.addListener('authentication_error', ({ message }) => setError(`Authentifizierungsfehler: ${message}`));
            player.addListener('account_error', () => setError('Spotify Premium wird benötigt.'));

            player.connect();
        };

        if (window.Spotify) {
            initPlayer();
        } else {
            const script = document.createElement('script');
            script.src = 'https://sdk.scdn.co/spotify-player.js';
            script.async = true;
            document.body.appendChild(script);
            window.onSpotifyWebPlaybackSDKReady = initPlayer;
        }
    }, [accessToken]);

    return { deviceId, isReady, error };
}
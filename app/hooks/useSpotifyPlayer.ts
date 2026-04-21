import {useEffect, useState} from 'react';

declare global {
    interface Window {
        onSpotifyWebPlaybackSDKReady: () => void;
    }
}

export function useSpotifyPlayer(accessToken: string | null) {
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [player, setPlayer] = useState<Spotify.Player | null>(null);

    useEffect(() => {
        if (!accessToken) return;

        const initPlayer = () => {
            const newPlayer = new window.Spotify.Player({
                name: 'Karaoke Host Player',
                getOAuthToken: (cb) => cb(accessToken),
                volume: 0.8,
            });
            setPlayer(newPlayer);

            newPlayer.addListener('ready', ({ device_id }) => {
                setDeviceId(device_id);
                setIsReady(true);
                localStorage.setItem('spotify_device_id', device_id);
            });

            newPlayer.addListener('not_ready', () => {
                setIsReady(false);
                setError('Spotify Player is currently offline');
            });

            newPlayer.addListener('initialization_error', ({ message }) => setError(`Initialization error: ${message}`));
            newPlayer.addListener('authentication_error', ({ message }) => setError(`Authentication error: ${message}`));
            newPlayer.addListener('account_error', () => setError('Spotify Premium is required.'));

            newPlayer.connect();
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

        return () => {
            player?.disconnect();
            setPlayer(null);
        };
    }, [accessToken, player]);

    return { deviceId, isReady, error, player };
}
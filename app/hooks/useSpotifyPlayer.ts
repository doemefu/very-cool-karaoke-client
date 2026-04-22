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

        let newPlayer: Spotify.Player | null = null;

        const initPlayer = () => {
            newPlayer = new window.Spotify.Player({
                name: 'Karaoke Host Player',
                getOAuthToken: (cb) => cb(accessToken),
                volume: 0.8,
            });
            setPlayer(newPlayer);

            newPlayer.addListener('ready', ({ device_id }) => {
                // Transfer playback to this device before exposing deviceId.
                // The SDK 'ready' event fires when the local WebSocket is up, but
                // Spotify's REST API registers the device asynchronously. Calling
                // PUT /v1/me/player forces the API to acknowledge the device, preventing
                // the 404 "Device not found" race condition on the first play call.
                fetch('https://api.spotify.com/v1/me/player', {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ device_ids: [device_id], play: false }),
                }).then((res) => {
                    if (res.ok) {
                        setDeviceId(device_id);
                        setIsReady(true);
                        localStorage.setItem('spotify_device_id', device_id);
                    } else {
                        setError(`Spotify device transfer failed: ${res.status}`);
                    }
                }).catch(() => {
                    setError('Spotify device transfer failed: network error');
                });
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
            newPlayer?.disconnect();
        };
    }, [accessToken]);

    return { deviceId, isReady, error, player };
}
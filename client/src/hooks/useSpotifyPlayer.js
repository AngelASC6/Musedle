import { useState, useEffect, useRef } from "react";

export const useSpotifyPlayer = (spotifyToken) => {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!spotifyToken) return;

    const initializePlayer = () => {
      if (!window.Spotify) return;

      const newPlayer = new window.Spotify.Player({
        name: "Spotify Guessing Game Player",
        getOAuthToken: (cb) =>
          cb(localStorage.getItem("spotifyToken") || spotifyToken),
        volume: 0.5,
      });

      newPlayer.addListener("account_error", ({ message }) => {
        console.error("Account Error (SDK rejected):", message);
      });

      newPlayer.addListener("ready", ({ device_id }) => {
        console.log("SDK ready, device_id:", device_id);
        setDeviceId(device_id);
      });
      newPlayer.addListener("not_ready", () => setDeviceId(null));
      newPlayer.addListener("initialization_error", ({ message }) =>
        console.error("Init Error:", message),
      );
      newPlayer.addListener("authentication_error", ({ message }) =>
        console.error("Auth Error:", message),
      );
      newPlayer.addListener("account_error", ({ message }) =>
        console.error("Account Error:", message),
      );

      newPlayer.addListener("player_state_changed", (state) => {
        if (!state) return;

        setIsPlaying(!state.paused);
        setDuration(state.track_window.current_track.duration_ms);
        setPosition(state.position);

        clearInterval(intervalRef.current);

        if (!state.paused) {
          intervalRef.current = setInterval(async () => {
            const current = await newPlayer.getCurrentState();
            if (current) setPosition(current.position);
          }, 500);
        }
      });

      newPlayer.connect();
      setPlayer(newPlayer);
    };

    window.Spotify
      ? initializePlayer()
      : (window.onSpotifyWebPlaybackSDKReady = initializePlayer);

    return () => clearInterval(intervalRef.current);
  }, [spotifyToken]);

  const disconnect = () => {
    clearInterval(intervalRef.current);
    player?.disconnect();
    // setPlayer(null);
    setDeviceId(null);
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
  };

  const resetPlayer = () => {
    setPosition(0);
  };

  const reconnect = () => {
    if (player) {
      player.connect();
    }
  };

  return {
    player,
    deviceId,
    isPlaying,
    position,
    duration,
    disconnect,
    resetPlayer,
    reconnect,
  };
};

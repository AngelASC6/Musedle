import { useState, useEffect } from "react";

export const useSpotifyPlayer = (spotifyToken) => {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

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

      newPlayer.addListener("ready", ({ device_id }) => setDeviceId(device_id));
      newPlayer.addListener("not_ready", () => setDeviceId(null));
      newPlayer.addListener("player_state_changed", (state) => {
        if (state) setIsPlaying(!state.paused);
      });
      newPlayer.addListener("initialization_error", ({ message }) =>
        console.error("Init Error:", message),
      );
      newPlayer.addListener("authentication_error", ({ message }) =>
        console.error("Auth Error:", message),
      );
      newPlayer.addListener("account_error", ({ message }) =>
        console.error("Account Error:", message),
      );

      newPlayer.connect();
      setPlayer(newPlayer);
    };

    window.Spotify
      ? initializePlayer()
      : (window.onSpotifyWebPlaybackSDKReady = initializePlayer);

    }, [spotifyToken]);
    
    const disconnect = () => {
      player?.disconnect();
      setPlayer(null);
      setDeviceId(null);
      setIsPlaying(false);
    };
  return { player, deviceId, isPlaying, disconnect };
};

import Guesser from "./Guesser";
import { useSpotifyPlayer } from "../hooks/useSpotifyPlayer.js";
import React, { useState, useEffect } from "react";
import {
  fetchUserPlaylists,
  fetchPlaylistTracks,
  fetchUserSavedSongs,
  playSong,
  fetchCurrentPlayback,
  fetchAvailableDevices,
  setTokenRefresher,
  transferPlayback,
} from "../services/spotifyService";

const waitForDevice = async (maxAttempts = 10, interval = 500) => {
  for (let i = 0; i < maxAttempts; i++) {
    const data = await fetchAvailableDevices();
    const apiDevice = data.devices?.find(d => d.name === "Spotify Guessing Game Player");
    console.log(`Attempt ${i + 1}: device found = ${!!apiDevice}`);
    if (apiDevice) return apiDevice.id; // return the real API id
    await new Promise(res => setTimeout(res, interval));
  }
  throw new Error("Device never appeared in Spotify's device list");
};

export default function SpotifyGuessingGame({
  spotifyToken,
  loggedIn,
  refreshToken,
  handleLogout,
}) {
  const {
    player,
    deviceId,
    isPlaying,
    position,
    duration,
    disconnect,
    resetPlayer,
    reconnect,
  } = useSpotifyPlayer(spotifyToken);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [randomSong, setRandomSong] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingLibrary, setLoadingLibrary] = useState(false)
  const [songPool, setSongPool] = useState([])



  const getRandomSong = async () => {
    if (loading || songPool.length === 0 || loadingLibrary ) return; // Prevent rapid clicks
    setLoading(true);
    try{
      const selectedSong = songPool[Math.floor(Math.random() * songPool.length)];
      setRandomSong(selectedSong);
      resetPlayer();

      // Try to play the song if device is available
      if (selectedSong) {
        try {
          const apiDeviceId = await waitForDevice(); //waits for device to be registered before moving on
          await transferPlayback(apiDeviceId); //registers device to prevent player not found error
          await playSong(selectedSong.track.uri, apiDeviceId);
          console.log("Song loaded successfully");
        } catch (playError) {
          console.warn(
            "Could not auto-play song:",
            playError?.message || playError,
          );
          // Continue anyway - user can click play button
        }
      } else if (!deviceId && player) {
        // If device is disconnected, attempt to reconnect
        console.log("Device disconnected, attempting to reconnect...");
        reconnect();
      }
    } catch (error) {
      console.error("Error getting random playlist:", error);
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  if (!loggedIn) return;
  setTokenRefresher(refreshToken);

  let canceled = false;

  const loadLibrary = async () => {
    setLoadingLibrary(true)
    console.log("Starting to load the libraty")
    const data = await fetchUserPlaylists();
    if (canceled) return
    const playlists = data.items;
    setUserPlaylists(playlists);

    const allTracks = [];
    for (const playlist of playlists) {
      if(canceled) return
      const result = await fetchPlaylistTracks(playlist.id);
      allTracks.push(...result.items);
    }

    const seen = new Set();
    const pool = allTracks
      .filter(item => item.track)
      .filter(item => {
        if (seen.has(item.track.id)) return false;
        seen.add(item.track.id);
        return true;
      });
    if (canceled) return
    setSongPool(pool);
    setLoadingLibrary(false)
    console.log("Done!")
  };

  loadLibrary();
  return()=>{
    canceled = true
    setLoadingLibrary(false)
  }
}, [loggedIn, refreshToken]);

  const handleLogoutClick = () => {
    disconnect();
    handleLogout();
  };


  return (
  <div>
    <header className="flex bg-blue-900 w-full">
      <h1 className="text-white py-4 px-6 text-2xl">Spotify Guessing Game</h1>
      <button
        onClick={handleLogoutClick}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded m-2 self-center justify-self-end"
      >
        Logout
      </button>
    </header>

    {loadingLibrary ? (
      <div className="flex justify-center items-center mt-16">
        <p className="text-gray-600 text-lg">Loading your library...</p>
      </div>
    ) : (
      <div>
        <p style={{ color: deviceId ? "green" : "red" }}>
          {deviceId ? "✓ Player Connected" : "⚠ Waiting for player..."}
        </p>

        <button
          onClick={getRandomSong}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded m-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : "Get Random Song"}
        </button>

        <Guesser
          randomSong={randomSong}
          isPlaying={isPlaying}
          position={position}
          duration={duration}
          player={player}
        />
      </div>
    )}
  </div>
);
}

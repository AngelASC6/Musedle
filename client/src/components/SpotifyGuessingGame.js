import Guesser from "./Guesser";
import { useSpotifyPlayer } from "../hooks/useSpotifyPlayer.js";
import React, { useState, useEffect } from "react";
import {
  fetchUserPlaylists,
  fetchPlaylistTracks,
  playSong,
  setTokenRefresher,
} from "../services/spotifyService";

export default function SpotifyGuessingGame({
  spotifyToken,
  loggedIn,
  refreshToken,
  handleLogout,
}) {
  const { player, deviceId, isPlaying, position, duration, disconnect, resetPlayer } =
    useSpotifyPlayer(spotifyToken);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [randomSong, setRandomSong] = useState(null);
  const [randomPlaylist, setRandomPlaylist] = useState(null);
  const [loading, setLoading] = useState(false);

  const getRandomPlaylist = async () => {
    if (loading) return; // Prevent rapid clicks
    setLoading(true);
    
    try {
      const playlist =
      userPlaylists[Math.floor(Math.random() * userPlaylists.length)];
      const data = await fetchPlaylistTracks(playlist.id);
      const songs = data.items.filter((item) => item.track);
      const selectedSong = songs[Math.floor(Math.random() * songs.length)];
      setRandomPlaylist(playlist);
      setRandomSong(selectedSong);
      
      // Reset position and play the new song to update duration
      if (deviceId && selectedSong) {
        resetPlayer();
        await playSong(selectedSong.track.uri, deviceId);
      }
    } catch (error) {
      console.error('Error getting random playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loggedIn) return;
    setTokenRefresher(refreshToken);
    fetchUserPlaylists().then((data) => setUserPlaylists(data.items));
  }, [loggedIn, refreshToken]); //Runs the effect when loggedIn changes or refreshToken Changes
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

      <p style={{ color: deviceId ? "green" : "red" }}>
        {deviceId ? "✓ Player Connected" : "⚠ Waiting for player..."}
      </p>

      <button
        onClick={getRandomPlaylist}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded m-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Loading..." : "Get Random Song"}
      </button>

      <Guesser
        randomSong={randomSong}
        randomPlaylist={randomPlaylist}
        isPlaying={isPlaying}
        deviceId={deviceId}
        position={position}
        duration={duration}
        player={player}
        refreshToken={refreshToken}
      />
    </div>
  );
}

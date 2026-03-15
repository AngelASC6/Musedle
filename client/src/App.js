import React, { useState, useEffect } from "react";
import { useSpotifyAuth } from "./hooks/useSpotifyAuth";
import { useSpotifyPlayer } from "./hooks/useSpotifyPlayer.js";
import {
  fetchUserPlaylists,
  fetchPlaylistTracks,
  playSong,
  setTokenRefresher,
} from "./services/spotifyService";
import SongDisplay from "./components/SongDisplay.js";
import PlaylistList from "./components/PlaylistList";
import GuessForm from "./components/GuessForm.js";

function App() {
  const { spotifyToken, loggedIn, refreshToken, logout } = useSpotifyAuth();
  const { player, deviceId, isPlaying, disconnect } =
    useSpotifyPlayer(spotifyToken);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [randomSong, setRandomSong] = useState(null);
  const [randomPlaylist, setRandomPlaylist] = useState(null);
  const [currentGuess, setCurrentGuess] = useState("")

useEffect(() => {
  if (!loggedIn) return;
  setTokenRefresher(refreshToken);
  fetchUserPlaylists().then((data) => setUserPlaylists(data.items));
}, [loggedIn]);

  const getRandomPlaylist = async () => {
    const playlist =
      userPlaylists[Math.floor(Math.random() * userPlaylists.length)];
    const data = await fetchPlaylistTracks(playlist.id, refreshToken);
    const songs = data.items.filter((item) => item.track);
    setRandomPlaylist(playlist);
    setRandomSong(songs[Math.floor(Math.random() * songs.length)]);
  };

  const handlePlay = () =>
    playSong(randomSong.track.uri, deviceId, refreshToken);
  const handleToggle = () => player?.togglePlay();
  const handleLogout = () => {
    disconnect(); // Kill the player first
    setTokenRefresher(null); // Clear the auth reference in the service layer
    logout(); // Then clear tokens and state
  };

  const handleUpdateGuess = (guess) =>{
    setCurrentGuess(guess)
    console.log(currentGuess)
    console.log(randomSong.track.name)
  }

  if (!loggedIn)
    return <a href="http://127.0.0.1:8888/login">Login with Spotify</a>;

  return (
    <div className="App">
      <header>
        <h1>Spotify Guessing Game</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>
      <p style={{ color: deviceId ? "green" : "red" }}>
        {deviceId ? "✓ Player Connected" : "⚠ Waiting for player..."}
      </p>
      <GuessForm song={randomSong} handleChange={handleUpdateGuess} />
      <button onClick={getRandomPlaylist}>Get Random Playlist</button>
      <p>{currentGuess===randomSong.track.name ? "Correct :)":"Wrong :("}</p>
      {randomSong && (
        <SongDisplay
          song={randomSong}
          playlist={randomPlaylist}
          isPlaying={isPlaying}
          deviceId={deviceId}
          onPlay={handlePlay}
          onToggle={handleToggle}
        />
      )}
      <PlaylistList playlists={userPlaylists} />
    </div>
  );
}

export default App;

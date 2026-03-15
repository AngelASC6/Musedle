import './App.css';
import React, { useState, useEffect } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();

const getTokenFromUrl = () => {
  return window.location.hash.substring(1).split("&").reduce((initial, item) => {
    let parts = item.split("=");
    initial[parts[0]] = decodeURIComponent(parts[1]);
    return initial;
  }, {});
};

function App() {
  const [spotifyToken, setSpotifyToken] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [userID, setUserId] = useState("");
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [selectedPlaylistSongs, setSelectedPlaylistSongs] = useState([]);
  const [randomSong, setRandomSong] = useState(null);
  const [randomSelectedPlaylist, setRandomSelectedPlaylist] = useState(null);
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);




  // Refresh token if expired
  const refreshTokenIfNeeded = async () => {
    const refreshToken = localStorage.getItem('spotifyRefreshToken');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`http://127.0.0.1:8888/refresh_token?refresh_token=${refreshToken}`);
      const data = await response.json();
      if (data.access_token) {
        setSpotifyToken(data.access_token);
        localStorage.setItem('spotifyToken', data.access_token);
        spotifyApi.setAccessToken(data.access_token);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    return false;
  };

  // Keeps users logged in across sessions
  useEffect(() => {
    const initializeUser = async () => {
      // Check if token exists in localStorage
      const storedToken = localStorage.getItem('spotifyToken');
      
      if (storedToken) {
        setSpotifyToken(storedToken);
        spotifyApi.setAccessToken(storedToken);
        setLoggedIn(true);
        await getUserPlaylists();
        return;
      }

      // Otherwise, check for token in URL hash
      const tokenData = getTokenFromUrl();
      const token = tokenData.access_token;
      const refreshToken = tokenData.refresh_token;
      
      if (token) {
        setSpotifyToken(token);
        spotifyApi.setAccessToken(token);
        
        // Save tokens to localStorage
        localStorage.setItem('spotifyToken', token);
        if (refreshToken) {
          localStorage.setItem('spotifyRefreshToken', refreshToken);
        }
        
        try {
          const user = await spotifyApi.getMe();
          setUserId(user.id);
          setLoggedIn(true);
          await getUserPlaylists();
        } catch (error) {
          console.error("Error getting user data:", error);
        }
        
        window.location.hash = "";
      }
    };
    
    initializeUser();
  }, []);

  const getNowPlaying = async () => {
    try {
      const response = await spotifyApi.getMyCurrentPlaybackState();
      if (response && response.item) {
        console.log("Now playing:", response.item.name);
      }
    } catch (error) {
      console.error("Error getting playback state:", error);
      if (error.status === 401) {
        const refreshed = await refreshTokenIfNeeded();
        if (refreshed) {
          try {
            const response = await spotifyApi.getMyCurrentPlaybackState();
            if (response && response.item) {
              console.log("Now playing:", response.item.name);
            }
          } catch (retryErr) {
            console.error("Error getting playback state after refresh:", retryErr);
          }
        }
      }
    }
  };

  const getUserPlaylists = async () => {
    try {
      const data = await spotifyApi.getUserPlaylists();
      setUserPlaylists(data.items);
      console.log('User Playlists', data.items);
    } catch (err) {
      console.error("Error fetching playlists:", err);
      // Try refreshing token if 401 error
      if (err.status === 401) {
        const refreshed = await refreshTokenIfNeeded();
        if (refreshed) {
          try {
            const data = await spotifyApi.getUserPlaylists();
            setUserPlaylists(data.items);
            console.log('User Playlists', data.items);
          } catch (retryErr) {
            console.error("Error fetching playlists after refresh:", retryErr);
          }
        }
      }
    }
  };

  const getPlaylistSongs = (playlistID) => {
    return spotifyApi.getPlaylistTracks(playlistID);
  };


  const getRandomSong = () => {
    const randomNumber = Math.floor(Math.random() * selectedPlaylistSongs.length);
    return selectedPlaylistSongs[randomNumber];
  };

  const getRandomPlaylist = async () => {
    if (!userPlaylists || userPlaylists.length === 0) {
      console.error("No playlists available. Please refresh.");
      const refreshed = await refreshTokenIfNeeded();
      if (refreshed) {
        await getUserPlaylists();
      }
      return;
    }

    const randomNumber = Math.floor(Math.random() * userPlaylists.length);
    const selectedPlaylist = userPlaylists[randomNumber];
    
    setRandomSelectedPlaylist(selectedPlaylist);
    
    try {
      const data = await getPlaylistSongs(selectedPlaylist.id);
      const songs = data.items;
      if (songs.length === 0) {
        console.error("Playlist has no songs");
        return;
      }
      const randomSongNumber = Math.floor(Math.random() * songs.length);
      setRandomSong(songs[randomSongNumber]);
      setSelectedPlaylistSongs(songs);
    } catch (error) {
      console.error("Error getting playlist songs:", error);
      if (error.status === 401) {
        const refreshed = await refreshTokenIfNeeded();
        if (refreshed) {
          try {
            const data = await getPlaylistSongs(selectedPlaylist.id);
            const songs = data.items;
            if (songs.length > 0) {
              const randomSongNumber = Math.floor(Math.random() * songs.length);
              setRandomSong(songs[randomSongNumber]);
              setSelectedPlaylistSongs(songs);
            }
          } catch (retryErr) {
            console.error("Error getting playlist songs after refresh:", retryErr);
          }
        }
      }
    }
  };
  

  // Initialize Spotify Web Playback SDK player
  // Initialize Spotify Web Playback SDK player
useEffect(() => {
  if (!spotifyToken) return;

  const initializePlayer = () => {
    if (!window.Spotify) return;

    const newPlayer = new window.Spotify.Player({
      name: 'Spotify Guessing Game Player',
      getOAuthToken: (cb) => {
        const token = localStorage.getItem('spotifyToken') || spotifyToken;
        cb(token);
      },
      volume: 0.5
    });

    newPlayer.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
      setDeviceId(device_id);
    });

    newPlayer.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
      setDeviceId(null);
    });

    newPlayer.addListener('player_state_changed', (state) => {
      if (state) setIsPlaying(!state.paused);
    });

    newPlayer.addListener('initialization_error', ({ message }) => {
      console.error('Initialization Error:', message);
    });

    newPlayer.addListener('authentication_error', ({ message }) => {
      console.error('Authentication Error:', message);
    });

    newPlayer.addListener('account_error', ({ message }) => {
      console.error('Account Error:', message);
    });

    newPlayer.connect();
    setPlayer(newPlayer);
  };

  // ---- This part must be OUTSIDE initializePlayer, inside useEffect ----
  if (window.Spotify) {
    initializePlayer();
  } else {
    window.onSpotifyWebPlaybackSDKReady = initializePlayer;
  }

  return () => {
    player?.disconnect();
  };
}, [spotifyToken]);


  const playRandomSong = async () => {
    if (!randomSong || !deviceId || !player) {
      console.error("Song, device, or player not available");
      return;
    }

    try {
      // Play the song using the Spotify API
      await spotifyApi.play({
        device_id: deviceId,
        uris: [randomSong.track.uri]
      });
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing song:", error);
      if (error.status === 401) {
        console.log("Token expired, attempting to refresh...");
        const refreshed = await refreshTokenIfNeeded();
        if (refreshed && deviceId) {
          // Wait a moment for the player to reinitialize with new token
          await new Promise(resolve => setTimeout(resolve, 1000));
          try {
            await spotifyApi.play({
              device_id: deviceId,
              uris: [randomSong.track.uri]
            });
            setIsPlaying(true);
          } catch (retryErr) {
            console.error("Error playing song after refresh:", retryErr);
            // If still getting 401, user may need to log out and back in with new scopes
            if (retryErr.status === 401) {
              alert("Your Spotify permission scopes have been updated. Please log out and log back in.");
            }
          }
        }
      }
    }
  };

  const togglePlayPause = async () => {
    if (!player) return;

    try {
      if (isPlaying) {
        await spotifyApi.pause();
      } else if (randomSong) {
        await playRandomSong();
      }
    } catch (error) {
      console.error("Error toggling playback:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('spotifyToken');
    localStorage.removeItem('spotifyRefreshToken');
    setLoggedIn(false);
    setSpotifyToken("");
    setUserPlaylists([]);
    setRandomSong(null);
    setRandomSelectedPlaylist(null);
  };
  return (
    <div className="App">
      {!loggedIn && <a href="http://127.0.0.1:8888/login">Login with Spotify</a>}

      {loggedIn && (
        <>
          <header>
            <h1>Spotify Guessing Game</h1>
            <button onClick={handleLogout}>Logout</button>
          </header>
          <div>
            <input placeholder="Your guess here"></input>
          </div>

          <button onClick={() => getNowPlaying()}>Check Now Playing</button>
          <button onClick={() => getRandomPlaylist()}>Get Random Playlist</button>
          {deviceId && <p style={{ color: 'green' }}>✓ Player Connected</p>}
          {!deviceId && <p style={{ color: 'red' }}>⚠ Waiting for player...</p>}

          {randomSong && (
            <div>
              <h2>{randomSong.track.name}</h2>
              <h3>by {randomSong.track.artists.map(artist => artist.name).join(', ')}</h3>
              <div>
                <h3>Playlist is: {randomSelectedPlaylist.name}</h3>
                <img style={{ width: '40%' }} src={randomSong.track.album.images[0].url} alt="Album art"></img>
              </div>
              <div>
                <button onClick={playRandomSong} disabled={!deviceId}>
                  {isPlaying ? '▶ Now Playing' : '▶ Play Song'}
                </button>
                <button onClick={togglePlayPause} disabled={!deviceId}>
                  {isPlaying ? '⏸ Pause' : '▶ Resume'}
                </button>
              </div>
            </div>
          )}

          {userPlaylists.length > 0 && (
            <div id='playlistContainer'>
              <h1>User Playlists</h1>
              {userPlaylists.map(playlist => <div key={playlist.id}>{playlist.name}</div>)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;

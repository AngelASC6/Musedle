import { spotifyApi } from '../hooks/useSpotifyAuth';

let tokenRefresher = null;

export const setTokenRefresher = (fn) => { tokenRefresher = fn; };

const withTokenRefresh = async (fn) => {
  try {
    return await fn();
  } catch (err) {
    // Parse error response to get actual status and message
    let errorStatus = err.status;
    let errorMessage = err.message;
    
    try {
      if (err.response) {
        const parsed = JSON.parse(err.response);
        if (parsed.error) {
          errorStatus = parsed.error.status || errorStatus;
          errorMessage = parsed.error.message || errorMessage;
        }
      }
    } catch (e) {
      // If parsing fails, use original error
    }
    
    const errorInfo = {
      status: errorStatus,
      message: errorMessage
    };
    
    console.error('Service error:', errorInfo);
    
    // Re-throw with proper status code
    const errorToThrow = new Error(errorMessage);
    errorToThrow.status = errorStatus;
    errorToThrow.originalError = err;
    
    if (errorStatus === 401 && tokenRefresher) {
      const refreshed = await tokenRefresher();
      if (refreshed) return await fn();
    }
    
    throw errorToThrow;
  }
};

//Handling the calls on our own instead of the library for fetchUserPlaylists and fetchPlaylistTracks so we can provide a signal
//to prevent api calls on refresh
const BASE = "https://api.spotify.com/v1";

const spotifyFetch = async (url, signal) => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${spotifyApi.getAccessToken()}` },
    signal,
  });
  if (res.status === 401 && tokenRefresher) {
    const refreshed = await tokenRefresher();
    if (refreshed) return spotifyFetch(url, signal); // retry once
  }
  if (res.status === 429) {
    const wait = (res.headers.get("Retry-After") || 2) * 1000; //waits before trying to request again
    await new Promise(r => setTimeout(r, wait));
    return spotifyFetch(url, signal);
  }
  if (!res.ok) throw new Error(`Spotify error: ${res.status}`);
  return res.json();
};

export const fetchUserPlaylists = (signal) =>
  spotifyFetch(`${BASE}/me/playlists?limit=50`, signal);

export const fetchPlaylistTracks = (playlistId, signal) =>
  spotifyFetch(`${BASE}/playlists/${playlistId}/tracks?limit=100`, signal);


export const transferPlayback = (device_id) =>
  withTokenRefresh(() => spotifyApi.transferMyPlayback([device_id],{play:false}))

export const fetchAvailableDevices = () =>
  withTokenRefresh(() => spotifyApi.getMyDevices());

// export const fetchUserPlaylists = (signal) =>
//   withTokenRefresh(() => spotifyApi.getUserPlaylists({signal}));

export const fetchUserSavedSongs = (options) => 
  withTokenRefresh(() => spotifyApi.getMySavedTracks(options))

// export const fetchPlaylistTracks = (playlistId, signal) =>
//   withTokenRefresh(() => spotifyApi.getPlaylistTracks(playlistId, {signal}));

export const playSong = (uri, deviceId) =>
  withTokenRefresh(() => spotifyApi.play({ device_id: deviceId, uris: [uri] }));

export const pauseSong = () =>
  withTokenRefresh(() => spotifyApi.pause());

export const fetchCurrentPlayback = () =>
  withTokenRefresh(() => spotifyApi.getMyCurrentPlaybackState());

export const fetchTrackInfo = (trackName) => 
  withTokenRefresh(() => spotifyApi.search(trackName, ['track'], { limit: 7 }))
export const fetchArtists = (artistIds) =>
  withTokenRefresh(() => spotifyApi.getArtists(artistIds));

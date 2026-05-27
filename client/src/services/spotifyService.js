import { spotifyApi } from '../hooks/useSpotifyAuth';

let tokenRefresher = null;

export const setTokenRefresher = (fn) => { tokenRefresher = fn; };

const withTokenRefresh = async (fn, retries = 1) => {
  if (!spotifyApi.getAccessToken()) return null;

  try {
    return await fn();
  } catch (err) {
    if (err instanceof SyntaxError) return null;
    if (err.status === 404) throw err;
    if (err.status === 429 && retries > 0) { // wait and retry once
      const wait = (err.headers?.get?.("Retry-After") || 2) * 1000;
      console.warn(`Rate limited, retrying in ${wait}ms...`);
      await new Promise(r => setTimeout(r, wait));
      return withTokenRefresh(fn, retries - 1);
    }
    console.error('Service error:', { status: err.status, message: err.message || err });
    if (err.status === 401 && tokenRefresher) {
      const refreshed = await tokenRefresher();
      if (refreshed) return await fn();
    }
    throw err;
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

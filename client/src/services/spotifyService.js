import { spotifyApi } from '../hooks/useSpotifyAuth';

let tokenRefresher = null;

export const setTokenRefresher = (fn) => { tokenRefresher = fn; };

const withTokenRefresh = async (fn) => {
  try {
    return await fn();
  } catch (err) {
    console.error('Service error:', {
      status: err.status,
      message: err.message || err
    });
    if (err.status === 401 && tokenRefresher) {
      const refreshed = await tokenRefresher();
      if (refreshed) return await fn();
    }
    throw err;
  }
};

export const fetchUserPlaylists = () =>
  withTokenRefresh(() => spotifyApi.getUserPlaylists());

export const fetchPlaylistTracks = (playlistId) =>
  withTokenRefresh(() => spotifyApi.getPlaylistTracks(playlistId));

export const playSong = (uri, deviceId) =>
  withTokenRefresh(() => spotifyApi.play({ device_id: deviceId, uris: [uri] }));

export const pauseSong = () =>
  withTokenRefresh(() => spotifyApi.pause());

export const fetchCurrentPlayback = () =>
  withTokenRefresh(() => spotifyApi.getMyCurrentPlaybackState());

export const fetchTrackInfo = (trackName) => 
  withTokenRefresh(() => spotifyApi.search(trackName, ['track'], { limit: 7 }))

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

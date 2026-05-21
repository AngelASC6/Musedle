import Guesser from "./Guesser";
import { useSpotifyPlayer } from "../hooks/useSpotifyPlayer.js";
import React, { useState, useEffect, useRef } from "react";
import {
  fetchUserPlaylists,
  fetchPlaylistTracks,
  playSong,
  pauseSong,
  fetchAvailableDevices,
  setTokenRefresher,
  transferPlayback,
} from "../services/spotifyService";

// --- Cache helpers ---
const CACHE_KEY = "spotifySongPool";
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

const slimTrack = (item) => ({
  track: {
    id: item.track.id,
    uri: item.track.uri,
    name: item.track.name,
    duration_ms: item.track.duration_ms,
    artists: item.track.artists.map((a) => ({ id: a.id, name: a.name })),
    album: {
      name: item.track.album.name,
      release_date: item.track.album.release_date,
      images: item.track.album.images.slice(0, 1),
    },
  },
});

const savePoolToCache = (pool) => {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ pool, timestamp: Date.now() }),
    );
  } catch (e) {
    if (e.name === "QuotaExceededError") {
      console.warn("Library too large to cache — will reload each visit");
    }
  }
};

const loadPoolFromCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { pool, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL_MS) return null;
    return pool;
  } catch {
    return null;
  }
};

// --- Parallel batch fetcher ---
const fetchAllTracks = async (playlists, onProgress, canceled) => {
  const BATCH_SIZE = 5;
  const allTracks = [];

  for (let i = 0; i < playlists.length; i += BATCH_SIZE) {
    if (canceled.current) return [];
    const batch = playlists.slice(i, i + BATCH_SIZE);
    onProgress(
      `Loading playlists ${i + 1}–${Math.min(i + BATCH_SIZE, playlists.length)} of ${playlists.length}...`,
    );
    const results = await Promise.all(
      batch.map((p) => fetchPlaylistTracks(p.id)),
    );
    results.forEach((r) => allTracks.push(...r.items));
  }

  return allTracks;
};

const waitForDevice = async (maxAttempts = 10, interval = 500) => {
  for (let i = 0; i < maxAttempts; i++) {
    const data = await fetchAvailableDevices();
    const apiDevice = data.devices?.find(
      (d) => d.name === "Spotify Guessing Game Player",
    );
    console.log(`Attempt ${i + 1}: device found = ${!!apiDevice}`);
    if (apiDevice) return apiDevice.id;
    await new Promise((res) => setTimeout(res, interval));
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
    reconnect,
  } = useSpotifyPlayer(spotifyToken);

  const [userPlaylists, setUserPlaylists] = useState([]);
  const [randomSong, setRandomSong] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [songPool, setSongPool] = useState([]);

  const libraryCanceled = useRef(false);
  const libraryLoading = useRef(false);

  const getRandomSong = async () => {
    if (loading || songPool.length === 0 || loadingLibrary) return;
    setLoading(true);
    try {
      const selectedSong =
        songPool[Math.floor(Math.random() * songPool.length)];
      setRandomSong(selectedSong);

      if (selectedSong) {
        try {
          const apiDeviceId = await waitForDevice();
          await transferPlayback(apiDeviceId);
          await playSong(selectedSong.track.uri, apiDeviceId);
          console.log("Song loaded successfully");
        } catch (playError) {
          console.warn(
            "Could not auto-play song:",
            playError?.message || playError,
          );
        }
      } else if (!deviceId && player) {
        console.log("Device disconnected, attempting to reconnect...");
        reconnect();
      }
    } catch (error) {
      console.error("Error getting random song:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadLibrary = async () => {
    // If already loading, cancel the previous run and wait for it to stop
    if (libraryLoading.current) {
      libraryCanceled.current = true;
      while (libraryLoading.current) {
        await new Promise((res) => setTimeout(res, 50));
      }
      libraryCanceled.current = false;
    }

    libraryLoading.current = true;

    try {
      const cached = loadPoolFromCache();
      if (cached) {
        setSongPool(cached);
        setLoadingStatus(`${cached.length} songs loaded from cache`);
        return;
      }

      setLoadingLibrary(true);
      setLoadingStatus("Fetching playlists...");

      const data = await fetchUserPlaylists();
      if (libraryCanceled.current) return;

      const playlists = data.items;
      setUserPlaylists(playlists);

      const allTracks = await fetchAllTracks(
        playlists,
        setLoadingStatus,
        libraryCanceled,
      );
      if (libraryCanceled.current) return;

      const seen = new Set();
      const pool = allTracks
        .filter((item) => item.track)
        .filter((item) => {
          if (seen.has(item.track.id)) return false;
          seen.add(item.track.id);
          return true;
        })
        .map(slimTrack);

      savePoolToCache(pool);
      setSongPool(pool);
      setLoadingStatus(`${pool.length} songs ready`);
      setLoadingLibrary(false);
    } finally {
      libraryLoading.current = false;
      setLoadingLibrary(false)
    }
  };

  const refreshLibrary = async () => {
    libraryCanceled.current = true;
    localStorage.removeItem(CACHE_KEY);
    try { await pauseSong(); } catch (_) {}
    disconnect();
    setRandomSong(null);
    await loadLibrary();
    await new Promise((res) => setTimeout(res, 500));
    reconnect();
  };

  useEffect(() => {
    if (!loggedIn) return;
    setTokenRefresher(refreshToken);
    loadLibrary();
    return () => {
      libraryCanceled.current = true;
    };
  }, [loggedIn, refreshToken]);

  const handleLogoutClick = () => {
    libraryCanceled.current = true;
    disconnect();
    handleLogout();
  };

  return (
    <div>
      <header className="flex bg-blue-900 w-full">
        <h1 className="text-white py-4 px-6 text-2xl">Spotify Guessing Game</h1>
        <button
          onClick={handleLogoutClick}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded m-2 self-center"
        >
          Logout
        </button>
      </header>

      {loadingLibrary || !deviceId ? (
        <div className="flex flex-col justify-center items-center mt-16 gap-2">
          <p className="text-gray-600 text-lg">
            {loadingLibrary ? "Loading your library..." : "Connecting player..."}
          </p>
          <p className="text-gray-400 text-sm">{loadingStatus}</p>
        </div>
      ) : (
        <div>
          <p className="text-gray-500 text-sm px-2">{loadingStatus}</p>

          <div className="flex gap-2">
            <button
              onClick={getRandomSong}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded m-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Get Random Song"}
            </button>
            <button
              onClick={refreshLibrary}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded m-2"
            >
              Refresh Library
            </button>
          </div>

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
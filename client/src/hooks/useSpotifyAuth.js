import { useState, useEffect } from "react";
import SpotifyWebApi from "spotify-web-api-js";

export const spotifyApi = new SpotifyWebApi();

const getTokenFromUrl = () =>
  window.location.hash
    .substring(1)
    .split("&")
    .reduce((acc, item) => {
      const [key, value] = item.split("=");
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});

export const useSpotifyAuth = () => {
  const [spotifyToken, setSpotifyToken] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const setToken = (token) => {
    setSpotifyToken(token);
    spotifyApi.setAccessToken(token);
    localStorage.setItem("spotifyToken", token);
  };

  const refreshToken = async () => {
    const refresh = localStorage.getItem("spotifyRefreshToken");
    if (!refresh) return false;
    try {
      const res = await fetch(
        `http://127.0.0.1:8888/refresh_token?refresh_token=${refresh}`,
      );
      const data = await res.json();
      if (data.access_token) {
        setToken(data.access_token);
        return true;
      }
    } catch (err) {
      console.error("Token refresh failed:", err);
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("spotifyToken");
    localStorage.removeItem("spotifyRefreshToken");
    spotifyApi.setAccessToken(null);
    setSpotifyToken("");
    setLoggedIn(false);
  };

  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem("spotifyToken");
      if (storedToken) {
        setToken(storedToken);
        setLoggedIn(true);
        return;
      }
      const { access_token, refresh_token } = getTokenFromUrl();
      if (access_token) {
        setToken(access_token);
        if (refresh_token)
          localStorage.setItem("spotifyRefreshToken", refresh_token);
        setLoggedIn(true);
        window.location.hash = "";
      }
    };
    init();
  }, []);

  return { spotifyToken, loggedIn, refreshToken, logout };
};

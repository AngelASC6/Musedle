// https://github.com/thelinmichael/spotify-web-api-node
import { useState, useEffect } from "react";
import SpotifyWebApi from "spotify-web-api-js";

export const spotifyApi = new SpotifyWebApi();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL


export const useSpotifyAuth = () => {
  const [spotifyToken, setSpotifyToken] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true)

  const setToken = (token) => {
    setSpotifyToken(token);
    spotifyApi.setAccessToken(token);
  };

  const refreshToken = async () => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/refresh_token`,{
        credentials: "include" //attaches session cookies to request to prevent error from cross origin requests
      });
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
    fetch(`${BACKEND_URL}/logout`, { method: "POST", credentials: "include" });
    spotifyApi.setAccessToken(null);
    setSpotifyToken("");
    setLoggedIn(false);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const { access_token } = await res.json();
          setToken(access_token);
          setLoggedIn(true);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  return { spotifyToken, loggedIn, refreshToken, logout };
};

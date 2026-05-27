/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

require("dotenv").config();

const express = require("express");
app.set("trust proxy", 1); // tells Express to trust Render's proxy


const axios = require("axios");
const cors = require("cors");
const querystring = require("querystring");
const cookieParser = require("cookie-parser");
const path = require("path");
const session = require("express-session") //securely stores the refresh token in a server side session

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;
const CLIENT_URL = process.env.CLIENT_URL;

const generateRandomString = (length) => {
  let text = "";
  // TODO Modify to RegEx
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const stateKey = "spotify_auth_state";
const app = express();

// Serve static files from client build folder
app
  .use(express.static(path.join(__dirname, "../client/build")))
  .use(cors({
    origin: CLIENT_URL,
    credentials: true, //allows cookies from cross origin
  }))
  .use(cookieParser())
  .use(session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,   // JS can't read it — XSS protection
      sameSite: "none",
      secure: true,
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  }));

app.get("/login", (req, res) => {
  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  const scope = [
    "streaming", // Web Playback SDK
    "user-read-email", // Required by Web Playback SDK
    "user-read-private", // Required by Web Playback SDK
    "user-modify-playback-state", // play/pause/seek
    "user-read-playback-state", // getMyCurrentPlaybackState()
    "user-read-currently-playing", // current track info
    "playlist-read-private", // getUserPlaylists() for private playlists
    "playlist-read-collaborative", // collaborative playlists
  ].join(" ");
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id,
        scope,
        redirect_uri,
        state,
      }),
  );
});

app.get("/callback", (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    console.error("State validation failed");
    res.redirect("/#" + querystring.stringify({ error: "state_mismatch" }));
    return;
  }

  res.clearCookie(stateKey);
  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    data: querystring.stringify({
      code,
      redirect_uri,
      grant_type: "authorization_code",
    }),
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${client_id}:${client_secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  axios
    .post(authOptions.url, authOptions.data, { headers: authOptions.headers })
    .then((response) => {
      const { access_token, refresh_token } = response.data;

      //stores access tokens in session
      req.session.access_token = access_token;
      req.session.refresh_token = refresh_token;

      res.redirect(CLIENT_URL)
    })
    .catch((error) => {
      console.error("Token exchange failed:", error.message);
      res.redirect(`${CLIENT_URL}/?error=invalid_token`);
    });
});

app.get("/me", (req, res) => {
  if (!req.session.access_token) {
    return res.status(401).json({ error: "Not logged in" });
  }
  res.json({ access_token: req.session.access_token });
});

app.get("/refresh_token", (req, res) => {
  const refresh_token = req.session.refresh_token;

  if (!refresh_token) {
    return res.status(401).json({ error: "No refresh token" });
  }

  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    data: querystring.stringify({
      grant_type: "refresh_token",
      refresh_token,
    }),
    headers: {
      Authorization: "Basic " + Buffer.from(`${client_id}:${client_secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  axios
    .post(authOptions.url, authOptions.data, { headers: authOptions.headers })
    .then((response) => {
      const { access_token } = response.data;
      res.send({ access_token });
    })
    .catch((error) => {
      console.error("Token refresh failed:", error.message);
      res.status(400).send({ error: "token_refresh_failed" });
    });
});

//destroys session
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error("Session destroy error:", err);
    res.json({ ok: true });
  });
});

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const path = require('path');
const crypto = require('crypto');

// Validate env vars on startup
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = 'http://127.0.0.1:8888/callback';
const CLIENT_URL = 'http://127.0.0.1:3000';

if (!client_id || !client_secret) {
  console.error('Missing CLIENT_ID or CLIENT_SECRET in .env');
  process.exit(1);
}

// Helpers
const generateRandomString = (length) =>
  crypto.randomBytes(length).toString('hex').slice(0, length);

const getAuthHeader = () =>
  'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64');

const stateKey = 'spotify_auth_state';
const app = express();

app.use(express.static(path.join(__dirname, '../client/build')))
   .use(cors())
   .use(cookieParser());

// Routes
app.get('/login', (req, res) => {
  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  const scope = [
    'user-read-private',
    'user-read-email',
    'user-read-playback-state',
    'user-modify-playback-state',
    'streaming',
    'playlist-read-private',
    'playlist-read-public'
  ].join(' ');

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id,
      scope,
      redirect_uri,
      state
    }));
});

app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  const storedState = req.cookies?.[stateKey];

  if (!state || state !== storedState) {
    console.error('State validation failed');
    return res.redirect(`${CLIENT_URL}/#` + querystring.stringify({ error: 'state_mismatch' }));
  }

  res.clearCookie(stateKey);

  try {
    const { data } = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({ code, redirect_uri, grant_type: 'authorization_code' }),
      { headers: { 'Authorization': getAuthHeader(), 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    res.redirect(`${CLIENT_URL}/#` + querystring.stringify({
      access_token: data.access_token,
      refresh_token: data.refresh_token
    }));
  } catch (error) {
    console.error('Token exchange failed:', error.message);
    res.redirect(`${CLIENT_URL}/#` + querystring.stringify({ error: 'invalid_token' }));
  }
});

app.get('/refresh_token', async (req, res) => {
  const { refresh_token } = req.query;

  if (!refresh_token) {
    return res.status(400).json({ error: 'missing_refresh_token' });
  }

  try {
    const { data } = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({ grant_type: 'refresh_token', refresh_token }),
      { headers: { 'Authorization': getAuthHeader(), 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    res.json({ access_token: data.access_token });
  } catch (error) {
    console.error('Token refresh failed:', error.message);
    res.status(400).json({ error: 'token_refresh_failed' });
  }
});

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
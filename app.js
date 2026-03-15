/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = 'http://127.0.0.1:8888/callback';

const generateRandomString = (length) => {
  let text = '';
  // TODO Modify to RegEx
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const stateKey = 'spotify_auth_state';
const app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', (req, res) => {
  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  const scope = 'user-read-private user-read-email user-read-playback-state';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id,
      scope,
      redirect_uri,
      state
    }));
});

app.get('/callback', (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    console.error('State validation failed');
    res.redirect('/#' + querystring.stringify({ error: 'state_mismatch' }));
    return;
  }

  res.clearCookie(stateKey);
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    data: querystring.stringify({
      code,
      redirect_uri,
      grant_type: 'authorization_code'
    }),
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  axios.post(authOptions.url, authOptions.data, { headers: authOptions.headers })
    .then((response) => {
      const { access_token, refresh_token } = response.data;
      const userOptions = {
        url: 'https://api.spotify.com/v1/me',
        headers: { 'Authorization': `Bearer ${access_token}` }
      };

      return axios.get(userOptions.url, { headers: userOptions.headers })
        .then(() => {
          res.redirect('http://127.0.0.1:3000/#' + querystring.stringify({
            access_token,
            refresh_token
          }));
        });
    })
    .catch((error) => {
      console.error('Token exchange failed:', error.message);
      res.redirect('http://127.0.0.1:3000/#' + querystring.stringify({ error: 'invalid_token' }));
    });
});

app.get('/refresh_token', (req, res) => {
  const { refresh_token } = req.query;
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    data: querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token
    }),
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  axios.post(authOptions.url, authOptions.data, { headers: authOptions.headers })
    .then((response) => {
      const { access_token } = response.data;
      res.send({ access_token });
    })
    .catch((error) => {
      console.error('Token refresh failed:', error.message);
      res.status(400).send({ error: 'token_refresh_failed' });
    });
});

const PORT = 8888;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

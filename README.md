# Spotify Guessing Game

A full-stack application where users authenticate with Spotify and play a guessing game based on their listening history. This app is currently in progress with an expected 1.0 releasing mid-late May.


## Project Structure

```
├── app.js                  # Optional top-level app entry / shared startup logic
├── package.json            # Root dependencies and scripts for the full project
├── package-lock.json       # Root lockfile to lock installed package versions
├── README.md               # Project documentation and usage notes
├── client/                 # React frontend application
│   ├── package.json        # Frontend dependencies and dev scripts
│   ├── package-lock.json   # Client lockfile for reproducible installs
│   ├── public/             # Static assets and HTML entrypoint
│   │   └── index.html      # Frontend HTML page served by Vite
│   ├── src/                # React application source code
│   │   ├── App.js          # Main React app component and layout
│   │   ├── index.js        # Frontend entrypoint that mounts the React app
│   │   ├── index.css       # Global styles and Tailwind imports
│   │   ├── components/     # Reusable UI components for the game
│   │   │   ├── Guesser.js            # Component to submit guesses and show results
│   │   │   ├── GuessFeedback.js      # Displays guess correctness and feedback
│   │   │   ├── GuessFeedbackCard.js  # Card UI for each question feedback entry
│   │   │   ├── GuessForm.js          # Form used to submit a new track guess
│   │   │   ├── PlaylistList.jsx      # Shows playlist or song choice options
│   │   │   ├── ProgressBar.js        # Visual progress bar for the current game
│   │   │   ├── SongDisplay.js        # Shows currently playing song metadata
│   │   │   ├── SpotifyGuessingGame.js   # Main game logic and flow component
│   │   │   └── Webplaybak.jsx           # Spotify playback UI integration component
│   │   ├── hooks/          # Custom React hooks for Spotify integration
│   │   │   ├── useSpotifyAuth.js     # Handles Spotify auth token retrieval and refresh
│   │   │   └── useSpotifyPlayer.js   # Hooks into Spotify playback and player state
│   │   └── services/       # Client-side API helpers
│   │       └── spotifyService.js     # Spotify request helpers and data formatting
│   ├── tailwind.config.js  # Tailwind CSS framework configuration
│   ├── postcss.config.js   # PostCSS plugin configuration for CSS builds
│   └── vite.config.js      # Vite configuration for local development and builds
├── server/                 # Node.js backend server for Spotify auth and API proxy
│   ├── server.js           # Express server with Spotify OAuth and token handling
│   ├── package.json        # Backend dependencies and start scripts
│   └── package-lock.json   # Server lockfile for reproducible installs
└── .gitignore
```

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Spotify Developer Account

### Installation

1. Clone the repository
2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

3. Install client dependencies:
   ```bash
   cd client
   npm install
   ```

### Configuration

1. Create a `.env` file in the `server/` directory with your Spotify API credentials:
   ```
   CLIENT_ID=your_spotify_client_id
   CLIENT_SECRET=your_spotify_client_secret
   PORT=8888
   HOST=127.0.0.1
   ```

### Running the Application

In separate terminal windows:

1. Start the backend server:
   ```bash
   cd server
   npm start
   ```

2. Start the React client:
   ```bash
   cd client
   npm start
   ```

The application will be available at `http://localhost:3000`

## Features

- Spotify OAuth2 authentication
- Play guessing games based on user's Spotify data
- Token refresh mechanism for continuous session

## Technologies

- **Backend**: Node.js, Express.js, Axios
- **Frontend**: React, React Audio Player
- **Authentication**: Spotify OAuth2
- **Utilities**: dotenv, CORS

<!-- Test -->

# Spotify Guessing Game

A full-stack application where users authenticate with Spotify and play a guessing game based on their listening history. This app is currently in progress with an expected 1.0 releasing mid-late May.


## Project Structure (In Progress)

```
├── server/                 # Node.js/Express backend
│   ├── server.js          # Main server file with OAuth logic
│   ├── package.json       # Server dependencies
│   ├── .env               # Environment variables (CLIENT_ID, CLIENT_SECRET, etc.)
│   └── node_modules/
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   │   └── GuessForm.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── ...
│   ├── public/            # Static assets
│   ├── package.json       # Client dependencies
│   └── ...
├── .gitignore
├── README.md
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

import './index.css';
import { useSpotifyAuth } from "./hooks/useSpotifyAuth";
import {
  setTokenRefresher,
} from "./services/spotifyService";
import SpotifyGuessingGame from './components/SpotifyGuessingGame.js';

function App() {
  const { spotifyToken, loggedIn, refreshToken, logout } = useSpotifyAuth();

  const handleLogout = () => {
    setTokenRefresher(null);
    logout();
  };


  if (!loggedIn)
    return <a href="http://127.0.0.1:8888/login">Login with Spotify</a>;

  return (
    <div className="App min-h-screen">
      <SpotifyGuessingGame spotifyToken={spotifyToken} loggedIn={loggedIn} refreshToken={refreshToken} handleLogout={handleLogout}/>
    </div>
  );
}

export default App;
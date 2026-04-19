import React, { useState} from "react";
import SongDisplay from "./SongDisplay.js";
import ProgressBar from "./ProgressBar.js";
import GuessForm from "./GuessForm.js";
import { playSong } from "../services/spotifyService";

export default function Guesser({
  randomSong,
  randomPlaylist,
  isPlaying,
  deviceId,
  position,
  duration,
  player,
  refreshToken,
}) {
  const [currentGuess, setCurrentGuess] = useState("");

  const handleUpdateGuess = (guess) => {
    setCurrentGuess(guess);
  };

  const handlePlay = () =>
    playSong(randomSong.track.uri, deviceId, refreshToken);
  const handleToggle = () => player?.togglePlay();

  return (
    <div>
      {randomSong && (
        <SongDisplay
          song={randomSong}
          playlist={randomPlaylist}
          isPlaying={isPlaying}
          deviceId={deviceId}
          onPlay={handlePlay}
          onToggle={handleToggle}
        />
      )}
      {randomSong && (
        <div>
          <ProgressBar position={position} duration={duration} />
          <p>
            {currentGuess.toLowerCase() === randomSong.track.name.toLowerCase()
              ? "Correct :)"
              : "Wrong :("}
          </p>
          <GuessForm song={randomSong} handleChange={handleUpdateGuess} />
        </div>
      )}
    </div>
  );
}

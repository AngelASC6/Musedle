import React, { useState, useEffect } from "react";
import SongDisplay from "./SongDisplay.js";
import ProgressBar from "./ProgressBar.js";
import GuessForm from "./GuessForm.js";
import GuessFeedback from "./GuessFeedback.js";

export default function Guesser({
  randomSong,
  randomPlaylist,
  isPlaying,
  position,
  duration,
  player,
}) {
  const [resetKey, setResetKey] = useState(0);
  const [guesses, setGuesses] = useState([]);

  useEffect(() => {
    setResetKey(prev => prev + 1);
    setGuesses([]);  // Reset guesses on new song
  }, [randomSong]);

  const handleUpdateGuess = (trackObject) => {
    // GuessForm passes a track object when a user submits
    if (trackObject) {
      setGuesses(prev => [
        ...prev,
        { id: Date.now(), guess: trackObject }
      ]);
      console.log(randomSong)
    }
  };

  const handlePlay = () => {
    if (!player) {
      alert("Player not ready. Please wait...");
      return;
    }
    player.togglePlay();
  };

  const handleToggle = () => player?.togglePlay();

  return (
    <div>
      {randomSong && (
        <div>
          <ProgressBar position={position} duration={duration} />
          <div className="flex flex-none flex-col gap-2 justify-self-center">
          {guesses.map(({ id, guess }) => (
            <GuessFeedback key={id} song={randomSong} guess={guess} />
          ))}
          </div>
          <GuessForm
            key={resetKey}
            song={randomSong}
            handleChange={handleUpdateGuess}
          />
        </div>
      )}
    </div>
  );
}
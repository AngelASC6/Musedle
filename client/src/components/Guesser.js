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
  const [currentGuess, setCurrentGuess] = useState("");
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    // Reset guess when a new song is loaded
    setCurrentGuess("");
    setResetKey(prev => prev + 1);
  }, [randomSong]);

  const handleUpdateGuess = (guess) => {
    setCurrentGuess(guess);
    console.log(randomSong.track)
  };

  const handlePlay = () => {
    if (!player) {
      alert("Player not ready. Please wait...");
      return;
    }
    player.togglePlay();
  };
  
  const handleToggle = () => player?.togglePlay();

  const searchTrack =() =>{
    //if guess is wrong return guess info
  }

  return (
    <div>
      {/* {randomSong && (
        <SongDisplay
          song={randomSong}
          playlist={randomPlaylist}
          isPlaying={isPlaying}
          deviceId={deviceId}
          onPlay={handlePlay}
          onToggle={handleToggle}
        />
      )} */}
      {randomSong && (
        <div>
          <ProgressBar position={position} duration={duration} />
          <p>
            {currentGuess.name === randomSong.track.name
              ? "Correct :)"
              : "Wrong :("}
              {/* {currentGuess.album.release_date} */}
          </p>
          <GuessFeedback song={randomSong} guess={currentGuess}/>
          <GuessForm key={resetKey} song={randomSong} handleChange={handleUpdateGuess} />
        </div>
      )}
    </div>
  );
}

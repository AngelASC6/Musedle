import React, { useState, useEffect } from "react";
import SongDisplay from "./SongDisplay.js";
import ProgressBar from "./ProgressBar.js";
import GuessForm from "./GuessForm.js";
import GuessFeedback from "./GuessFeedback.js";
import { fetchArtists } from "../services/spotifyService.js";

export default function Guesser({
  randomSong,
  isPlaying,
  position,
  duration,
  player,
}) {
  const [resetKey, setResetKey] = useState(0);
  const [guesses, setGuesses] = useState([]);
  const [songGenres, setSongGenres] = useState([])

  useEffect(() => {
    setResetKey(prev => prev + 1);
    setGuesses([]);  // Reset guesses on new song
    setSongGenres([])

    if(!randomSong) return;
    const artistIds = randomSong.track.artists.map((a) => a.id)
    fetchArtists(artistIds).then(({ artists }) => {
      const merged = [...new Set(artists.flatMap((a) => a.genres))];
      setSongGenres(merged);
    });
    console.log("Song Genres ", songGenres)
  }, [randomSong]);

  const handleUpdateGuess = async (trackObject) => {
    // GuessForm passes a track object when a user submits
    if (!trackObject) return
    const artistIds = trackObject.artists.map((a) => a.id);
    const { artists } = await fetchArtists(artistIds);
    const guessGenres = [...new Set(artists.flatMap((a) => a.genres))];
    console.log("Guess Genres ", guessGenres)

      setGuesses(prev => [
        ...prev,
        { id: Date.now(), guess: trackObject, guessGenres }
      ]);
      console.log(randomSong)
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
            <GuessForm
              key={resetKey}
              song={randomSong}
              handleChange={handleUpdateGuess}
            />
          <div className="flex flex-none flex-col gap-2 justify-self-center">
          {guesses.toReversed().map(({ id, guess, guessGenres }) => (
            //todo: change prop into dict called genres {guess: [genres], song: [genres]}
            <GuessFeedback key={id} song={randomSong} guess={guess} guessGenres={guessGenres} songGenres={songGenres} />
          ))}
          </div>
        </div>
      )}
    </div>
  );
}
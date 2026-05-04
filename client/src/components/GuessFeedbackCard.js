export default function GuessFeedbackCard({
  song,
  guess,
  feedbackType,
  children,
  guessGenres,
  songGenres,
}) {
  const getBackgroundColor = () => {
    let correct = "bg-green-500";
    let close = "bg-yellow-500";
    let incorrect = "bg-red-500";

    if (!guess) return "bg-gray-400";

    const formatArtistsString = (artists) => {
      return artists?.map((artist) => artist.name).join(", ").toLowerCase() || "";
    };

    if (feedbackType === "artists") {
      const songArtistNames = song.artists.map((a) => a.name);
      const guessArtistNames = guess.artists.map((a) => a.name);
      if (formatArtistsString(song.artists) === formatArtistsString(guess.artists)) {
        return correct;
      } else if (guessArtistNames.some((name) => songArtistNames.includes(name))) {
        return close;
      } else {
        return incorrect;
      }
    } else if (feedbackType === "release_date") {
      const songYear = song.album.release_date.substring(0, 4);
      const guessYear = guess.album.release_date.substring(0, 4);
      const diff = Math.abs(guessYear - songYear);
      if (songYear === guessYear) return correct;
      if (diff <= 3) return close;
      return incorrect;
    } else if (feedbackType === "genre") {
      if (!guessGenres || !songGenres) return "bg-gray-400";
      if (guessGenres.length == 0 && songGenres.length == 0) return correct
      if (guessGenres.length == 0) return incorrect
      if (guessGenres.some((g) => songGenres.includes(g))) {
        return guessGenres.join() === songGenres.join() ? correct : close;
      }
      return incorrect;
    } else if (feedbackType === "album") {
      if (song.album.name.toLowerCase() === guess.album.name.toLowerCase()) {
        return correct;
      } else if (
        song.album.name.toLowerCase().includes(guess.album.name.toLowerCase()) ||
        guess.album.name.toLowerCase().includes(song.album.name.toLowerCase())
      ) {
        return close;
      }
      return incorrect;
    } else if (feedbackType === "name") {
      if (song.name == guess.name) return correct;
      return incorrect;
    }

    return "bg-gray-500";
  };

  return (
    <div
      className={`w-32 h-32 ${getBackgroundColor()} flex flex-col justify-center items-center rounded-lg text-white font-semibold text-sm overflow-hidden p-1 line-clamp-3`}
    >
      {children}
    </div>
  );
}
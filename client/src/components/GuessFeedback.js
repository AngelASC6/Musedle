import GuessFeedbackCard from "./GuessFeedbackCard";

export default function GuessFeedback({ guess, song }) {
  const songTrack = song?.track || song;
  const guessTrack = guess?.name ? guess : null;
  const songReleaseYear =  guessTrack?.album.release_date.slice(0,4)
  const formatArtists = (artists) => {
    return artists?.map((artist) => artist.name).join(", ") || "Unknown Artist";
  };

  return (
    <div className="flex gap-4 w-2/3">
        <GuessFeedbackCard song={songTrack} guess={guessTrack} feedbackType="image">{
        <img src={guessTrack?.album.images[0]?.url} className="w-full"/> || "no guess"}
        </GuessFeedbackCard>
        <GuessFeedbackCard song={songTrack} guess={guessTrack} feedbackType="name">{guessTrack?.name || "No guess"}</GuessFeedbackCard>
        <GuessFeedbackCard song={songTrack} guess={guessTrack} feedbackType="artists">{guessTrack ? formatArtists(guessTrack.artists) : "No guess"}</GuessFeedbackCard>
        <GuessFeedbackCard song={songTrack} guess={guessTrack} feedbackType="release_date">{guessTrack ? songReleaseYear : "No guess"}</GuessFeedbackCard>
        <GuessFeedbackCard song={songTrack} guess={guessTrack} feedbackType="popularity">{guessTrack ? guessTrack.popularity : "No guess"}</GuessFeedbackCard> 
        <GuessFeedbackCard song={songTrack} guess={guessTrack} feedbackType="album">{guessTrack ? guessTrack.album.name : "No guess"}</GuessFeedbackCard> 

        

    </div>
  );
}

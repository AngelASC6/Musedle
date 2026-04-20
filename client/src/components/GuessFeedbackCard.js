export default function GuessFeedbackCard({ song, guess, feedbackType, children }) {
    const getBackgroundColor = () => {
        let correct = "bg-green-500"
        let close = "bg-yellow-500"
        let incorrect = "bg-red-500"



        if (!guess) return "bg-gray-400";
        
        const formatArtistsString = (artists) => {
            return artists?.map(artist => artist.name).join(", ").toLowerCase() || "";
        };
        
        if (feedbackType==="artists"){
            if (formatArtistsString(song.artists) === formatArtistsString(guess.artists)){
                return correct
            }
            else if(formatArtistsString(guess.artists).includes(formatArtistsString(song.artists)) || formatArtistsString(song.artists).includes(formatArtistsString(guess.artists))){
                return close
            }  
            else{
                return incorrect
            }
        }
        else if(feedbackType === "release_date"){
            const songYear = song.album.release_date.substring(0, 4);
            const guessYear = guess.album.release_date.substring(0, 4);
            const diff = Math.abs(guessYear-songYear)
            if (songYear === guessYear){
                return correct
            }
            if (diff <= 3){
                return close
            }
            return incorrect
        }
        else if(feedbackType === "popularity"){
            const diff = Math.abs(song.popularity - guess.popularity);
            if (diff === 0){
                return correct
            }
            else if(diff <= 15){
                return close
            }
            return incorrect
        }
        else if(feedbackType === "album"){
            if (song.album.name.toLowerCase() === guess.album.name.toLowerCase()){
                return correct
            }
            else if(song.album.name.toLowerCase().includes(guess.album.name.toLowerCase()) || guess.album.name.toLowerCase().includes(song.album.name.toLowerCase())){
                return close
            }
            return incorrect
        }
        else if(feedbackType ==="name"){
            if (song.name == guess.name){
                return correct
            }
            else{
                return incorrect
            }
        }

        return "bg-gray-500"
    };

    return (
        <div className={`w-32 h-32 ${getBackgroundColor()} flex flex-col justify-center items-center rounded-lg text-white font-semibold text-sm overflow-hidden p-1 line-clamp-3`}>
            {children}
        </div>
    );
}
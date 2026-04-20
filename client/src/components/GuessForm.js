import { useEffect, useState } from "react"
import { fetchTrackInfo } from "../services/spotifyService";

export default function GuessForm({song, handleChange}){
    const [guess, setGuess] = useState("")
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [selectedTrack, setSelectedTrack] = useState(null)

// TODO return nothing if the guess isn't close enough to the first result???
    useEffect(() => {
        // Don't search if a track is already selected
        if (selectedTrack) return;

        const delayDebounce = setTimeout(async () => {
            if (guess.trim().length > 0) {
                console.log("searching for:", guess)
                const results = await fetchTrackInfo(guess);
                console.log(results.tracks.items)
                setSuggestions(results.tracks.items || []);
                setShowSuggestions(true)
            } else {
                setSuggestions([])
                setShowSuggestions(false)
            }
        }, 1000)

        return () => clearTimeout(delayDebounce)
    }, [guess, selectedTrack])

    const handleInputChange = (e) => {
        setGuess(e.target.value)
    }

    const handleSelectTrack = (track) => {
        setGuess(track.name)
        setSelectedTrack(track)
        setShowSuggestions(false)
    }

    const handleSubmit = () => {
        const trackToSubmit = selectedTrack || suggestions[0];
        if (!trackToSubmit) return;
        
        handleChange(trackToSubmit)
        setGuess("")
        setSelectedTrack(null)
        setSuggestions([])
    }

    // Reset form when song prop changes
    useEffect(() => {
        setGuess("")
        setSelectedTrack(null)
        setSuggestions([])
        setShowSuggestions(false)
    }, [song])

    return(
        <div className="flex gap-1">
            <div className="relative w-48">
                <input
                type="text"
                value={guess}
                onChange={handleInputChange}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setShowSuggestions(false)}
                placeholder="type your guess here"
                className="border border-gray-300 rounded px-3 py-2 m-2 w-48 focus:outline-none focus:border-blue-500"
                />
                
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-2 right-2 bg-white border border-gray-300 rounded shadow-lg z-10 max-h-48 overflow-y-auto">
                        {suggestions.map((track) => (
                            <div
                                key={track.id}
                                onMouseDown={() => handleSelectTrack(track)}
                                className="px-3 py-2 hover:bg-blue-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                            >
                                <div className="font-semibold text-sm">{track.name}</div>
                                <div className="text-xs text-gray-600">
                                    {track.artists.map(a => a.name).join(", ")}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <button 
                onClick={handleSubmit} 
                disabled={!selectedTrack && suggestions.length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded m-2"
            >
                Submit
            </button>
        </div>
    )
}
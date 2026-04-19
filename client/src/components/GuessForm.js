import { useState } from "react"
export default function GuessForm({song, handleChange}){
    const [guess, setGuess] = useState("")


    // Create a component that will have this and a new component for the guess feedback eg if the artist is correct

    function checkCorrect(guess){
        if (guess == song){
            return true
        }
        else{
            // Search song and return feedback
        }
    }
    return(
        <div>
            <input
            type="text"
            onChange={e => setGuess(e.target.value)}
            placeholder="type your guess here"
            className="border border-gray-300 rounded px-3 py-2 m-2 w-48 focus:outline-none focus:border-blue-500"
            />
            <button onClick={()=>handleChange(guess)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2">Submit</button>
        </div>
    )
}
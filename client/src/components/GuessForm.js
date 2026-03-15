import { useState } from "react"
export default function GuessForm({song, handleChange}){
    const [guess, setGuess] = useState("")

    return(
        <div>
            <input
            type="text"
            onChange={e => setGuess(e.target.value)}
            placeholder="type your guess here"
            />
            <button onClick={()=>handleChange(guess)}>Submit</button>
        </div>
    )
}
export default function LoginPage() {
    console.log(process.env.REACT_APP_BACKEND_URL)
    return(
        <div>
            <a href={`${process.env.REACT_APP_BACKEND_URL}/login`}>Login with Spotify</a>
        </div>
    )
}
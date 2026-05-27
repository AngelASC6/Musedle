export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden px-4">
      
      {/* Background circles */}
      <div className="absolute w-96 h-96 bg-green-500 rounded-full opacity-10 -top-20 -right-16 pointer-events-none" />
      <div className="absolute w-52 h-52 bg-green-500 rounded-full opacity-10 -bottom-10 -left-10 pointer-events-none" />
      <div className="absolute w-32 h-32 bg-green-500 rounded-full opacity-10 top-40 left-16 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center">

        {/* Spotify icon */}
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-8 glow-pulse">
          <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </div>

        <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">
          Musedle
        </p>

        <h1 className="text-4xl font-bold text-white leading-tight mb-3">
          How well do you<br />know your{" "}
          <span className="text-green-500">music?</span>
        </h1>

        <p className="text-gray-400 font-light mb-10">
          Connect your Spotify to start guessing
        </p>

        <a
          href={`${process.env.REACT_APP_BACKEND_URL}/login`}
          className="flex items-center gap-3 bg-green-500 hover:bg-green-400 text-black font-semibold py-3 px-8 rounded-full transition-all duration-150 hover:-translate-y-0.5 active:scale-95">
          <svg className="w-5 h-5 fill-black" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Continue with Spotify
        </a>

        <p className="mt-6 text-xs text-gray-600">
          Your listening data stays private
        </p>
      </div>
    </div>
  );
}
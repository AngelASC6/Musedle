// components/ProgressBar.jsx
function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = String(totalSec % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

export default function ProgressBar({ position, duration }) {
  if (!duration) return null;

  const pct = Math.min((position / duration) * 100, 100);

  return (
    <div className="flex items-center gap-2 w-full max-w-md mx-auto my-4">
      <span className="text-sm font-semibold text-gray-700">{formatTime(position)}</span>
      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-green-800 h-full transition-all duration-50 ease-linear" 
          style={{ width: `${pct}%` }} 
        />
      </div>
      <span className="text-sm font-semibold text-gray-700">{formatTime(duration)}</span>
    </div>
  );
}
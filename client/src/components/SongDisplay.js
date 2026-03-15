import React from 'react';

const SongDisplay = ({ song, playlist, isPlaying, deviceId, onPlay, onToggle }) => {
  const { track } = song;
  const artistNames = track.artists.map(a => a.name).join(', ');
  const albumArt = track.album.images[0]?.url;

  return (
    <div className="song-display">
      <h2>{track.name}</h2>
      <h3>by {artistNames}</h3>
      <h3>Playlist: {playlist.name}</h3>
      {albumArt && (
        <img style={{ width: '40%' }} src={albumArt} alt="Album art" />
      )}
      <div className="controls">
        <button onClick={onPlay} disabled={!deviceId}>
          {isPlaying ? '▶ Now Playing' : '▶ Play Song'}
        </button>
        <button onClick={onToggle} disabled={!deviceId}>
          {isPlaying ? '⏸ Pause' : '▶ Resume'}
        </button>
      </div>
    </div>
  );
};

export default SongDisplay;
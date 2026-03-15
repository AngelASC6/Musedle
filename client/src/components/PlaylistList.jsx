import React from 'react';

const PlaylistList = ({ playlists }) => {
  if (!playlists?.length) return null;

  return (
    <div id="playlistContainer">
      <h1>Your Playlists</h1>
      {playlists.map(playlist => (
        <div key={playlist.id} className="playlist-item">
          {playlist.images?.[0]?.url && (
            <img src={playlist.images[0].url} alt={playlist.name} style={{ width: '50px' }} />
          )}
          <span>{playlist.name}</span>
          <span>{playlist.tracks.total} tracks</span>
        </div>
      ))}
    </div>
  );
};

export default PlaylistList;
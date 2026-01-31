import { useState, useEffect } from 'react';
import { Music, Plus, Play, Pause, Search, Trash2, List, Heart, Volume2, Download, Share2, X } from 'lucide-react';
import axios from 'axios';

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  previewUrl?: string;
  imageUrl?: string;
  spotifyUrl?: string;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  songs: Song[];
  eventType: string;
}

export default function MusicPlanner() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);
  const [showSongSearch, setShowSongSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [searching, setSearching] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
    eventType: 'ceremony',
  });

  const eventTypes = [
    'Ceremony',
    'Cocktail Hour',
    'Reception Entrance',
    'First Dance',
    'Dinner',
    'Dancing',
    'Cake Cutting',
    'Bouquet Toss',
    'Send Off',
    'Pre-Wedding Event',
  ];

  useEffect(() => {
    loadPlaylists();
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, []);

  const loadPlaylists = () => {
    const saved = localStorage.getItem('weddingPlaylists');
    if (saved) {
      const loaded = JSON.parse(saved);
      setPlaylists(loaded);
      if (loaded.length > 0) {
        setSelectedPlaylist(loaded[0]);
      }
    } else {
      // Create default playlists
      const defaults: Playlist[] = [
        {
          id: 'ceremony',
          name: 'Ceremony',
          description: 'Music for the ceremony processional and recessional',
          songs: [],
          eventType: 'Ceremony',
        },
        {
          id: 'reception',
          name: 'Reception',
          description: 'Music for cocktail hour and reception',
          songs: [],
          eventType: 'Reception Entrance',
        },
        {
          id: 'dancing',
          name: 'Dancing',
          description: 'Upbeat songs for the dance floor',
          songs: [],
          eventType: 'Dancing',
        },
      ];
      setPlaylists(defaults);
      setSelectedPlaylist(defaults[0]);
      localStorage.setItem('weddingPlaylists', JSON.stringify(defaults));
    }
  };

  const savePlaylists = (updatedPlaylists: Playlist[]) => {
    setPlaylists(updatedPlaylists);
    localStorage.setItem('weddingPlaylists', JSON.stringify(updatedPlaylists));
  };

  const createPlaylist = () => {
    if (!newPlaylist.name.trim()) return;
    
    const playlist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylist.name,
      description: newPlaylist.description,
      songs: [],
      eventType: newPlaylist.eventType,
    };
    
    const updated = [...playlists, playlist];
    savePlaylists(updated);
    setSelectedPlaylist(playlist);
    setShowNewPlaylist(false);
    setNewPlaylist({ name: '', description: '', eventType: 'ceremony' });
  };

  const deletePlaylist = (id: string) => {
    const updated = playlists.filter(p => p.id !== id);
    savePlaylists(updated);
    if (selectedPlaylist?.id === id) {
      setSelectedPlaylist(updated[0] || null);
    }
  };

  const searchSongs = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      // Using iTunes API as a free alternative to Spotify
      const response = await axios.get(`https://itunes.apple.com/search`, {
        params: {
          term: searchQuery,
          media: 'music',
          entity: 'song',
          limit: 20,
        },
      });

      const songs: Song[] = response.data.results.map((track: any) => ({
        id: track.trackId.toString(),
        title: track.trackName,
        artist: track.artistName,
        album: track.collectionName,
        duration: formatDuration(track.trackTimeMillis),
        previewUrl: track.previewUrl,
        imageUrl: track.artworkUrl100,
        spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(track.trackName + ' ' + track.artistName)}`,
      }));

      setSearchResults(songs);
    } catch (error) {
      console.error('Search failed:', error);
      alert('Failed to search songs. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const addSongToPlaylist = (song: Song) => {
    if (!selectedPlaylist) return;
    
    // Check if song already exists
    if (selectedPlaylist.songs.some(s => s.id === song.id)) {
      alert('This song is already in the playlist!');
      return;
    }
    
    const updatedPlaylist = {
      ...selectedPlaylist,
      songs: [...selectedPlaylist.songs, song],
    };
    
    const updatedPlaylists = playlists.map(p =>
      p.id === selectedPlaylist.id ? updatedPlaylist : p
    );
    
    savePlaylists(updatedPlaylists);
    setSelectedPlaylist(updatedPlaylist);
  };

  const removeSongFromPlaylist = (songId: string) => {
    if (!selectedPlaylist) return;
    
    const updatedPlaylist = {
      ...selectedPlaylist,
      songs: selectedPlaylist.songs.filter(s => s.id !== songId),
    };
    
    const updatedPlaylists = playlists.map(p =>
      p.id === selectedPlaylist.id ? updatedPlaylist : p
    );
    
    savePlaylists(updatedPlaylists);
    setSelectedPlaylist(updatedPlaylist);
  };

  const playPreview = (url: string, songId: string) => {
    if (currentlyPlaying === songId) {
      // Pause
      if (audio) {
        audio.pause();
        setCurrentlyPlaying(null);
      }
    } else {
      // Play new song
      if (audio) {
        audio.pause();
      }
      const newAudio = new Audio(url);
      newAudio.play();
      setAudio(newAudio);
      setCurrentlyPlaying(songId);
      
      newAudio.onended = () => {
        setCurrentlyPlaying(null);
      };
    }
  };

  const exportPlaylist = () => {
    if (!selectedPlaylist) return;
    
    const text = `${selectedPlaylist.name}\n${selectedPlaylist.description}\n\n${selectedPlaylist.songs.map((song, i) => 
      `${i + 1}. ${song.title} - ${song.artist}`
    ).join('\n')}`;
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedPlaylist.name}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sound & Music</h1>
          <p className="text-gray-500 mt-1">Create playlists for every moment of your wedding</p>
        </div>
        <button
          onClick={() => setShowNewPlaylist(true)}
          className="flex items-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition font-medium"
        >
          <Plus className="w-5 h-5" />
          New Playlist
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <Music className="w-10 h-10 mb-2 opacity-80" />
          <div className="text-3xl font-bold">{playlists.length}</div>
          <div className="text-purple-100">Playlists</div>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white">
          <List className="w-10 h-10 mb-2 opacity-80" />
          <div className="text-3xl font-bold">
            {playlists.reduce((sum, p) => sum + p.songs.length, 0)}
          </div>
          <div className="text-pink-100">Total Songs</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <Volume2 className="w-10 h-10 mb-2 opacity-80" />
          <div className="text-3xl font-bold">
            {selectedPlaylist ? selectedPlaylist.songs.length : 0}
          </div>
          <div className="text-blue-100">Selected Playlist</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playlists Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-2">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <List className="w-5 h-5" />
              Your Playlists
            </h3>
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                  selectedPlaylist?.id === playlist.id
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 hover:border-pink-300'
                }`}
                onClick={() => setSelectedPlaylist(playlist)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{playlist.name}</div>
                    <div className="text-sm text-gray-500">{playlist.songs.length} songs</div>
                    <div className="text-xs text-pink-600 mt-1">{playlist.eventType}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${playlist.name}" playlist?`)) {
                        deletePlaylist(playlist.id);
                      }
                    }}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Playlist Details */}
        <div className="lg:col-span-2">
          {selectedPlaylist ? (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedPlaylist.name}</h2>
                  <p className="text-gray-500">{selectedPlaylist.description}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                    {selectedPlaylist.eventType}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={exportPlaylist}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    title="Export Playlist"
                  >
                    <Download className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setShowSongSearch(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition"
                  >
                    <Search className="w-5 h-5" />
                    Add Songs
                  </button>
                </div>
              </div>

              {/* Songs List */}
              {selectedPlaylist.songs.length === 0 ? (
                <div className="text-center py-12">
                  <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No songs in this playlist yet</p>
                  <button
                    onClick={() => setShowSongSearch(true)}
                    className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition"
                  >
                    Add Your First Song
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedPlaylist.songs.map((song, index) => (
                    <div
                      key={song.id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                    >
                      <div className="text-gray-400 font-medium w-8">{index + 1}</div>
                      {song.imageUrl && (
                        <img
                          src={song.imageUrl}
                          alt={song.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{song.title}</div>
                        <div className="text-sm text-gray-500">{song.artist}</div>
                      </div>
                      <div className="text-sm text-gray-500">{song.duration}</div>
                      <div className="flex gap-2">
                        {song.previewUrl && (
                          <button
                            onClick={() => playPreview(song.previewUrl!, song.id)}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                          >
                            {currentlyPlaying === song.id ? (
                              <Pause className="w-4 h-4 text-gray-600" />
                            ) : (
                              <Play className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => removeSongFromPlaylist(song.id)}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 transition"
                        >
                          <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a playlist to view songs</p>
            </div>
          )}
        </div>
      </div>

      {/* New Playlist Modal */}
      {showNewPlaylist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Playlist</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Playlist Name *
                </label>
                <input
                  type="text"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="e.g., Cocktail Hour"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="Describe this playlist..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type
                </label>
                <select
                  value={newPlaylist.eventType}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, eventType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewPlaylist(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createPlaylist}
                disabled={!newPlaylist.name.trim()}
                className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Song Search Modal */}
      {showSongSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Search Songs</h3>
              <button
                onClick={() => {
                  setShowSongSearch(false);
                  setSearchResults([]);
                  setSearchQuery('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchSongs()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                placeholder="Search for songs, artists, or albums..."
              />
              <button
                onClick={searchSongs}
                disabled={searching}
                className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition disabled:opacity-50"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                  >
                    {song.imageUrl && (
                      <img
                        src={song.imageUrl}
                        alt={song.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{song.title}</div>
                      <div className="text-sm text-gray-500">{song.artist}</div>
                    </div>
                    <div className="text-sm text-gray-500">{song.duration}</div>
                    <div className="flex gap-2">
                      {song.previewUrl && (
                        <button
                          onClick={() => playPreview(song.previewUrl!, song.id)}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                        >
                          {currentlyPlaying === song.id ? (
                            <Pause className="w-4 h-4 text-gray-600" />
                          ) : (
                            <Play className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => addSongToPlaylist(song)}
                        className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition text-sm"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Search for songs to add to your playlist</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { create } from 'zustand';
import { Song, getAllSongs, toggleFavorite, deleteSong } from '../database/repositories/SongRepository';
import { Playlist, getAllPlaylists, createPlaylist as dbCreatePlaylist } from '../database/repositories/PlaylistRepository';
import { generateId } from '../services/filesystem';

interface LibraryState {
  songs: Song[];
  playlists: Playlist[];
  recentSongIds: string[];
  isLoading: boolean;
  loadLibrary: () => Promise<void>;
  loadHistory: () => Promise<void>;
  toggleFavoriteStatus: (songId: string, currentStatus: boolean) => Promise<void>;
  removeSong: (songId: string) => Promise<void>;
  createNewPlaylist: (name: string) => Promise<void>;
  addSongToPlaylist: (playlistId: string, songId: string) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  updatePlaylistName: (playlistId: string, newName: string) => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  songs: [],
  playlists: [],
  recentSongIds: [],
  isLoading: true,

  loadLibrary: async () => {
    set({ isLoading: true });
    try {
      const fetchedSongs = await getAllSongs();
      const fetchedPlaylists = await getAllPlaylists();
      set({ songs: fetchedSongs, playlists: fetchedPlaylists, isLoading: false });
      await get().loadHistory();
    } catch (e) {
      console.error('Error loading library:', e);
      set({ isLoading: false });
    }
  },

  loadHistory: async () => {
    try {
      const { getRecentlyPlayedSongIds } = await import('../database/repositories/HistoryRepository');
      const recentIds = await getRecentlyPlayedSongIds(8);
      set({ recentSongIds: recentIds });
    } catch (e) {
      console.error('Error loading history:', e);
    }
  },

  toggleFavoriteStatus: async (songId, currentStatus) => {
    const newStatus = !currentStatus;
    await toggleFavorite(songId, newStatus);
    
    // Update local state instantly
    set((state) => ({
      songs: state.songs.map((s) => (s.id === songId ? { ...s, isFavorite: newStatus } : s)),
    }));
  },

  removeSong: async (songId) => {
    await deleteSong(songId);
    
    set((state) => ({
      songs: state.songs.filter((s) => s.id !== songId),
      recentSongIds: state.recentSongIds.filter(id => id !== songId),
    }));
  },

  createNewPlaylist: async (name: string) => {
    const newPlaylist: Playlist = {
      id: generateId(),
      name,
      description: '',
      coverPath: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await dbCreatePlaylist(newPlaylist);
    set((state) => ({
      playlists: [newPlaylist, ...state.playlists],
    }));
  },

  addSongToPlaylist: async (playlistId: string, songId: string) => {
    const { addSongToPlaylist: dbAddSongToPlaylist, getSongsForPlaylist } = await import('../database/repositories/PlaylistRepository');
    // Using a simple 0 for position as we don't have a strict ordering system yet
    await dbAddSongToPlaylist(playlistId, songId, 0);
  },

  removeSongFromPlaylist: async (playlistId: string, songId: string) => {
    const { removeSongFromPlaylist: dbRemoveSongFromPlaylist } = await import('../database/repositories/PlaylistRepository');
    await dbRemoveSongFromPlaylist(playlistId, songId);
  },

  deletePlaylist: async (playlistId: string) => {
    const { deletePlaylist: dbDeletePlaylist } = await import('../database/repositories/PlaylistRepository');
    await dbDeletePlaylist(playlistId);
    set((state) => ({
      playlists: state.playlists.filter(p => p.id !== playlistId)
    }));
  },

  updatePlaylistName: async (playlistId: string, newName: string) => {
    const { updatePlaylistName: dbUpdatePlaylistName } = await import('../database/repositories/PlaylistRepository');
    await dbUpdatePlaylistName(playlistId, newName);
    set((state) => ({
      playlists: state.playlists.map(p => p.id === playlistId ? { ...p, name: newName, updatedAt: Date.now() } : p)
    }));
  },

  addDownloadedSong: async (song: Song) => {
    const { addSong } = await import('../database/repositories/SongRepository');
    await addSong(song);
    
    set((state) => {
      // Avoid duplicates in memory if added twice
      const existing = state.songs.find(s => s.id === song.id);
      if (existing) return state;
      return { songs: [...state.songs, song] };
    });
  }
}));

// Helper hooks
export const useIsFavorite = (songId: string): boolean => {
  return useLibraryStore((state) => state.songs.find(s => s.id === songId)?.isFavorite ?? false);
};

export const useRecentSongs = (limit: number = 8) => {
  const songs = useLibraryStore((state) => state.songs);
  const recentIds = useLibraryStore((state) => state.recentSongIds);
  
  // Map ids to songs, keeping only those that exist
  const recentSongs = recentIds
    .map(id => songs.find(s => s.id === id))
    .filter((s): s is Song => s !== undefined)
    .slice(0, limit);
    
  return recentSongs;
};

export const useLibraryStats = () => {
  const songs = useLibraryStore((state) => state.songs);
  const favoritesCount = songs.filter(s => s.isFavorite).length;
  // Currently assuming all songs in library are offline if localPath exists
  const offlineCount = songs.filter(s => s.sourceType === 'local' || s.sourceType === 'authorized_download').length;
  
  return {
    totalSongs: songs.length,
    favoritesCount,
    offlineCount
  };
};

import { create } from 'zustand';
import { Song, getAllSongs, toggleFavorite, deleteSong } from '../database/repositories/SongRepository';
import { Playlist, getAllPlaylists, createPlaylist as dbCreatePlaylist } from '../database/repositories/PlaylistRepository';
import { generateId } from '../services/filesystem';

interface LibraryState {
  songs: Song[];
  playlists: Playlist[];
  isLoading: boolean;
  loadLibrary: () => Promise<void>;
  toggleFavoriteStatus: (songId: string, currentStatus: boolean) => Promise<void>;
  removeSong: (songId: string) => Promise<void>;
  createNewPlaylist: (name: string) => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  songs: [],
  playlists: [],
  isLoading: true,

  loadLibrary: async () => {
    set({ isLoading: true });
    try {
      const fetchedSongs = await getAllSongs();
      const fetchedPlaylists = await getAllPlaylists();
      set({ songs: fetchedSongs, playlists: fetchedPlaylists, isLoading: false });
    } catch (e) {
      console.error('Error loading library:', e);
      set({ isLoading: false });
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
  }
}));

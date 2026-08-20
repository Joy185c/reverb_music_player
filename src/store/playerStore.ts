import { create } from 'zustand';
import TrackPlayer, { State, Track, RepeatMode } from 'react-native-track-player';
import { Song } from '../database/repositories/SongRepository';

interface PlayerState {
  isPlaying: boolean;
  activeTrack: Track | null;
  queue: Track[];
  repeatMode: RepeatMode;
  isShuffle: boolean;
  playSong: (song: Song, queueList?: Song[]) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  skipToNext: () => Promise<void>;
  skipToPrevious: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => Promise<void>;
  sleepTimerEndTime: number | null;
  setSleepTimer: (minutes: number) => void;
  cancelSleepTimer: () => void;
}

const convertSongToTrack = (song: Song): Track => {
  let url = 'file://' + song.localPath;
  if (song.sourceUrl && song.sourceUrl.startsWith('content://')) {
    url = song.sourceUrl;
  } else if (song.sourceType === 'remote' && song.sourceUrl) {
    url = song.sourceUrl;
  }
    
  let artwork = undefined;
  if (song.artworkPath) {
    if (song.artworkPath.startsWith('http://') || song.artworkPath.startsWith('https://') || song.artworkPath.startsWith('content://')) {
      artwork = song.artworkPath;
    } else {
      artwork = 'file://' + song.artworkPath;
    }
  }

  return {
    id: song.id,
    url,
    title: song.title,
    artist: song.artist,
    album: song.album,
    artwork,
    duration: song.duration / 1000,
  };
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  isPlaying: false,
  activeTrack: null,
  queue: [],
  repeatMode: RepeatMode.Off,
  isShuffle: false,

  playSong: async (song, queueList) => {
    try {
      await TrackPlayer.reset();
      
      let tracksToPlay = queueList ? queueList.map(convertSongToTrack) : [convertSongToTrack(song)];

      if (get().isShuffle && queueList) {
        // Simple shuffle implementation for initial queue (could be improved to preserve first song)
        const currentTrack = convertSongToTrack(song);
        const others = tracksToPlay.filter(t => t.id !== currentTrack.id).sort(() => Math.random() - 0.5);
        tracksToPlay = [currentTrack, ...others];
      }

      await TrackPlayer.add(tracksToPlay);
      
      const index = tracksToPlay.findIndex((t) => t.id === song.id);
      if (index > -1) {
        await TrackPlayer.skip(index);
      }

      await TrackPlayer.play();
      set({ isPlaying: true, queue: tracksToPlay, activeTrack: convertSongToTrack(song) });
    } catch (e) {
      console.error('Error playing song', e);
    }
  },

  pause: async () => {
    await TrackPlayer.pause();
    set({ isPlaying: false });
  },

  resume: async () => {
    await TrackPlayer.play();
    set({ isPlaying: true });
  },

  skipToNext: async () => {
    await TrackPlayer.skipToNext();
  },

  skipToPrevious: async () => {
    await TrackPlayer.skipToPrevious();
  },

  seekTo: async (position) => {
    await TrackPlayer.seekTo(position);
  },

  toggleShuffle: () => {
    const newShuffle = !get().isShuffle;
    set({ isShuffle: newShuffle });
    // Note: To fully apply shuffle to an active queue without resetting playback, 
    // we would need to fetch the queue, shuffle remaining items, and re-add them.
    // For V1, the shuffle flag will apply on the next playSong call.
  },

  toggleRepeat: async () => {
    const current = get().repeatMode;
    let next = RepeatMode.Off;
    if (current === RepeatMode.Off) next = RepeatMode.Track;
    else if (current === RepeatMode.Track) next = RepeatMode.Queue;
    
    await TrackPlayer.setRepeatMode(next);
    set({ repeatMode: next });
  },

  sleepTimerEndTime: null,
  
  setSleepTimer: (minutes: number) => {
    const endTime = Date.now() + minutes * 60 * 1000;
    set({ sleepTimerEndTime: endTime });
  },
  
  cancelSleepTimer: () => {
    set({ sleepTimerEndTime: null });
  }
}));

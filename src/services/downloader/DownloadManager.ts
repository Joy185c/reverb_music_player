import RNFS from 'react-native-fs';
import { create } from 'zustand';

export type DownloadStatus = 'queued' | 'downloading' | 'completed' | 'failed' | 'cancelled';

export interface DownloadTask {
  id: string;
  url: string;
  title: string;
  artist: string;
  status: DownloadStatus;
  progress: number; // 0 to 1
  bytesDownloaded: number;
  bytesTotal: number;
  localAudioPath?: string;
  error?: string;
  jobId?: number;
}

interface DownloadManagerState {
  tasks: Record<string, DownloadTask>;
  addTask: (id: string, url: string, title: string, artist: string) => void;
  updateTask: (id: string, updates: Partial<DownloadTask>) => void;
  removeTask: (id: string) => void;
  startDownload: (id: string) => Promise<void>;
  cancelDownload: (id: string) => void;
}

// Target directory for audio files
export const REVERB_AUDIO_DIR = `${RNFS.DocumentDirectoryPath}/reverb_audio`;
// Target directory for artwork
export const REVERB_ARTWORK_DIR = `${RNFS.DocumentDirectoryPath}/reverb_artwork`;

const ensureDirectories = async () => {
  const audioExists = await RNFS.exists(REVERB_AUDIO_DIR);
  if (!audioExists) await RNFS.mkdir(REVERB_AUDIO_DIR);
  
  const artworkExists = await RNFS.exists(REVERB_ARTWORK_DIR);
  if (!artworkExists) await RNFS.mkdir(REVERB_ARTWORK_DIR);
};

export const useDownloadManager = create<DownloadManagerState>((set, get) => ({
  tasks: {},
  
  addTask: (id, url, title, artist) => {
    set(state => ({
      tasks: {
        ...state.tasks,
        [id]: {
          id, url, title, artist,
          status: 'queued',
          progress: 0,
          bytesDownloaded: 0,
          bytesTotal: 0
        }
      }
    }));
  },

  updateTask: (id, updates) => {
    set(state => ({
      tasks: {
        ...state.tasks,
        [id]: { ...state.tasks[id], ...updates }
      }
    }));
  },

  removeTask: (id) => {
    set(state => {
      const newTasks = { ...state.tasks };
      delete newTasks[id];
      return { tasks: newTasks };
    });
  },

  startDownload: async (id) => {
    const task = get().tasks[id];
    if (!task) return;

    await ensureDirectories();
    
    // Robust extension extraction
    let ext = 'mp3'; // default
    try {
      const urlWithoutQuery = task.url.split('?')[0];
      const urlParts = urlWithoutQuery.split('.');
      if (urlParts.length > 1) {
        const potentialExt = urlParts.pop();
        // Check if it's a valid extension length and contains no slashes
        if (potentialExt && potentialExt.length <= 4 && !potentialExt.includes('/')) {
          ext = potentialExt;
        } else if (task.url.includes('mime=audio%2Fmp4') || task.url.includes('mime=audio/mp4')) {
          ext = 'm4a';
        } else if (task.url.includes('mime=audio%2Fwebm') || task.url.includes('mime=audio/webm')) {
          ext = 'webm';
        }
      }
    } catch (e) {}

    const localPath = `${REVERB_AUDIO_DIR}/${id}.${ext}`;

    try {
      get().updateTask(id, { status: 'downloading', localAudioPath: localPath });

      const options: RNFS.DownloadFileOptions = {
        fromUrl: task.url,
        toFile: localPath,
        progressDivider: 2, // Update progress less frequently
        begin: (res) => {
          get().updateTask(id, { bytesTotal: res.contentLength });
        },
        progress: (res) => {
          const progress = res.bytesWritten / res.contentLength;
          get().updateTask(id, { 
            progress, 
            bytesDownloaded: res.bytesWritten,
            bytesTotal: res.contentLength 
          });
        }
      };

      const ret = RNFS.downloadFile(options);
      get().updateTask(id, { jobId: ret.jobId });
      
      const result = await ret.promise;
      
      if (result.statusCode === 200) {
        get().updateTask(id, { status: 'completed', progress: 1 });
        
        // Add to Library
        const { useLibraryStore } = require('../../store/libraryStore');
        await useLibraryStore.getState().addDownloadedSong({
          id,
          title: task.title,
          artist: task.artist,
          album: 'Downloads',
          duration: 0,
          localPath: localPath,
          artworkPath: '',
          sourceType: 'authorized_download',
          sourceUrl: task.url,
          isFavorite: false,
          playCount: 0,
          timestamps: new Date().toISOString()
        });

      } else {
        throw new Error(`Download failed with status ${result.statusCode}`);
      }
    } catch (e: any) {
      if (e.message?.includes('cancelled')) {
        get().updateTask(id, { status: 'cancelled' });
      } else {
        get().updateTask(id, { status: 'failed', error: e.message || 'Download failed' });
      }
    }
  },

  cancelDownload: (id) => {
    const task = get().tasks[id];
    if (task && task.jobId && task.status === 'downloading') {
      RNFS.stopDownload(task.jobId);
    }
  }
}));

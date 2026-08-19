import DocumentPicker from 'react-native-document-picker';
import { extractMetadata } from '../../services/metadata';
import { copyFileToAppStorage, generateId } from '../../services/filesystem';
import { addSong, getAllSongs, Song } from '../../database/repositories/SongRepository';

import { requestStoragePermission } from '../../services/permissions';
import { useLibraryStore } from '../../store/libraryStore';

export const importLocalMusic = async (): Promise<void> => {
  try {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) return;

    const results = await DocumentPicker.pick({
      allowMultiSelection: true,
      type: [DocumentPicker.types.audio],
      copyTo: 'cachesDirectory',
    });

    const existingSongs = await getAllSongs();
    const existingFileNames = new Set(existingSongs.map((s) => s.localPath.split('/').pop()));

    for (const file of results) {
      if (!file.fileCopyUri || !file.name) continue;
      
      // Duplicate detection
      if (existingFileNames.has(file.name)) {
        console.log(`Song ${file.name} already exists.`);
        continue;
      }

      // Copy audio to local storage
      const localAudioPath = await copyFileToAppStorage(file.fileCopyUri, file.name, 'audio');

      // Extract metadata (which now includes artwork extraction via native module)
      const metadata = await extractMetadata(localAudioPath);

      const artworkPath = metadata.artworkPath;

      const song: Song = {
        id: generateId(),
        title: metadata.title || file.name.replace(/\.[^/.]+$/, ""), // fallback to filename
        artist: metadata.artist || 'Unknown Artist',
        album: metadata.album || 'Unknown Album',
        duration: metadata.duration || 0,
        localPath: localAudioPath,
        artworkPath,
        sourceType: 'local',
        sourceUrl: '',
        isFavorite: false,
        playCount: 0,
        timestamps: new Date().toISOString(),
      };

      await addSong(song);
    }
    
    // Refresh the library store
    useLibraryStore.getState().loadLibrary();
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      // User cancelled the picker
    } else {
      console.error('Error importing music:', err);
      throw err;
    }
  }
};

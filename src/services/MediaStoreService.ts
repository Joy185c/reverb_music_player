import { NativeModules, Platform, PermissionsAndroid } from 'react-native';
import { bulkUpsertSongs, deleteMissingSongs, Song } from '../database/repositories/SongRepository';
import { useLibraryStore } from '../store/libraryStore';

const { MediaStoreModule } = NativeModules;

export const requestMediaPermissions = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return false;

  try {
    if (Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        {
          title: 'Music Permission',
          message: 'REVERB needs access to your music library to play your songs.',
          buttonPositive: 'Allow',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'REVERB needs access to your storage to find your music.',
          buttonPositive: 'Allow',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
};

export const syncDeviceMusic = async (): Promise<void> => {
  if (Platform.OS !== 'android') return;

  const hasPermission = await requestMediaPermissions();
  if (!hasPermission) return;

  try {
    const audioFiles: any[] = await MediaStoreModule.getAudioFiles();
    
    if (audioFiles && audioFiles.length > 0) {
      const currentDeviceSongIds = audioFiles.map(f => f.id);
      
      const songsToUpsert: Song[] = audioFiles.map(file => ({
        id: file.id,
        title: file.title,
        artist: file.artist,
        album: file.album,
        duration: file.duration,
        sourceUrl: file.sourceUrl, // The content:// URI
        localPath: file.localPath, // Absolute path, useful for some fallbacks
        artworkPath: file.artworkPath, // The album art content URI
        sourceType: 'local',
        isFavorite: false,
        playCount: 0,
        timestamps: new Date().toISOString(),
      }));

      await bulkUpsertSongs(songsToUpsert);
      await deleteMissingSongs(currentDeviceSongIds);
      
      // Refresh the library store
      await useLibraryStore.getState().loadLibrary();
    }
  } catch (error) {
    console.error('Failed to sync device music:', error);
  }
};

import { getAllSongs } from '../../database/repositories/SongRepository';
import { getAllPlaylists } from '../../database/repositories/PlaylistRepository';
import RNFS from 'react-native-fs';
import { BACKUPS_DIR } from '../../services/filesystem';

export const exportLibrary = async (includeAudioFiles: boolean = false): Promise<string> => {
  const songs = await getAllSongs();
  const playlists = await getAllPlaylists();
  
  const backupData = {
    version: 1,
    timestamp: new Date().toISOString(),
    songs,
    playlists,
  };

  const backupJson = JSON.stringify(backupData, null, 2);
  const backupFilePath = `${BACKUPS_DIR}/reverb_backup_${Date.now()}.json`;

  await RNFS.writeFile(backupFilePath, backupJson, 'utf8');

  if (includeAudioFiles) {
    // In a real implementation, we would zip the JSON and audio files together.
    // For now, we just export the JSON since it contains the metadata.
    console.log('Full backup requested (JSON + Files).');
  }

  return backupFilePath;
};

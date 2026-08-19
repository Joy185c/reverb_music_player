import RNFS from 'react-native-fs';

const APP_DIR = `${RNFS.DocumentDirectoryPath}/REVERB`;
export const AUDIO_DIR = `${APP_DIR}/audio`;
export const ARTWORK_DIR = `${APP_DIR}/artwork`;
export const BACKUPS_DIR = `${APP_DIR}/backups`;

export const initFileSystem = async (): Promise<void> => {
  const dirs = [APP_DIR, AUDIO_DIR, ARTWORK_DIR, BACKUPS_DIR];
  for (const dir of dirs) {
    const exists = await RNFS.exists(dir);
    if (!exists) {
      await RNFS.mkdir(dir);
    }
  }
};

export const copyFileToAppStorage = async (
  sourceUri: string,
  fileName: string,
  destinationDir: 'audio' | 'artwork'
): Promise<string> => {
  const targetDir = destinationDir === 'audio' ? AUDIO_DIR : ARTWORK_DIR;
  const targetPath = `${targetDir}/${fileName}`;

  const exists = await RNFS.exists(targetPath);
  if (!exists) {
    await RNFS.copyFile(sourceUri, targetPath);
  }

  return targetPath;
};

export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

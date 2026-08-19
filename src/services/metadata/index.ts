import { NativeModules } from 'react-native';

const { MetadataRetriever } = NativeModules;

export interface AudioMetadata {
  title: string;
  artist: string;
  album: string;
  duration: number; // in milliseconds
  artworkPath: string;
}

export const extractMetadata = async (filePath: string): Promise<AudioMetadata> => {
  try {
    const metadata = await MetadataRetriever.getMetadata(filePath);
    return metadata as AudioMetadata;
  } catch (error) {
    console.error('Error extracting metadata from', filePath, error);
    return {
      title: 'Unknown Title',
      artist: 'Unknown Artist',
      album: 'Unknown Album',
      duration: 0,
      artworkPath: '',
    };
  }
};

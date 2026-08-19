export interface LinkProvider {
  name: string;
  canHandle(url: string): boolean;
  resolveMetadata(url: string): Promise<ResolvedLinkMetadata>;
}

export interface ResolvedLinkMetadata {
  title: string;
  artist: string;
  artworkUrl?: string;
  duration: number;
  streamUrl: string;
  isDownloadable: boolean;
  sourceType: 'remote' | 'authorized_download';
}

import { YouTubeProvider } from './providers/YouTubeProvider';

const providers: LinkProvider[] = [];

export const registerProvider = (provider: LinkProvider) => {
  providers.push(provider);
};

// Register default providers
registerProvider(new YouTubeProvider());

export const resolveLink = async (url: string): Promise<ResolvedLinkMetadata> => {
  for (const provider of providers) {
    if (provider.canHandle(url)) {
      return await provider.resolveMetadata(url);
    }
  }
  throw new Error('No provider found for this URL.');
};

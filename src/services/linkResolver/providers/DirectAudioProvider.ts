import { LinkProvider, ResolvedLinkMetadata } from '../index';

export class DirectAudioProvider implements LinkProvider {
  name = 'Direct Audio';

  canHandle(url: string): boolean {
    const lowerUrl = url.toLowerCase();
    return lowerUrl.endsWith('.mp3') || lowerUrl.endsWith('.m4a') || lowerUrl.endsWith('.aac') || lowerUrl.endsWith('.wav');
  }

  async resolveMetadata(url: string): Promise<ResolvedLinkMetadata> {
    try {
      // Validate the remote file by fetching HEAD
      const response = await fetch(url, { method: 'HEAD' });
      
      if (!response.ok) {
        throw new Error('Audio file unavailable or inaccessible');
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('audio/')) {
        throw new Error('Link does not point to a valid audio file');
      }

      // Try to extract a title from the URL
      const urlParts = url.split('/');
      let filename = urlParts[urlParts.length - 1];
      filename = decodeURIComponent(filename).replace(/\.[^/.]+$/, ""); // Remove extension
      filename = filename.replace(/[_-]/g, ' '); // Clean up underscores/dashes

      return {
        title: filename || 'Unknown Audio',
        artist: 'Direct Link',
        duration: 0, // Cannot easily get duration without downloading or range requests
        streamUrl: url,
        isDownloadable: true,
        sourceType: 'authorized_download'
      };
    } catch (e: any) {
      throw new Error(e.message || 'Failed to validate the audio link.');
    }
  }
}

import { LinkProvider, ResolvedLinkMetadata } from '../index';

export class YouTubeProvider implements LinkProvider {
  name = 'YouTube';

  canHandle(url: string): boolean {
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  async resolveMetadata(url: string): Promise<ResolvedLinkMetadata> {
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
      if (!response.ok) {
        throw new Error('Video unavailable or private');
      }
      
      const data = await response.json();
      
      let audioUrl = url;
      let duration = 0;
      let title = data.title || 'YouTube Audio';
      let artist = data.author_name || 'YouTube';
      let artworkUrl = data.thumbnail_url;

      try {
        // We use our local Node.js proxy server via adb reverse tcp:3000 tcp:3000
        // This is 100% reliable and doesn't crash the React Native bundler
        const proxyUrl = `http://10.245.227.145:3000/api/stream?url=${encodeURIComponent(url)}`;
        const proxyResponse = await fetch(proxyUrl);
        
        if (proxyResponse.ok) {
          const proxyData = await proxyResponse.json();
          if (proxyData.streamUrl) {
            audioUrl = proxyData.streamUrl;
            title = proxyData.title || title;
            artist = proxyData.artist || artist;
            if (proxyData.thumbnail) artworkUrl = proxyData.thumbnail;
          }
        } else {
          console.warn('Proxy server returned error:', await proxyResponse.text());
        }
      } catch (proxyError) {
        console.warn('Failed to connect to proxy server (make sure server is running and adb reverse tcp:3000 tcp:3000 is active):', proxyError);
      }
      
      return {
        title,
        artist,
        artworkUrl,
        duration,
        streamUrl: audioUrl,
        isDownloadable: true,
        sourceType: 'remote'
      };
    } catch (e) {
      throw new Error('Failed to fetch YouTube metadata. Make sure the video is public.');
    }
  }
}

const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');

const app = express();
app.use(cors());

app.get('/api/stream', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const youtubedl = require('youtube-dl-exec');
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: [
        'referer:youtube.com',
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });
    
    // Find highest quality audio format
    const audioFormats = info.formats.filter(f => f.acodec !== 'none' && f.vcodec === 'none');
    audioFormats.sort((a, b) => (b.abr || 0) - (a.abr || 0));
    
    if (audioFormats.length > 0) {
      return res.json({
        streamUrl: audioFormats[0].url,
        title: info.title,
        artist: info.uploader,
        thumbnail: info.thumbnail
      });
    } else {
      return res.status(404).json({ error: 'No audio formats found' });
    }
  } catch (error) {
    console.error('youtube-dl-exec error:', error);
    return res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`YouTube Extraction Server running on port ${PORT}`);
});

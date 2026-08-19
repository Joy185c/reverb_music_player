import { getDB } from '../sqlite';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  localPath: string;
  artworkPath: string;
  sourceType: 'local' | 'authorized_download' | 'remote';
  sourceUrl: string;
  isFavorite: boolean;
  playCount: number;
  timestamps: string;
}

export const addSong = async (song: Song): Promise<void> => {
  const db = await getDB();
  await db.executeSql(
    `INSERT OR REPLACE INTO songs 
    (id, title, artist, album, duration, localPath, artworkPath, sourceType, sourceUrl, isFavorite, playCount, timestamps) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      song.id,
      song.title,
      song.artist,
      song.album,
      song.duration,
      song.localPath,
      song.artworkPath,
      song.sourceType,
      song.sourceUrl,
      song.isFavorite ? 1 : 0,
      song.playCount,
      song.timestamps,
    ]
  );
};

export const getAllSongs = async (): Promise<Song[]> => {
  const db = await getDB();
  const [results] = await db.executeSql('SELECT * FROM songs');
  const songs: Song[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    const row = results.rows.item(i);
    songs.push({
      ...row,
      isFavorite: row.isFavorite === 1,
    });
  }
  return songs;
};

export const toggleFavorite = async (songId: string, isFavorite: boolean): Promise<void> => {
  const db = await getDB();
  await db.executeSql('UPDATE songs SET isFavorite = ? WHERE id = ?', [isFavorite ? 1 : 0, songId]);
};

export const deleteSong = async (songId: string): Promise<void> => {
  const db = await getDB();
  await db.executeSql('DELETE FROM songs WHERE id = ?', [songId]);
};

import { getDB } from '../sqlite';
import { Song } from './SongRepository';

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverPath: string;
  createdAt: number;
  updatedAt: number;
}

export const createPlaylist = async (playlist: Playlist): Promise<void> => {
  const db = await getDB();
  await db.executeSql(
    'INSERT INTO playlists (id, name, description, coverPath, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
    [playlist.id, playlist.name, playlist.description, playlist.coverPath, playlist.createdAt, playlist.updatedAt]
  );
};

export const getAllPlaylists = async (): Promise<Playlist[]> => {
  const db = await getDB();
  const [results] = await db.executeSql('SELECT * FROM playlists ORDER BY createdAt DESC');
  const playlists: Playlist[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    playlists.push(results.rows.item(i));
  }
  return playlists;
};

export const addSongToPlaylist = async (playlistId: string, songId: string, position: number): Promise<void> => {
  const db = await getDB();
  await db.executeSql('INSERT INTO playlist_songs (playlistId, songId, position) VALUES (?, ?, ?)', [
    playlistId,
    songId,
    position,
  ]);
};

export const getSongsForPlaylist = async (playlistId: string): Promise<Song[]> => {
  const db = await getDB();
  const [results] = await db.executeSql(
    `SELECT s.* FROM songs s
     INNER JOIN playlist_songs ps ON s.id = ps.songId
     WHERE ps.playlistId = ?
     ORDER BY ps.position ASC`,
    [playlistId]
  );
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

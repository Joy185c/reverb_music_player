import { getDB } from '../sqlite';

export interface PlayHistory {
  id: string;
  songId: string;
  playedAt: number;
  durationPlayed: number;
}

export const addPlayHistory = async (history: PlayHistory): Promise<void> => {
  const db = await getDB();
  await db.executeSql('INSERT INTO play_history (id, songId, playedAt, durationPlayed) VALUES (?, ?, ?, ?)', [
    history.id,
    history.songId,
    history.playedAt,
    history.durationPlayed,
  ]);
};

export const getLatestPlayedSongId = async (): Promise<string | null> => {
  const db = await getDB();
  const [results] = await db.executeSql('SELECT songId FROM play_history ORDER BY playedAt DESC LIMIT 1');
  if (results.rows.length > 0) {
    return results.rows.item(0).songId;
  }
  return null;
};

export const getRecentlyPlayedSongIds = async (limit: number): Promise<string[]> => {
  const db = await getDB();
  // Using DISTINCT on songId isn't straightforward without a group by, but we want the most recent per song.
  // SQLite doesn't support SELECT DISTINCT songId ORDER BY playedAt easily.
  // We can use a GROUP BY with MAX(playedAt)
  const [results] = await db.executeSql(`
    SELECT songId 
    FROM play_history 
    GROUP BY songId 
    ORDER BY MAX(playedAt) DESC 
    LIMIT ?
  `, [limit]);
  
  const songIds: string[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    songIds.push(results.rows.item(i).songId);
  }
  return songIds;
};

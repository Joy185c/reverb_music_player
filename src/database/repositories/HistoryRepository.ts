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

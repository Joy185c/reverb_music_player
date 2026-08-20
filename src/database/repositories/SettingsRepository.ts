import { getDB } from '../sqlite';

export const getSetting = async (key: string): Promise<string | null> => {
  const db = await getDB();
  const [results] = await db.executeSql('SELECT value FROM settings WHERE key = ?', [key]);
  if (results.rows.length > 0) {
    return results.rows.item(0).value;
  }
  return null;
};

export const setSetting = async (key: string, value: string | null): Promise<void> => {
  const db = await getDB();
  if (value === null) {
    await db.executeSql('DELETE FROM settings WHERE key = ?', [key]);
  } else {
    await db.executeSql(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      [key, value]
    );
  }
};

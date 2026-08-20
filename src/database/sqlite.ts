import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const DATABASE_NAME = 'Reverb.db';
const DATABASE_VERSION = 1;

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDB = async (): Promise<SQLite.SQLiteDatabase> => {
  if (dbInstance) {
    return dbInstance;
  }
  dbInstance = await SQLite.openDatabase({ name: DATABASE_NAME, location: 'default' });
  return dbInstance;
};

export const initDB = async (): Promise<void> => {
  try {
    const db = await getDB();

    await db.transaction((tx) => {
      // 1. Songs Table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS songs (
          id TEXT PRIMARY KEY,
          title TEXT,
          artist TEXT,
          album TEXT,
          duration INTEGER,
          localPath TEXT,
          artworkPath TEXT,
          sourceType TEXT, -- 'local', 'authorized_download', 'remote'
          sourceUrl TEXT,
          isFavorite INTEGER DEFAULT 0,
          playCount INTEGER DEFAULT 0,
          timestamps TEXT
        )
      `);

      // 2. Playlists Table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS playlists (
          id TEXT PRIMARY KEY,
          name TEXT,
          description TEXT,
          coverPath TEXT,
          createdAt INTEGER,
          updatedAt INTEGER
        )
      `);

      // 3. Playlist Songs Junction Table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS playlist_songs (
          playlistId TEXT,
          songId TEXT,
          position INTEGER,
          PRIMARY KEY (playlistId, songId),
          FOREIGN KEY (playlistId) REFERENCES playlists(id) ON DELETE CASCADE,
          FOREIGN KEY (songId) REFERENCES songs(id) ON DELETE CASCADE
        )
      `);

      // 4. Play History Table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS play_history (
          id TEXT PRIMARY KEY,
          songId TEXT,
          playedAt INTEGER,
          durationPlayed INTEGER,
          FOREIGN KEY (songId) REFERENCES songs(id) ON DELETE CASCADE
        )
      `);

      // 5. Downloads Table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS downloads (
          id TEXT PRIMARY KEY,
          songId TEXT,
          sourceUrl TEXT,
          status TEXT,
          progress REAL,
          localPath TEXT,
          createdAt INTEGER,
          completedAt INTEGER
        )
      `);

      // 6. Settings Table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
        )
      `);
    });

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database', error);
    throw error;
  }
};

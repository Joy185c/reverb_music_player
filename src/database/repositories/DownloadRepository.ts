import { getDB } from '../sqlite';

export interface DownloadInfo {
  id: string;
  songId: string;
  sourceUrl: string;
  status: 'downloading' | 'completed' | 'failed';
  progress: number;
  localPath: string;
  createdAt: number;
  completedAt?: number;
}

export const upsertDownload = async (download: DownloadInfo): Promise<void> => {
  const db = await getDB();
  await db.executeSql(
    `INSERT OR REPLACE INTO downloads (id, songId, sourceUrl, status, progress, localPath, createdAt, completedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      download.id,
      download.songId,
      download.sourceUrl,
      download.status,
      download.progress,
      download.localPath,
      download.createdAt,
      download.completedAt || null,
    ]
  );
};

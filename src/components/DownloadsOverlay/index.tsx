import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useDownloadManager } from '../../services/downloader/DownloadManager';
import { colors } from '../../theme/colors';
import { X } from 'lucide-react-native';

export const DownloadsOverlay = () => {
  const { tasks, cancelDownload, removeTask } = useDownloadManager();
  
  // Only show downloading or failed tasks
  const activeTasks = Object.values(tasks).filter(
    t => t.status === 'downloading' || t.status === 'queued' || t.status === 'failed'
  );

  if (activeTasks.length === 0) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <View className="absolute bottom-[130px] left-4 right-4 z-50">
      {activeTasks.map(task => (
        <View 
          key={task.id} 
          className="bg-surface rounded-2xl border border-[#1a382e] p-4 mb-2 shadow-lg"
        >
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-1 mr-2">
              <Text className="text-primaryText font-bold text-sm" numberOfLines={1}>{task.title}</Text>
              <Text className="text-secondaryText text-xs">
                {task.status === 'downloading' ? 'Downloading...' : task.status === 'failed' ? 'Failed' : 'Queued'}
              </Text>
            </View>
            
            <TouchableOpacity 
              onPress={() => task.status === 'failed' ? removeTask(task.id) : cancelDownload(task.id)}
              className="p-1"
            >
              <X color={colors.secondaryText} size={20} />
            </TouchableOpacity>
          </View>
          
          {task.status === 'downloading' && (
            <View>
              <View className="h-1.5 bg-background rounded-full w-full mb-1 overflow-hidden">
                <View 
                  className="h-full bg-accent rounded-full" 
                  style={{ width: `${task.progress * 100}%` }} 
                />
              </View>
              <View className="flex-row justify-between">
                <Text className="text-secondaryText text-[10px]">
                  {formatBytes(task.bytesDownloaded)} / {formatBytes(task.bytesTotal)}
                </Text>
                <Text className="text-secondaryText text-[10px]">
                  {Math.round(task.progress * 100)}%
                </Text>
              </View>
            </View>
          )}

          {task.status === 'failed' && (
            <Text className="text-[#ff4444] text-xs mt-1">{task.error}</Text>
          )}
        </View>
      ))}
    </View>
  );
};

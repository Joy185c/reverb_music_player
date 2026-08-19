import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { exportLibrary } from '../../features/backup/BackupManager';
import { DownloadCloud, Info } from 'lucide-react-native';
import { colors } from '../../theme/colors';

export const Settings = () => {
  const handleBackup = async () => {
    try {
      const backupPath = await exportLibrary(false);
      Alert.alert('Backup Successful', `Your library data was exported to:\n\n${backupPath}`);
    } catch (e) {
      console.error(e);
      Alert.alert('Backup Failed', 'An error occurred while creating the backup.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 pt-6 flex-1">
        <Text className="text-primaryText text-3xl font-bold mb-6">Settings</Text>
        
        <Text className="text-primaryText text-lg font-semibold mb-4">Data Management</Text>
        <TouchableOpacity 
          onPress={handleBackup}
          className="bg-surface p-4 rounded-2xl flex-row items-center justify-between mb-4"
        >
          <View className="flex-row items-center">
            <DownloadCloud color={colors.accent} size={24} />
            <Text className="text-primaryText font-medium text-base ml-3">Export Library Backup</Text>
          </View>
        </TouchableOpacity>

        <View className="bg-[#132d23] p-4 rounded-2xl flex-row items-center mb-8">
          <Info color={colors.secondaryText} size={24} />
          <Text className="text-secondaryText text-sm ml-3 flex-1">
            Backups only export your playlists and song metadata. Audio files are stored separately in the app's secure storage.
          </Text>
        </View>

        <Text className="text-primaryText text-lg font-semibold mb-4">About</Text>
        <View className="bg-surface p-4 rounded-2xl mb-4">
          <Text className="text-primaryText font-medium text-base">REVERB Music Player</Text>
          <Text className="text-secondaryText mt-1 text-sm">Version 1.0.0</Text>
          <Text className="text-secondaryText mt-2 text-sm">Offline-first, ad-free, minimal.</Text>
        </View>

      </View>
    </SafeAreaView>
  );
};

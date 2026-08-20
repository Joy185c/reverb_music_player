import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Alert, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { exportLibrary } from '../../features/backup/BackupManager';
import { DownloadCloud, Info, User } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useSettingsStore } from '../../store/settingsStore';

export const Settings = () => {
  const { userName, updateUserName } = useSettingsStore();
  const [nameInput, setNameInput] = useState(userName || '');

  const handleBackup = async () => {
    try {
      const backupPath = await exportLibrary(false);
      Alert.alert('Backup Successful', `Your library data was exported to:\n\n${backupPath}`);
    } catch (e) {
      console.error(e);
      Alert.alert('Backup Failed', 'An error occurred while creating the backup.');
    }
  };

  const handleSaveName = async () => {
    const newName = nameInput.trim();
    await updateUserName(newName === '' ? null : newName);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="px-4 pt-6 flex-1">
          <Text className="text-primaryText text-3xl font-bold mb-6">Settings</Text>
          
          <Text className="text-primaryText text-lg font-semibold mb-4">Personalization</Text>
          <View className="bg-surface p-4 rounded-2xl mb-8">
            <Text className="text-secondaryText text-sm mb-2">Your Name</Text>
            <View className="flex-row items-center border-b border-[#2A4438] pb-2">
              <User color={colors.accent} size={20} />
              <TextInput 
                className="flex-1 text-primaryText ml-3 text-base"
                placeholder="Enter your name"
                placeholderTextColor={colors.secondaryText}
                value={nameInput}
                onChangeText={setNameInput}
                onBlur={handleSaveName}
                onSubmitEditing={handleSaveName}
                returnKeyType="done"
              />
            </View>
            <Text className="text-secondaryText text-xs mt-2">
              Used to personalize your Home page greeting.
            </Text>
          </View>

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

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

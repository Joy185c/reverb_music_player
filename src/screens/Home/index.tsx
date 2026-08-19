import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useLibraryStore } from '../../store/libraryStore';
import { importLocalMusic } from '../../features/library/LibraryManager';
import { Search as SearchIcon, Plus, Link } from 'lucide-react-native';
import { colors } from '../../theme/colors';

export const Home = () => {
  const { songs } = useLibraryStore();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-6">
        <Text className="text-primaryText text-3xl font-bold mb-6">Good evening, Yuv</Text>

        {/* Search Bar Placeholder */}
        <View className="bg-surface rounded-2xl flex-row items-center px-4 py-3 mb-8">
          <SearchIcon color={colors.secondaryText} size={20} />
          <Text className="text-secondaryText ml-3 text-lg">Search</Text>
        </View>

        {/* Library Summary */}
        <Text className="text-primaryText text-xl font-semibold mb-2">Your Library</Text>
        <View className="h-[1px] bg-surface w-full mb-4" />
        <View className="flex-row items-center mb-8">
          <Text className="text-primaryText font-medium text-base mr-6">{songs.length} Songs</Text>
          <Text className="text-secondaryText font-medium text-base">0 Offline</Text>
        </View>

        {/* Quick Actions */}
        <Text className="text-primaryText text-xl font-semibold mb-2">Quick Actions</Text>
        <View className="h-[1px] bg-surface w-full mb-4" />
        <View className="flex-row gap-4 mb-8">
          <TouchableOpacity 
            onPress={importLocalMusic}
            className="bg-surface rounded-2xl flex-1 py-4 flex-row justify-center items-center"
          >
            <Plus color={colors.accent} size={24} />
            <Text className="text-primaryText font-medium ml-2">Add Music</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-surface rounded-2xl flex-1 py-4 flex-row justify-center items-center">
            <Link color={colors.accent} size={24} />
            <Text className="text-primaryText font-medium ml-2">Add Link</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

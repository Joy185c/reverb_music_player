import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { usePlayerStore } from '../../store/playerStore';
import { useNavigation } from '@react-navigation/native';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useProgress } from 'react-native-track-player';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export const Player = () => {
  const { activeTrack, isPlaying, pause, resume, skipToNext, skipToPrevious, seekTo, toggleShuffle, toggleRepeat, isShuffle, repeatMode } = usePlayerStore();
  const navigation = useNavigation();
  const { position, duration } = useProgress();

  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 pt-4 flex-1">
        
        {/* Header */}
        <View className="flex-row items-center justify-between mb-10">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronDown color={colors.primaryText} size={28} />
          </TouchableOpacity>
          <Text className="text-secondaryText text-sm tracking-widest font-semibold uppercase">Now Playing</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Artwork */}
        <View className="w-full aspect-square bg-surface rounded-3xl mb-12 items-center justify-center overflow-hidden">
          {activeTrack?.artwork ? (
            <Image source={{ uri: activeTrack.artwork }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <Text className="text-secondaryText">Artwork</Text>
          )}
        </View>

        {/* Info */}
        <View className="mb-8">
          <Text className="text-primaryText text-2xl font-bold mb-1" numberOfLines={1}>
            {activeTrack?.title || 'Not Playing'}
          </Text>
          <Text className="text-accent text-lg" numberOfLines={1}>
            {activeTrack?.artist || 'Unknown Artist'}
          </Text>
        </View>

        {/* Progress */}
        <View className="mb-10">
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={(e) => {
              // Basic seek logic: assumes full width tap
              // A real slider component (like @react-native-community/slider) is better for production, 
              // but this is a placeholder for custom touch logic.
              // We'll leave it as non-seekable in this iteration unless using a Slider.
            }}
          >
            <View className="h-1 bg-surface rounded-full w-full mb-2">
               <View className="h-full bg-accent rounded-full" style={{ width: `${progressPercent}%` }} />
            </View>
          </TouchableOpacity>
          <View className="flex-row justify-between">
            <Text className="text-secondaryText text-xs">{formatTime(position)}</Text>
            <Text className="text-secondaryText text-xs">{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={toggleShuffle}>
            <Shuffle color={isShuffle ? colors.accent : colors.secondaryText} size={24} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={skipToPrevious}>
            <SkipBack color={colors.primaryText} size={32} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={isPlaying ? pause : resume}
            className="w-20 h-20 rounded-full bg-accent items-center justify-center"
          >
            {isPlaying ? (
              <Pause color={colors.background} size={32} fill={colors.background} />
            ) : (
              <Play color={colors.background} size={32} fill={colors.background} style={{ marginLeft: 4 }} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={skipToNext}>
            <SkipForward color={colors.primaryText} size={32} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={toggleRepeat}>
            <Repeat color={repeatMode !== 0 ? colors.accent : colors.secondaryText} size={24} />
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

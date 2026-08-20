import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { usePlayerStore } from '../../store/playerStore';
import { useNavigation } from '@react-navigation/native';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useProgress } from 'react-native-track-player';

import { SleepTimerModal } from '../../components/SleepTimerModal';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const formatRemainingTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

import { useLibraryStore, useIsFavorite } from '../../store/libraryStore';

const FavoriteButton = ({ songId }: { songId: string }) => {
  const isFavorite = useIsFavorite(songId);
  const toggle = useLibraryStore(s => s.toggleFavoriteStatus);
  return (
    <TouchableOpacity onPress={() => toggle(songId, isFavorite)} className="p-2">
      <Text className={isFavorite ? "text-accent text-2xl" : "text-secondaryText text-2xl"}>
        {isFavorite ? '❤️' : '🤍'}
      </Text>
    </TouchableOpacity>
  );
};

export const Player = () => {
  const { activeTrack, isPlaying, pause, resume, skipToNext, skipToPrevious, seekTo, toggleShuffle, toggleRepeat, isShuffle, repeatMode, sleepTimerEndTime } = usePlayerStore();
  const navigation = useNavigation();
  const { position, duration } = useProgress();
  
  const [timerModalVisible, setTimerModalVisible] = React.useState(false);
  const [timeRemainingStr, setTimeRemainingStr] = React.useState('');

  React.useEffect(() => {
    let interval: any;
    if (sleepTimerEndTime) {
      interval = setInterval(() => {
        const remaining = sleepTimerEndTime - Date.now();
        if (remaining > 0) {
          setTimeRemainingStr(formatRemainingTime(remaining));
        } else {
          setTimeRemainingStr('');
        }
      }, 1000);
    } else {
      setTimeRemainingStr('');
    }
    return () => clearInterval(interval);
  }, [sleepTimerEndTime]);

  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 pt-4 flex-1">
        
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronDown color={colors.primaryText} size={28} />
          </TouchableOpacity>
          <Text className="text-secondaryText text-sm tracking-widest font-semibold uppercase">Now Playing</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Timer Display */}
        <View className="items-center mb-6 h-8 justify-center">
          {sleepTimerEndTime ? (
            <TouchableOpacity onPress={() => setTimerModalVisible(true)} className="bg-surface px-4 py-1.5 rounded-full flex-row items-center">
              <Text className="text-accent font-medium text-xs">Sleep Timer · {timeRemainingStr} remaining</Text>
            </TouchableOpacity>
          ) : (
             <TouchableOpacity onPress={() => setTimerModalVisible(true)} className="px-4 py-1.5">
               <Text className="text-secondaryText text-xs font-medium">Set Sleep Timer</Text>
             </TouchableOpacity>
          )}
        </View>

        {/* Artwork */}
        <View className="w-full aspect-square bg-surface rounded-3xl mb-8 items-center justify-center overflow-hidden">
          {activeTrack?.artwork ? (
            <Image source={{ uri: activeTrack.artwork }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <Text className="text-secondaryText">Artwork</Text>
          )}
        </View>

        {/* Info */}
        <View className="mb-8 flex-row items-center justify-between">
          <View className="flex-1 mr-4">
            <Text className="text-primaryText text-2xl font-bold mb-1" numberOfLines={1}>
              {activeTrack?.title || 'Not Playing'}
            </Text>
            <Text className="text-accent text-lg" numberOfLines={1}>
              {activeTrack?.artist || 'Unknown Artist'}
            </Text>
          </View>
          {activeTrack && (
            <FavoriteButton songId={activeTrack.id} />
          )}
        </View>

        {/* Progress */}
        <View className="mb-10">
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={(e) => {}}
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
      <SleepTimerModal visible={timerModalVisible} onClose={() => setTimerModalVisible(false)} />
    </SafeAreaView>
  );
};

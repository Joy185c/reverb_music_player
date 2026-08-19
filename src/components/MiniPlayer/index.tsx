import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { usePlayerStore } from '../../store/playerStore';
import { useNavigation } from '@react-navigation/native';
import { Play, Pause } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useProgress } from 'react-native-track-player';

export const MiniPlayer = () => {
  const { activeTrack, isPlaying, pause, resume } = usePlayerStore();
  const navigation = useNavigation<any>();
  const { position, duration } = useProgress();

  if (!activeTrack) return null;
  
  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => navigation.navigate('Player')}
      className="absolute bottom-[65px] left-2 right-2 bg-surface rounded-2xl border border-[#1a382e] overflow-hidden"
      style={{ elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}
    >
      <View className="flex-row items-center p-2">
        <View className="w-12 h-12 bg-background rounded-xl mr-3 justify-center items-center overflow-hidden">
          {activeTrack.artwork ? (
            <Image source={{ uri: activeTrack.artwork }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <Text className="text-secondaryText text-xs">Art</Text>
          )}
        </View>
        
        <View className="flex-1 justify-center">
          <Text className="text-primaryText font-semibold text-sm" numberOfLines={1}>{activeTrack.title}</Text>
          <Text className="text-secondaryText text-xs mt-1" numberOfLines={1}>{activeTrack.artist}</Text>
        </View>

        <TouchableOpacity 
          onPress={isPlaying ? pause : resume}
          className="w-10 h-10 justify-center items-center mr-2"
        >
          {isPlaying ? (
            <Pause color={colors.primaryText} size={24} />
          ) : (
            <Play color={colors.primaryText} size={24} style={{ marginLeft: 2 }} />
          )}
        </TouchableOpacity>
      </View>
      {/* Progress Bar */}
      <View className="h-[2px] bg-[#1a382e] w-full absolute bottom-0 left-0 right-0">
         <View className="h-full bg-accent" style={{ width: `${progressPercent}%` }} />
      </View>
    </TouchableOpacity>
  );
};

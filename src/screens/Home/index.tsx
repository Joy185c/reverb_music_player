import React, { useMemo } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { useLibraryStore, useRecentSongs, useLibraryStats } from '../../store/libraryStore';
import { usePlayerStore } from '../../store/playerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { importLocalMusic } from '../../features/library/LibraryManager';
import { Search as SearchIcon, Plus, Link, Play, Pause, ChevronRight } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { getArtworkUri } from '../../utils/image';

const getGreeting = (name: string | null) => {
  const hour = new Date().getHours();
  let greeting = 'Good Evening';
  if (hour < 12) greeting = 'Good Morning';
  else if (hour < 17) greeting = 'Good Afternoon';
  else if (hour < 20) greeting = 'Good Evening';
  else greeting = 'Good Night';
  
  return name ? `${greeting}, ${name}` : greeting;
};

import { AddToPlaylistModal } from '../../components/AddToPlaylistModal';
import { useIsFavorite } from '../../store/libraryStore';
import { Song } from '../../database/repositories/SongRepository';
import { MoreVertical } from 'lucide-react-native';

const HomeSongItem = ({ song, onAddToPlaylist }: { song: Song, onAddToPlaylist: (song: Song) => void }) => {
  const { playSong } = usePlayerStore();
  const isFavorite = useIsFavorite(song.id);
  const toggle = useLibraryStore(s => s.toggleFavoriteStatus);

  return (
    <TouchableOpacity 
      onPress={() => playSong(song)}
      className="flex-row items-center"
    >
      <View className="w-14 h-14 bg-surface rounded-xl overflow-hidden mr-4">
        {song.artworkPath ? (
          <Image 
            source={{ uri: getArtworkUri(song.artworkPath) }} 
            className="w-full h-full" 
          />
        ) : (
          <View className="w-full h-full bg-[#1A3326] items-center justify-center">
            <Text className="text-primaryText font-bold text-lg">{song.title.charAt(0)}</Text>
          </View>
        )}
      </View>
      <View className="flex-1 mr-2">
        <Text className="text-primaryText font-semibold text-base mb-1" numberOfLines={1}>{song.title}</Text>
        <Text className="text-secondaryText text-sm" numberOfLines={1}>{song.artist}</Text>
      </View>
      <TouchableOpacity onPress={() => toggle(song.id, isFavorite)} className="p-2">
        <Text className={isFavorite ? "text-accent text-lg" : "text-secondaryText text-lg"}>
          {isFavorite ? '❤️' : '🤍'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onAddToPlaylist(song)} className="p-2">
         <MoreVertical color={colors.secondaryText} size={20} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export const Home = () => {
  const { songs } = useLibraryStore();
  const { activeTrack, isPlaying, resume, pause, playSong } = usePlayerStore();
  const { userName } = useSettingsStore();
  const recentSongs = useRecentSongs(8);
  const stats = useLibraryStats();
  const navigation = useNavigation<any>();

  const [addToPlaylistModalVisible, setAddToPlaylistModalVisible] = React.useState(false);
  const [selectedSong, setSelectedSong] = React.useState<Song | null>(null);

  const openAddToPlaylist = (song: Song) => {
    setSelectedSong(song);
    setAddToPlaylistModalVisible(true);
  };

  // Hero Fallback Logic
  const heroData = useMemo(() => {
    if (activeTrack) {
      return { type: 'NOW PLAYING', track: activeTrack };
    }
    if (recentSongs.length > 0) {
      const lastPlayed = recentSongs[0];
      return { 
        type: 'LAST PLAYED', 
        track: { 
          id: lastPlayed.id, 
          title: lastPlayed.title, 
          artist: lastPlayed.artist, 
          artwork: getArtworkUri(lastPlayed.artworkPath),
          song: lastPlayed // Keep full song object for playSong
        } 
      };
    }
    if (songs.length > 0) {
      // Assuming latest added is at the end of the array, or just pick first
      const latestAdded = songs[songs.length - 1];
      return { 
        type: 'LATEST ADDED', 
        track: {
          id: latestAdded.id, 
          title: latestAdded.title, 
          artist: latestAdded.artist, 
          artwork: getArtworkUri(latestAdded.artworkPath),
          song: latestAdded
        }
      };
    }
    return null;
  }, [activeTrack, recentSongs, songs]);

  const handleHeroPlay = () => {
    if (heroData?.type === 'NOW PLAYING') {
      isPlaying ? pause() : resume();
    } else if (heroData?.track?.song) {
      // Play the song (either last played or latest added)
      playSong(heroData.track.song as any);
    }
  };

  const handleHeroPress = () => {
    if (heroData?.type === 'NOW PLAYING') {
      navigation.navigate('Player');
    }
    // If not playing, could also open player or start playing
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
        
        {/* 1. Greeting */}
        <View className="mb-6">
          <Text className="text-primaryText text-4xl font-bold mb-1 tracking-tight">
            {getGreeting(userName)}
          </Text>
          <Text className="text-secondaryText text-base font-medium">Your music, your space.</Text>
        </View>

        {/* 2. Search */}
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Search')}
          className="bg-surface rounded-2xl flex-row items-center px-4 py-4 mb-8"
        >
          <SearchIcon color={colors.secondaryText} size={22} />
          <Text className="text-secondaryText ml-3 text-lg">Search your music...</Text>
        </TouchableOpacity>

        {/* 3. Now Playing / Last Played Hero */}
        {heroData && (
          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={handleHeroPress}
            className="mb-8 rounded-3xl overflow-hidden bg-surface"
            style={{ height: 180 }}
          >
            <ImageBackground 
              source={heroData.track.artwork ? { uri: heroData.track.artwork } : undefined}
              className="flex-1 justify-end p-5"
              imageStyle={{ opacity: 0.4 }} // Creates the dark overlay effect
            >
              <View className="absolute inset-0 bg-black/40" />
              <View className="relative z-10 flex-row justify-between items-end">
                <View className="flex-1 pr-4">
                  <Text className="text-accent text-xs font-bold tracking-wider mb-2">
                    {heroData.type}
                  </Text>
                  <Text className="text-primaryText text-2xl font-bold mb-1" numberOfLines={1}>
                    {heroData.track.title}
                  </Text>
                  <Text className="text-primaryText/80 text-base" numberOfLines={1}>
                    {heroData.track.artist}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  onPress={handleHeroPlay}
                  className="w-14 h-14 bg-accent rounded-full items-center justify-center shadow-lg"
                >
                  {heroData.type === 'NOW PLAYING' && isPlaying ? (
                    <Pause color={colors.background} size={28} fill={colors.background} />
                  ) : (
                    <Play color={colors.background} size={28} fill={colors.background} style={{ marginLeft: 4 }} />
                  )}
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        )}

        {/* 4. Quick Access */}
        <View className="flex-row gap-4 mb-8">
          <TouchableOpacity 
            onPress={importLocalMusic}
            className="bg-surface rounded-2xl flex-1 py-5 flex-row justify-center items-center"
          >
            <Plus color={colors.accent} size={22} />
            <Text className="text-primaryText font-semibold ml-2 text-base">Add Music</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate('AddLink')}
            className="bg-surface rounded-2xl flex-1 py-5 flex-row justify-center items-center"
          >
            <Link color={colors.accent} size={22} />
            <Text className="text-primaryText font-semibold ml-2 text-base">Add Link</Text>
          </TouchableOpacity>
        </View>

        {/* 5. Your Collection */}
        <Text className="text-secondaryText text-sm font-bold tracking-wider mb-4 uppercase">Your Collection</Text>
        <View className="flex-row justify-between bg-surface rounded-2xl p-6 mb-8">
          <View className="items-center flex-1">
            <Text className="text-primaryText text-2xl font-bold mb-1">{stats.totalSongs}</Text>
            <Text className="text-secondaryText text-xs font-medium uppercase tracking-wide">Songs</Text>
          </View>
          <View className="items-center flex-1 border-x border-[#1A3326]">
            <Text className="text-primaryText text-2xl font-bold mb-1">{stats.offlineCount}</Text>
            <Text className="text-secondaryText text-xs font-medium uppercase tracking-wide">Offline</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-primaryText text-2xl font-bold mb-1">{stats.favoritesCount}</Text>
            <Text className="text-secondaryText text-xs font-medium uppercase tracking-wide">Favorites</Text>
          </View>
        </View>

        {/* 6. Recently Played */}
        {recentSongs.length > 0 && (
          <View className="mb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-secondaryText text-sm font-bold tracking-wider uppercase">Recently Played</Text>
              <TouchableOpacity className="flex-row items-center">
                <Text className="text-accent text-sm font-medium mr-1">See All</Text>
                <ChevronRight color={colors.accent} size={16} />
              </TouchableOpacity>
            </View>
            
            <View className="gap-4">
              {recentSongs.map((song) => (
                <HomeSongItem key={song.id} song={song} onAddToPlaylist={openAddToPlaylist} />
              ))}
            </View>
          </View>
        )}
        
        {/* Bottom padding for mini player */}
        <View className="h-24" />
      </ScrollView>
      <AddToPlaylistModal
        visible={addToPlaylistModalVisible}
        onClose={() => setAddToPlaylistModalVisible(false)}
        song={selectedSong}
      />
    </SafeAreaView>
  );
};

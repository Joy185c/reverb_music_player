import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useLibraryStore, useIsFavorite } from '../../store/libraryStore';
import { usePlayerStore } from '../../store/playerStore';
import { getSongsForPlaylist, Playlist } from '../../database/repositories/PlaylistRepository';
import { Song } from '../../database/repositories/SongRepository';
import { colors } from '../../theme/colors';
import { Play, ArrowLeft, MoreVertical, Trash2 } from 'lucide-react-native';

import { getArtworkUri } from '../../utils/image';

const SongItem = ({ item, songs, playlistId, onRemove }: { item: Song, songs: Song[], playlistId: string, onRemove: () => void }) => {
  const { playSong } = usePlayerStore();
  const isFavorite = useIsFavorite(item.id);

  return (
    <TouchableOpacity 
      className="flex-row items-center py-3 border-b border-[#132d23]"
      onPress={() => playSong(item, songs)}
    >
      <View className="w-14 h-14 bg-surface rounded-xl mr-4 justify-center items-center overflow-hidden">
        {item.artworkPath ? (
          <Image 
            source={{ uri: getArtworkUri(item.artworkPath) }} 
            className="w-full h-full" 
          />
        ) : (
          <Text className="text-secondaryText text-xs font-bold text-lg">{item.title.charAt(0)}</Text>
        )}
      </View>
      <View className="flex-1">
        <Text className="text-primaryText font-medium text-base mb-1" numberOfLines={1}>{item.title}</Text>
        <Text className="text-secondaryText text-sm" numberOfLines={1}>{item.artist}</Text>
      </View>
      {isFavorite && <Text className="text-accent ml-2 mr-2">❤️</Text>}
      <TouchableOpacity onPress={onRemove} className="p-2">
        <Trash2 color={colors.secondaryText} size={20} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export const PlaylistDetails = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { playlist } = route.params as { playlist: Playlist };
  
  const [songs, setSongs] = useState<Song[]>([]);
  const { removeSongFromPlaylist, deletePlaylist } = useLibraryStore();
  const { playSong } = usePlayerStore();

  const loadSongs = async () => {
    const fetchedSongs = await getSongsForPlaylist(playlist.id);
    setSongs(fetchedSongs);
  };

  useEffect(() => {
    loadSongs();
  }, [playlist.id]);

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  const handleRemoveSong = (songId: string) => {
    Alert.alert('Remove Song', 'Remove this song from the playlist?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        await removeSongFromPlaylist(playlist.id, songId);
        loadSongs();
      }}
    ]);
  };

  const handleDeletePlaylist = () => {
    Alert.alert('Delete Playlist', `Are you sure you want to delete "${playlist.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deletePlaylist(playlist.id);
        navigation.goBack();
      }}
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <ArrowLeft color={colors.primaryText} size={28} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDeletePlaylist} className="p-2 -mr-2">
          <Trash2 color={colors.accent} size={24} />
        </TouchableOpacity>
      </View>

      <View className="px-4 pt-4 pb-6 border-b border-[#1a382e]">
        <Text className="text-primaryText text-3xl font-bold mb-2">{playlist.name}</Text>
        <Text className="text-secondaryText text-base mb-6">{songs.length} {songs.length === 1 ? 'song' : 'songs'}</Text>

        <TouchableOpacity 
          onPress={handlePlayAll}
          disabled={songs.length === 0}
          className={`flex-row items-center justify-center py-4 rounded-2xl ${songs.length > 0 ? 'bg-accent' : 'bg-surface opacity-50'}`}
        >
          <Play color={colors.background} size={24} fill={colors.background} />
          <Text className="text-background font-bold text-lg ml-2">Play All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        className="flex-1 px-4 pt-2"
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SongItem 
            item={item} 
            songs={songs} 
            playlistId={playlist.id} 
            onRemove={() => handleRemoveSong(item.id)} 
          />
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-20">
            <Text className="text-secondaryText text-lg">Playlist is empty</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </SafeAreaView>
  );
};

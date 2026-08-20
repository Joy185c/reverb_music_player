import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLibraryStore, useIsFavorite } from '../../store/libraryStore';
import { usePlayerStore } from '../../store/playerStore';
import { colors } from '../../theme/colors';
import { CreatePlaylistModal } from '../../components/CreatePlaylistModal';
import { AddToPlaylistModal } from '../../components/AddToPlaylistModal';
import { Song } from '../../database/repositories/SongRepository';
import { MoreVertical } from 'lucide-react-native';
import { getArtworkUri } from '../../utils/image';

const LibrarySongItem = ({ item, displayedSongs, onAddToPlaylist }: { item: Song, displayedSongs: Song[], onAddToPlaylist: (song: Song) => void }) => {
  const { playSong } = usePlayerStore();
  const isFavorite = useIsFavorite(item.id);

  return (
    <TouchableOpacity 
      className="flex-row items-center py-3 border-b border-[#132d23]"
      onPress={() => playSong(item, displayedSongs)}
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
      <View className="flex-1 mr-2">
        <Text className="text-primaryText font-medium text-base mb-1" numberOfLines={1}>{item.title}</Text>
        <Text className="text-secondaryText text-sm" numberOfLines={1}>{item.artist}</Text>
      </View>
      {isFavorite && <Text className="text-accent ml-2 mr-2">❤️</Text>}
      <TouchableOpacity onPress={() => onAddToPlaylist(item)} className="p-2">
         <MoreVertical color={colors.secondaryText} size={20} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export const Library = () => {
  const navigation = useNavigation<any>();
  const { songs, playlists, loadLibrary, createNewPlaylist } = useLibraryStore();
  const { playSong } = usePlayerStore();
  const [filter, setFilter] = useState<'All' | 'Offline' | 'Favorites'>('All');
  const [activeTab, setActiveTab] = useState<'Songs' | 'Playlists'>('Songs');
  const [modalVisible, setModalVisible] = useState(false);
  
  const [addToPlaylistModalVisible, setAddToPlaylistModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const openAddToPlaylist = (song: Song) => {
    setSelectedSong(song);
    setAddToPlaylistModalVisible(true);
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  const displayedSongs = songs.filter(s => {
    if (filter === 'Favorites') return s.isFavorite;
    if (filter === 'Offline') return s.sourceType === 'local' || s.sourceType === 'authorized_download';
    return true;
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 pt-6 flex-1">
        <Text className="text-primaryText text-3xl font-bold mb-4">Library</Text>
        
        {/* Tabs */}
        <View className="flex-row mb-6">
          <TouchableOpacity onPress={() => setActiveTab('Songs')} className={`mr-6 ${activeTab === 'Songs' ? 'border-b-2 border-accent' : ''} pb-1`}>
            <Text className={`text-lg font-medium ${activeTab === 'Songs' ? 'text-accent' : 'text-secondaryText'}`}>Songs</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('Playlists')} className={`${activeTab === 'Playlists' ? 'border-b-2 border-accent' : ''} pb-1`}>
            <Text className={`text-lg font-medium ${activeTab === 'Playlists' ? 'text-accent' : 'text-secondaryText'}`}>Playlists</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'Songs' ? (
          <>
            {/* Filters */}
            <View className="flex-row mb-6">
              {['All', 'Offline', 'Favorites'].map((f) => (
                <TouchableOpacity 
                  key={f} 
                  onPress={() => setFilter(f as any)}
                  className={`px-4 py-2 rounded-full mr-3 ${filter === f ? 'bg-surface border border-accent' : 'bg-surface border border-transparent'}`}
                >
                  <Text className={filter === f ? 'text-accent' : 'text-secondaryText'}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <FlatList
              data={displayedSongs}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <LibrarySongItem item={item} displayedSongs={displayedSongs} onAddToPlaylist={openAddToPlaylist} />
              )}
              ListEmptyComponent={
                <Text className="text-secondaryText mt-10 text-center">No songs match this filter.</Text>
              }
            />
          </>
        ) : (
          <View className="flex-1">
            <FlatList
              data={playlists}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => navigation.navigate('PlaylistDetails', { playlist: item })}
                  className="w-[48%] aspect-square bg-surface rounded-2xl mb-4 p-4 justify-end"
                >
                  <Text className="text-primaryText font-bold text-lg" numberOfLines={2}>{item.name}</Text>
                  <Text className="text-secondaryText text-sm mt-1">Tap to view</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text className="text-secondaryText mt-10 text-center">No playlists created yet.</Text>
              }
            />
            <TouchableOpacity 
              onPress={() => setModalVisible(true)}
              className="absolute bottom-[80px] right-2 w-14 h-14 bg-accent rounded-full justify-center items-center shadow-lg"
              style={{ elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}
            >
               <Text className="text-background text-3xl font-light">+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <CreatePlaylistModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSubmit={createNewPlaylist} 
      />
      <AddToPlaylistModal
        visible={addToPlaylistModalVisible}
        onClose={() => setAddToPlaylistModalVisible(false)}
        song={selectedSong}
      />
    </SafeAreaView>
  );
};

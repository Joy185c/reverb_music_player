import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { useLibraryStore } from '../../store/libraryStore';
import { Song } from '../../database/repositories/SongRepository';
import { X, Plus, Music } from 'lucide-react-native';
import { CreatePlaylistModal } from '../CreatePlaylistModal';

interface Props {
  visible: boolean;
  onClose: () => void;
  song: Song | null;
}

export const AddToPlaylistModal = ({ visible, onClose, song }: Props) => {
  const { playlists, addSongToPlaylist } = useLibraryStore();
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const handleSelectPlaylist = async (playlistId: string) => {
    if (!song) return;
    try {
      await addSongToPlaylist(playlistId, song.id);
      Alert.alert('Success', `Added to playlist`);
      onClose();
    } catch (e) {
      Alert.alert('Error', 'Could not add to playlist. It might already be there.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity 
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} className="bg-surface rounded-t-3xl p-6 pb-10 h-[60%]">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-primaryText text-xl font-bold">Add to Playlist</Text>
            <TouchableOpacity onPress={onClose}>
              <X color={colors.secondaryText} size={24} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            onPress={() => setCreateModalVisible(true)}
            className="flex-row items-center py-4 border-b border-[#132d23] mb-2"
          >
            <View className="w-12 h-12 bg-accent rounded-xl justify-center items-center mr-4">
              <Plus color={colors.background} size={24} />
            </View>
            <Text className="text-primaryText font-medium text-base">New Playlist...</Text>
          </TouchableOpacity>

          <FlatList
            data={playlists}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity 
                onPress={() => handleSelectPlaylist(item.id)}
                className="flex-row items-center py-4 border-b border-[#132d23]"
              >
                <View className="w-12 h-12 bg-[#1A3326] rounded-xl justify-center items-center mr-4">
                   <Music color={colors.accent} size={20} />
                </View>
                <View className="flex-1">
                  <Text className="text-primaryText font-medium text-base">{item.name}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text className="text-secondaryText mt-10 text-center">No playlists created yet.</Text>
            }
          />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Reusing existing create playlist modal */}
      <CreatePlaylistModal 
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={async (name) => {
          const { createNewPlaylist } = useLibraryStore.getState();
          await createNewPlaylist(name);
          setCreateModalVisible(false);
          // Auto add to this new playlist would be nice, but getting ID is tricky here as createNewPlaylist doesn't return it yet.
        }}
      />
    </Modal>
  );
};

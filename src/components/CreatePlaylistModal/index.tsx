import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export const CreatePlaylistModal = ({ visible, onClose, onSubmit }: Props) => {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim());
      setName('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/60 justify-center px-6">
        <View className="bg-surface rounded-3xl p-6 border border-[#1a382e]">
          <Text className="text-primaryText text-xl font-bold mb-4">New Playlist</Text>
          <TextInput 
            value={name}
            onChangeText={setName}
            placeholder="Playlist name"
            placeholderTextColor={colors.secondaryText}
            className="bg-background text-primaryText rounded-xl px-4 py-3 mb-6 text-lg"
            autoFocus
          />
          <View className="flex-row justify-end">
            <TouchableOpacity onPress={onClose} className="px-4 py-2 mr-2">
              <Text className="text-secondaryText font-medium">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} className="bg-accent px-6 py-2 rounded-full">
              <Text className="text-background font-bold">Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

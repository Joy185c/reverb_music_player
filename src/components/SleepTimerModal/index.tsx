import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
import { colors } from '../../theme/colors';
import { usePlayerStore } from '../../store/playerStore';
import { Clock } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const SleepTimerModal = ({ visible, onClose }: Props) => {
  const { sleepTimerEndTime, setSleepTimer, cancelSleepTimer } = usePlayerStore();
  const [customMinutes, setCustomMinutes] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const options = [
    { label: 'Off', value: 0 },
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '60 min', value: 60 },
    { label: '90 min', value: 90 },
  ];

  const handleSelect = (minutes: number) => {
    if (minutes === 0) {
      cancelSleepTimer();
    } else {
      setSleepTimer(minutes);
    }
    onClose();
    setIsCustom(false);
  };

  const handleCustomSubmit = () => {
    const mins = parseInt(customMinutes);
    if (!isNaN(mins) && mins > 0) {
      setSleepTimer(mins);
      onClose();
      setIsCustom(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity 
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} className="bg-surface rounded-t-3xl p-6 pb-10">
          <View className="flex-row items-center mb-6">
            <Clock color={colors.accent} size={24} />
            <Text className="text-primaryText text-xl font-bold ml-3">Sleep Timer</Text>
          </View>
          
          <View className="flex-row flex-wrap justify-between">
            {options.map(opt => (
              <TouchableOpacity
                key={opt.label}
                onPress={() => handleSelect(opt.value)}
                className="w-[48%] bg-background py-3 rounded-xl mb-3 items-center"
              >
                <Text className="text-primaryText font-medium text-base">{opt.label}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              onPress={() => setIsCustom(true)}
              className="w-[48%] bg-background py-3 rounded-xl mb-3 items-center"
            >
              <Text className="text-primaryText font-medium text-base">Custom</Text>
            </TouchableOpacity>
          </View>

          {isCustom && (
            <View className="mt-4 flex-row items-center">
              <TextInput
                value={customMinutes}
                onChangeText={setCustomMinutes}
                keyboardType="numeric"
                placeholder="Minutes"
                placeholderTextColor={colors.secondaryText}
                className="flex-1 bg-background text-primaryText rounded-xl px-4 py-3 mr-3"
              />
              <TouchableOpacity onPress={handleCustomSubmit} className="bg-accent px-6 py-3 rounded-xl">
                <Text className="text-background font-bold">Start</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

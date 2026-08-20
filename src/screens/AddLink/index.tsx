import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { X, Link as LinkIcon, Download, Play, AlertCircle } from 'lucide-react-native';
import { resolveLink, ResolvedLinkMetadata } from '../../services/linkResolver';
import { usePlayerStore } from '../../store/playerStore';

export const AddLink = () => {
  const navigation = useNavigation<any>();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ResolvedLinkMetadata | null>(null);

  const { playSong } = usePlayerStore();

  const handleValidate = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setError(null);
    setLoading(true);
    setPreviewData(null);

    try {
      const data = await resolveLink(url.trim());
      setPreviewData(data);
    } catch (err: any) {
      setError(err.message || "This link doesn't look valid or is unsupported.");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePlayPreview = () => {
    if (!previewData) return;
    
    // Create a temporary song object for playback
    const tempSong: any = {
      id: 'preview-' + Date.now(),
      title: previewData.title,
      artist: previewData.artist,
      duration: previewData.duration,
      artworkPath: previewData.artworkUrl,
      sourceUrl: previewData.streamUrl,
      sourceType: previewData.sourceType
    };
    
    playSong(tempSong);
  };

  const handleDownload = async () => {
    if (!previewData || !previewData.isDownloadable) return;
    
    // Generate a unique ID based on the URL or timestamp
    const downloadId = 'dl_' + Date.now();
    const { useDownloadManager } = require('../../services/downloader/DownloadManager');
    
    useDownloadManager.getState().addTask(
      downloadId, 
      previewData.streamUrl, 
      previewData.title, 
      previewData.artist
    );
    
    useDownloadManager.getState().startDownload(downloadId);
    
    // Navigate back to Library or show a toast
    navigation.navigate('Library');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 pt-6 flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-8">
          <Text className="text-primaryText text-3xl font-bold">Add Link</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <X color={colors.secondaryText} size={28} />
          </TouchableOpacity>
        </View>

        {!previewData && (
          <View className="flex-1">
            <Text className="text-secondaryText text-lg mb-4">Paste a supported music link</Text>
            
            <View className="flex-row items-center bg-surface rounded-2xl px-4 py-3 mb-4">
              <LinkIcon color={colors.accent} size={22} />
              <TextInput
                value={url}
                onChangeText={(text) => {
                  setUrl(text);
                  setError(null);
                }}
                placeholder="https://..."
                placeholderTextColor={colors.secondaryText}
                className="flex-1 text-primaryText text-lg ml-3"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {error && (
              <View className="flex-row items-center mb-6">
                <AlertCircle color="#ff4444" size={18} />
                <Text className="text-[#ff4444] ml-2 font-medium">{error}</Text>
              </View>
            )}

            <TouchableOpacity 
              onPress={handleValidate}
              disabled={loading || !url.trim()}
              className={`bg-accent py-4 rounded-2xl items-center ${loading || !url.trim() ? 'opacity-50' : 'opacity-100'}`}
            >
              {loading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text className="text-background text-lg font-bold">Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {previewData && (
          <View className="flex-1">
            <Text className="text-secondaryText text-sm font-bold tracking-wider mb-4 uppercase">Preview</Text>
            
            <View className="bg-surface rounded-3xl p-5 mb-8">
              <View className="w-full aspect-square bg-background rounded-2xl mb-5 overflow-hidden justify-center items-center">
                {previewData.artworkUrl ? (
                  <Image source={{ uri: previewData.artworkUrl }} className="w-full h-full" />
                ) : (
                  <Text className="text-secondaryText">No Artwork</Text>
                )}
              </View>
              
              <Text className="text-primaryText text-2xl font-bold mb-1" numberOfLines={1}>
                {previewData.title}
              </Text>
              <Text className="text-secondaryText text-lg mb-2" numberOfLines={1}>
                {previewData.artist}
              </Text>
              <Text className="text-accent font-medium">
                {formatDuration(previewData.duration)}
              </Text>
            </View>

            <View className="flex-row gap-4">
              <TouchableOpacity 
                onPress={handlePlayPreview}
                className="flex-1 bg-surface py-4 rounded-2xl items-center flex-row justify-center"
              >
                <Play color={colors.primaryText} size={20} fill={colors.primaryText} />
                <Text className="text-primaryText text-base font-bold ml-2">Play</Text>
              </TouchableOpacity>

              {previewData.isDownloadable && (
                <TouchableOpacity 
                  onPress={handleDownload}
                  className="flex-1 bg-accent py-4 rounded-2xl items-center flex-row justify-center"
                >
                  <Download color={colors.background} size={20} />
                  <Text className="text-background text-base font-bold ml-2">Save Offline</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

      </View>
    </SafeAreaView>
  );
};

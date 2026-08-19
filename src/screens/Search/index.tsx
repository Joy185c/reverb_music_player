import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { getDB } from '../../database/sqlite';
import { Song } from '../../database/repositories/SongRepository';
import { usePlayerStore } from '../../store/playerStore';
import { Search as SearchIcon, X } from 'lucide-react-native';
import { colors } from '../../theme/colors';

export const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const { playSong } = usePlayerStore();

  useEffect(() => {
    const searchDB = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      try {
        const db = await getDB();
        const searchTerm = `%${query.trim()}%`;
        const [res] = await db.executeSql(
          'SELECT * FROM songs WHERE title LIKE ? OR artist LIKE ? OR album LIKE ? LIMIT 20',
          [searchTerm, searchTerm, searchTerm]
        );
        const songs: Song[] = [];
        for (let i = 0; i < res.rows.length; i++) {
          const row = res.rows.item(i);
          songs.push({ ...row, isFavorite: row.isFavorite === 1 });
        }
        setResults(songs);
      } catch (e) {
        console.error('Search error', e);
      }
    };
    
    const timeoutId = setTimeout(searchDB, 300); // debounce
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 pt-6 flex-1">
        <Text className="text-primaryText text-3xl font-bold mb-6">Search</Text>
        
        <View className="bg-surface rounded-2xl flex-row items-center px-4 py-3 mb-6">
          <SearchIcon color={colors.secondaryText} size={20} />
          <TextInput 
            value={query}
            onChangeText={setQuery}
            placeholder="Songs, artists, albums..."
            placeholderTextColor={colors.secondaryText}
            className="flex-1 text-primaryText ml-3 text-lg"
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X color={colors.secondaryText} size={20} />
            </TouchableOpacity>
          )}
        </View>

        {query.trim().length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                className="flex-row items-center py-3 border-b border-[#132d23]"
                onPress={() => playSong(item, results)}
              >
                <View className="w-14 h-14 bg-surface rounded-xl mr-4 justify-center items-center overflow-hidden">
                  <Text className="text-secondaryText text-xs">Art</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-primaryText font-medium text-base mb-1" numberOfLines={1}>{item.title}</Text>
                  <Text className="text-secondaryText text-sm" numberOfLines={1}>{item.artist}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text className="text-secondaryText mt-10 text-center">No results found for "{query}"</Text>
            }
          />
        ) : (
          <View className="flex-1 justify-center items-center opacity-50">
            <SearchIcon color={colors.secondaryText} size={48} />
            <Text className="text-secondaryText mt-4 text-base">Find your music</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

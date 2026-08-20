import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Library, Search, Settings, Player, AddLink } from '../screens';
import { colors } from '../theme/colors';
import { Home as HomeIcon, Library as LibraryIcon, Search as SearchIcon, Settings as SettingsIcon } from 'lucide-react-native';
import { View } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.primaryText,
    border: 'transparent',
  },
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') return <HomeIcon color={color} size={size} />;
          if (route.name === 'Library') return <LibraryIcon color={color} size={size} />;
          if (route.name === 'Search') return <SearchIcon color={color} size={size} />;
          if (route.name === 'Settings') return <SettingsIcon color={color} size={size} />;
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Library" component={Library} />
      <Tab.Screen name="Search" component={Search} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
};

import { MiniPlayer } from '../components/MiniPlayer';
import { DownloadsOverlay } from '../components/DownloadsOverlay';
import { PlaylistDetails } from '../screens/PlaylistDetails';

export const RootNavigator = () => {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <NavigationContainer theme={MyTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false, presentation: 'modal' }}>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="Player" component={Player} options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="AddLink" component={AddLink} options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="PlaylistDetails" component={PlaylistDetails} options={{ presentation: 'card', animation: 'slide_from_right' }} />
        </Stack.Navigator>
        <DownloadsOverlay />
        <MiniPlayer />
      </NavigationContainer>
    </View>
  );
};

import './src/global.css';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { View, ActivityIndicator } from 'react-native';

import { setupNotifications, requestNotificationPermissionsAsync } from './src/utils/notifications';
import AuthScreen from './src/screens/AuthScreen';
// ... checks ...
import TabNavigator from './src/navigation/TabNavigator';
import TriviaScreen from './src/screens/TriviaScreen';
import OracleScreen from './src/screens/OracleScreen';
import MoodPickerScreen from './src/screens/MoodPickerScreen';
import WatchlistScreen from './src/screens/WatchlistScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
import QuoteScreen from './src/screens/QuoteScreen';
import SearchScreen from './src/screens/SearchScreen';
import CharacterScreen from './src/screens/CharacterScreen';
import CharactersScreen from './src/screens/CharactersScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AnimeDetailScreen from './src/screens/AnimeDetailScreen';
import CreatorStudioScreen from './src/screens/CreatorStudioScreen';
import ChatScreen from './src/screens/ChatScreen';
import GuestUpgradeScreen from './src/screens/GuestUpgradeScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import UploadsScreen from './src/screens/UploadsScreen';
import MangaScreen from './src/screens/MangaScreen';
import MangaDetailScreen from './src/screens/MangaDetailScreen';
import MangaReaderScreen from './src/screens/MangaReaderScreen';
import MusicScreen from './src/screens/MusicScreen';
const Stack = createStackNavigator();

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="Trivia" component={TriviaScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Oracle" component={OracleScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="MoodPicker" component={MoodPickerScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Watchlist" component={WatchlistScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Quote" component={QuoteScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Characters" component={CharactersScreen} />
      <Stack.Screen name="CharacterDetail" component={CharacterScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="AnimeDetail" component={AnimeDetailScreen} />
      <Stack.Screen name="CreatorStudio" component={CreatorStudioScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="GuestUpgrade" component={GuestUpgradeScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Uploads" component={UploadsScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Manga" component={MangaScreen} />
      <Stack.Screen name="MangaDetail" component={MangaDetailScreen} />
      <Stack.Screen name="MangaReader" component={MangaReaderScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Music" component={MusicScreen} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {currentUser ? (
        <Stack.Screen name="Main" component={MainStack} />
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  React.useEffect(() => {
    setupNotifications();
    requestNotificationPermissionsAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <SettingsProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </SettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { PlayerProvider } from './src/context/PlayerContext';
import { AuthScreen } from './src/screens/AuthScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { DownloadsScreen } from './src/screens/DownloadsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { MiniPlayer } from './src/components/MiniPlayer';

type TabType = 'search' | 'downloads' | 'settings';

function MainApp() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('search');

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>Iniciando ClassMusic...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Barra Superior / Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.logoBadge}>
            <Ionicons name="musical-notes" size={18} color="#22c55e" />
          </View>
          <Text style={styles.brandTitle}>ClassMusic</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>NUBE</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          {activeTab === 'search'
            ? 'Explorar canciones'
            : activeTab === 'downloads'
            ? 'Biblioteca sin conexión'
            : 'Ajustes del servidor'}
        </Text>
      </View>

      {/* Pantalla Activa */}
      <View style={styles.screenContainer}>
        {activeTab === 'search' && <SearchScreen />}
        {activeTab === 'downloads' && <DownloadsScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </View>

      {/* Reproductor Flotante */}
      <MiniPlayer />

      {/* Barra de Navegación Inferior (Tabs) */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('search')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'search' ? 'search' : 'search-outline'}
            size={22}
            color={activeTab === 'search' ? '#22c55e' : '#71717a'}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'search' && styles.tabLabelActive,
            ]}
          >
            Explorar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('downloads')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={
              activeTab === 'downloads'
                ? 'cloud-download'
                : 'cloud-download-outline'
            }
            size={22}
            color={activeTab === 'downloads' ? '#22c55e' : '#71717a'}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'downloads' && styles.tabLabelActive,
            ]}
          >
            Descargas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('settings')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={
              activeTab === 'settings'
                ? 'settings-sharp'
                : 'settings-outline'
            }
            size={22}
            color={activeTab === 'settings' ? '#22c55e' : '#71717a'}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'settings' && styles.tabLabelActive,
            ]}
          >
            Ajustes
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <MainApp />
      </PlayerProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#09090b',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#a1a1aa',
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#18181b',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#22c55e',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 2,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#121215',
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    paddingBottom: Platform.OS === 'ios' ? 14 : 6,
    paddingTop: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 11,
    color: '#71717a',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#22c55e',
    fontWeight: '700',
  },
});

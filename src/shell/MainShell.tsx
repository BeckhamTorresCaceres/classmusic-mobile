import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthScreen } from '@/features/auth';
import { DownloadsScreen } from '@/features/downloads';
import { LocalScreen } from '@/features/local';
import { FullPlayerModal, MiniPlayer } from '@/features/player';
import { SearchScreen } from '@/features/search';
import { SettingsScreen } from '@/features/settings';
import { TAB_ROUTES, TabBar, type TabType } from '@/navigation';
import { useAuth, useDownload } from '@/store';
import { colors, spacing, typography } from '@/theme';
import { AppHeader } from './AppHeader';

export const MainShell: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { activeCount } = useDownload();
  const [activeTab, setActiveTab] = useState<TabType>('search');

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Iniciando ClassMusic...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const activeRoute =
    TAB_ROUTES.find((r) => r.key === activeTab) || TAB_ROUTES[0];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <AppHeader subtitle={activeRoute.subtitle} />

      <View style={styles.screenContainer}>
        {activeTab === 'search' && <SearchScreen />}
        {activeTab === 'downloads' && <DownloadsScreen />}
        {activeTab === 'local' && <LocalScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </View>

      <MiniPlayer />
      <FullPlayerModal />

      <TabBar
        activeTab={activeTab}
        activeDownloadsCount={activeCount}
        onSelect={setActiveTab}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
  },
  screenContainer: { flex: 1 },
});

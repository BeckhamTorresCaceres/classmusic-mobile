import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/theme';
import { DOWNLOAD_MODE_TABS, type DownloadMode } from '../types';

interface DownloadModeTabsProps {
  mode: DownloadMode;
  activeCount: number;
  onSelect: (mode: DownloadMode) => void;
}

export const DownloadModeTabs: React.FC<DownloadModeTabsProps> = ({
  mode,
  activeCount,
  onSelect,
}) => (
  <View style={styles.row}>
    {DOWNLOAD_MODE_TABS.map((tab) => {
      const isActive = mode === tab.key;
      const label =
        tab.key === 'queue' && activeCount > 0
          ? `${tab.label} (${activeCount})`
          : tab.label;

      return (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, isActive && styles.tabActive]}
          onPress={() => onSelect(tab.key)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={tab.icon}
            size={15}
            color={isActive ? colors.primaryForeground : colors.textSecondary}
          />
          <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
            {label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, marginBottom: spacing.md },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  tabTextActive: {
    color: colors.primaryForeground,
    fontWeight: typography.weight.bold,
  },
});

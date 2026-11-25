import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, layout, radius, typography } from '@/theme';
import { TAB_ROUTES, type TabType } from './types';

interface TabBarProps {
  activeTab: TabType;
  activeDownloadsCount: number;
  onSelect: (tab: TabType) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  activeDownloadsCount,
  onSelect,
}) => (
  <View style={styles.tabBar}>
    {TAB_ROUTES.map((route) => {
      const isActive = activeTab === route.key;
      const showBadge = route.key === 'downloads' && activeDownloadsCount > 0;

      return (
        <TouchableOpacity
          key={route.key}
          style={styles.tabItem}
          onPress={() => onSelect(route.key)}
          activeOpacity={0.7}
        >
          <View style={styles.iconWrapper}>
            <Ionicons
              name={isActive ? route.activeIcon : route.inactiveIcon}
              size={22}
              color={isActive ? colors.primary : colors.textMuted}
            />
            {showBadge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {activeDownloadsCount > 9 ? '9+' : activeDownloadsCount}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
            {route.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: layout.tabBarHeight,
    backgroundColor: colors.tabBarBackground,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === 'ios' ? 14 : 6,
    paddingTop: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconWrapper: { position: 'relative' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: colors.primary,
    minWidth: 16,
    height: 16,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: colors.primaryForeground,
    fontSize: 9,
    fontWeight: typography.weight.extrabold,
  },
  tabLabel: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    fontWeight: typography.weight.medium,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: typography.weight.bold,
  },
});

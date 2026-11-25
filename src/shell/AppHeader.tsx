import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, withOpacity } from '@/theme';

interface AppHeaderProps {
  subtitle: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ subtitle }) => (
  <View style={styles.header}>
    <View style={styles.titleRow}>
      <View style={styles.logoBadge}>
        <Ionicons name="musical-notes" size={18} color={colors.primary} />
      </View>
      <Text style={styles.brandTitle}>ClassMusic</Text>
      <View style={styles.liveBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>NUBE</Text>
      </View>
    </View>
    <Text style={styles.subtitle}>{subtitle}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.xxl,
    backgroundColor: withOpacity(colors.primary, 0.15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: typography.size.title,
    fontWeight: typography.weight.extrabold,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: withOpacity(colors.primary, 0.15),
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginLeft: spacing.xs,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  liveText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: typography.size.md,
    color: colors.textMuted,
    marginTop: 2,
  },
});

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/theme';

interface LocalHeaderCardProps {
  totalCount: number;
  totalSizeMB: string;
  hasVisibleTracks: boolean;
  onRefresh: () => void;
  onPlayAll: () => void;
  onShuffle: () => void;
}

export const LocalHeaderCard: React.FC<LocalHeaderCardProps> = ({
  totalCount,
  totalSizeMB,
  hasVisibleTracks,
  onRefresh,
  onPlayAll,
  onShuffle,
}) => (
  <View style={styles.headerCard}>
    <View style={styles.headerTop}>
      <View style={styles.headerInfo}>
        <Text style={styles.headingTitle}>Biblioteca Local</Text>
        <Text style={styles.headingSubtitle}>
          {totalCount} {totalCount === 1 ? 'canción' : 'canciones'} ·{' '}
          {totalSizeMB} MB offline
        </Text>
      </View>
      <TouchableOpacity
        style={styles.refreshBtn}
        onPress={onRefresh}
        accessibilityLabel="Actualizar biblioteca local"
      >
        <Ionicons name="reload" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>

    {hasVisibleTracks && (
      <View style={styles.playbackRow}>
        <TouchableOpacity
          style={styles.playAllBtn}
          onPress={onPlayAll}
          activeOpacity={0.85}
        >
          <Ionicons name="play" size={16} color={colors.primaryForeground} />
          <Text style={styles.playAllText}>Reproducir todo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shuffleBtn}
          onPress={onShuffle}
          activeOpacity={0.8}
        >
          <Ionicons name="shuffle" size={16} color={colors.primary} />
          <Text style={styles.shuffleText}>Aleatorio</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfo: { flex: 1 },
  headingTitle: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  headingSubtitle: {
    fontSize: typography.size.base,
    color: colors.primary,
    marginTop: 2,
    fontWeight: typography.weight.medium,
  },
  refreshBtn: {
    padding: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
  },
  playbackRow: { flexDirection: 'row', gap: 10 },
  playAllBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 9,
    borderRadius: radius.lg,
  },
  playAllText: {
    color: colors.primaryForeground,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
  shuffleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 9,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  shuffleText: {
    color: colors.textPrimary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
  },
});

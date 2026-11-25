import React from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { DownloadQueueItem } from '@/shared/types';
import { colors, radius, spacing, typography } from '@/theme';

interface DownloadQueueItemRowProps {
  item: DownloadQueueItem;
  onRetry: (trackId: string) => void;
  onRemove: (trackId: string) => void;
}

export const DownloadQueueItemRow: React.FC<DownloadQueueItemRowProps> = ({
  item,
  onRetry,
  onRemove,
}) => (
  <View style={styles.itemCard}>
    {item.track.thumbnail ? (
      <Image source={{ uri: item.track.thumbnail }} style={styles.thumb} />
    ) : (
      <View style={styles.thumbFallback}>
        <Ionicons name="musical-note" size={18} color={colors.textMuted} />
      </View>
    )}

    <View style={styles.info}>
      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={1}>
          {item.track.title}
        </Text>
        <View style={styles.formatBadge}>
          <Text style={styles.formatText}>{item.format.toUpperCase()}</Text>
        </View>
      </View>

      {item.status === 'downloading' ? (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, Math.round(item.progress * 100))}%` },
              ]}
            />
          </View>
          <Text style={styles.progressPct}>
            {Math.round(item.progress * 100)}%
          </Text>
        </View>
      ) : item.status === 'queued' ? (
        <Text style={styles.statusQueued}>En cola de espera...</Text>
      ) : item.status === 'completed' ? (
        <Text style={styles.statusDone}>Guardada en Local</Text>
      ) : (
        <Text style={styles.statusError} numberOfLines={2}>
          {item.error || 'Error al descargar'}
        </Text>
      )}
    </View>

    <View style={styles.actions}>
      {item.status === 'downloading' ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : item.status === 'completed' ? (
        <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
      ) : item.status === 'error' ? (
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => onRetry(item.track.id)}
        >
          <Ionicons name="refresh" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => onRemove(item.track.id)}
        >
          <Ionicons name="close" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 10,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
  },
  thumbFallback: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: {
    flex: 1,
    color: colors.textBright,
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
  },
  formatBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  formatText: {
    color: colors.textSecondary,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  progressPct: {
    color: colors.primary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    width: 34,
    textAlign: 'right',
  },
  statusQueued: { color: colors.textSecondary, fontSize: typography.size.sm },
  statusDone: {
    color: colors.primary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  statusError: { color: colors.error, fontSize: typography.size.sm },
  actions: { width: 30, alignItems: 'center' },
  retryBtn: {
    backgroundColor: colors.surfaceElevated,
    padding: 6,
    borderRadius: radius.md,
  },
  removeBtn: { padding: 6 },
});

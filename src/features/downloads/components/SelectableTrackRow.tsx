import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Track } from '@/shared/types';
import { formatDurationSeconds } from '@/shared/utils/formatters';
import { colors, radius, spacing, typography, withOpacity } from '@/theme';
import { LONG_TRACK_THRESHOLD_SECONDS } from '../types';

interface SelectableTrackRowProps {
  track: Track;
  selected: boolean;
  isDownloaded: boolean;
  isInQueue: boolean;
  onToggle: (trackId: string) => void;
}

export const SelectableTrackRow: React.FC<SelectableTrackRowProps> = ({
  track,
  selected,
  isDownloaded,
  isInQueue,
  onToggle,
}) => {
  const isLongVideo = (track.duration || 0) > LONG_TRACK_THRESHOLD_SECONDS;
  const disabled = isDownloaded || isInQueue;
  const durationText = formatDurationSeconds(track.duration);

  return (
    <TouchableOpacity
      style={[
        styles.row,
        selected && !disabled && styles.rowSelected,
        disabled && styles.rowDisabled,
      ]}
      onPress={() => !disabled && onToggle(track.id)}
      activeOpacity={disabled ? 1 : 0.75}
    >
      {track.thumbnail ? (
        <Image source={{ uri: track.thumbnail }} style={styles.thumb} />
      ) : (
        <View style={styles.thumbFallback}>
          <Ionicons name="musical-note" size={18} color={colors.textMuted} />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {track.title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.artist} numberOfLines={1}>
            {track.artist || track.channel || 'Desconocido'}
            {durationText ? ` · ${durationText}` : ''}
          </Text>
          {isLongVideo && (
            <View style={styles.warnBadge}>
              <Text style={styles.warnText}>+15m</Text>
            </View>
          )}
        </View>
      </View>

      {isDownloaded ? (
        <View style={styles.localBadge}>
          <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
          <Text style={styles.localBadgeText}>Local</Text>
        </View>
      ) : isInQueue ? (
        <View style={styles.queueBadge}>
          <Text style={styles.queueBadgeText}>En cola</Text>
        </View>
      ) : (
        <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
          {selected && (
            <Ionicons
              name="checkmark"
              size={15}
              color={colors.primaryForeground}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 10,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  rowSelected: {
    borderColor: withOpacity(colors.primary, 0.55),
    backgroundColor: colors.surfaceSelected,
  },
  rowDisabled: { opacity: 0.7 },
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
  info: { flex: 1 },
  title: {
    color: colors.textBright,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    marginBottom: 2,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  artist: {
    color: colors.textSecondary,
    fontSize: typography.size.md,
    flexShrink: 1,
  },
  warnBadge: {
    backgroundColor: withOpacity(colors.warning, 0.15),
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  warnText: {
    color: colors.warning,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.borderControl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  localBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: withOpacity(colors.primary, 0.12),
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  localBadgeText: {
    color: colors.primary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  queueBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  queueBadgeText: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
});

import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, withOpacity } from '@/theme';

interface TrackActionsProps {
  downloading: boolean;
  downloadProgress: number;
  downloaded: boolean;
  onDownload: () => void;
  onShare: () => void;
  onDelete: () => void;
}

export const TrackActions: React.FC<TrackActionsProps> = ({
  downloading,
  downloadProgress,
  downloaded,
  onDownload,
  onShare,
  onDelete,
}) => {
  if (downloading) {
    return (
      <View style={styles.progressBadge}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.progressText}>
          {(downloadProgress * 100).toFixed(0)}%
        </Text>
      </View>
    );
  }

  if (downloaded) {
    return (
      <View style={styles.downloadedGroup}>
        <TouchableOpacity style={styles.actionBtn} onPress={onShare}>
          <Ionicons
            name="share-outline"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.downloadBtn}
      onPress={onDownload}
      activeOpacity={0.7}
    >
      <Ionicons name="download-outline" size={20} color={colors.textPrimary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  downloadBtn: {
    backgroundColor: colors.surfaceElevated,
    padding: 10,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadedGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionBtn: { padding: 6 },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withOpacity(colors.primary, 0.1),
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.modal,
    gap: spacing.xs,
  },
  progressText: {
    color: colors.primary,
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
  },
});

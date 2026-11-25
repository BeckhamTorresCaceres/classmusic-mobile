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
import { formatTimeFromMillis } from '@/shared/utils/formatters';
import { usePlayer } from '@/store';
import { colors, layout, radius, spacing, typography } from '@/theme';

export const MiniPlayer: React.FC = () => {
  const player = usePlayer();
  const track = player.currentTrack;

  if (!track) return null;

  const progress =
    player.durationMillis > 0
      ? (player.positionMillis / player.durationMillis) * 100
      : 0;

  return (
    <View style={styles.container}>
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${Math.min(100, Math.max(0, progress))}%` },
          ]}
        />
      </View>

      <TouchableOpacity
        style={styles.content}
        onPress={() => player.setIsExpanded(true)}
        activeOpacity={0.9}
      >
        {track.thumbnail ? (
          <Image source={{ uri: track.thumbnail }} style={styles.cover} />
        ) : (
          <View style={styles.coverFallback}>
            <Ionicons name="musical-note" size={20} color={colors.textMuted} />
          </View>
        )}

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {track.title}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {track.artist || track.channel || 'Desconocido'} ·{' '}
            {formatTimeFromMillis(player.positionMillis)} /{' '}
            {formatTimeFromMillis(player.durationMillis)}
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={player.togglePlayPause}
            activeOpacity={0.8}
          >
            {player.isLoading ? (
              <ActivityIndicator size="small" color={colors.textPrimary} />
            ) : (
              <Ionicons
                name={player.isPlaying ? 'pause' : 'play'}
                size={24}
                color={colors.textPrimary}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={player.stop}>
            <Ionicons name="close" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderColor: colors.border,
    position: 'absolute',
    bottom: layout.tabBarHeight,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: colors.surfaceElevated,
    width: '100%',
  },
  progressBarFill: { height: '100%', backgroundColor: colors.primary },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  cover: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
  },
  coverFallback: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: { flex: 1, marginLeft: spacing.md, marginRight: 10 },
  title: {
    color: colors.textPrimary,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    marginBottom: 2,
  },
  meta: { color: colors.textSecondary, fontSize: typography.size.md },
  controls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  playButton: {
    backgroundColor: colors.primary,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: { padding: 6 },
});

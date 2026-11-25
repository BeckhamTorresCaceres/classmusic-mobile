import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DownloadStorage } from '@/services';
import type { DownloadedTrack, Track } from '@/shared/types';
import { formatDurationSeconds } from '@/shared/utils/formatters';
import { useDownload, usePlayer } from '@/store';
import { colors, radius, spacing, typography, withOpacity } from '@/theme';
import { TrackActions } from './TrackActions';

interface TrackCardProps {
  track: Track | DownloadedTrack;
  queue?: (Track | DownloadedTrack)[];
  isDownloaded?: boolean;
  onDownloaded?: () => void;
  onDeleted?: () => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  queue,
  isDownloaded = false,
  onDownloaded,
  onDeleted,
}) => {
  const player = usePlayer();
  const {
    downloadedTracks,
    defaultFormat,
    isTrackDownloaded,
    getQueueItem,
    enqueueTrack,
    deleteDownloadedTrack,
  } = useDownload();

  const queueItem = getQueueItem(track.id);
  const downloading =
    queueItem?.status === 'downloading' || queueItem?.status === 'queued';
  const downloaded = isDownloaded || isTrackDownloaded(track.id);
  const isCurrent = player.currentTrack?.id === track.id;
  const isPlayingThis = isCurrent && player.isPlaying;

  const handlePlay = async () => {
    try {
      if (isCurrent) {
        await player.togglePlayPause();
      } else {
        await player.playTrack(track, queue);
        player.setIsExpanded(true);
      }
    } catch (err) {
      Alert.alert(
        'Error de Reproducción',
        err instanceof Error ? err.message : 'No se pudo reproducir la canción',
      );
    }
  };

  const handleOpenPlayer = async () => {
    if (isCurrent) player.setIsExpanded(true);
    else await handlePlay();
  };

  const handleDownload = () => {
    if (downloading) return;
    enqueueTrack(track, defaultFormat);
    onDownloaded?.();
  };

  const handleShare = async () => {
    const localUri =
      (track as DownloadedTrack).localUri ||
      downloadedTracks.find((d) => d.id === track.id)?.localUri;
    if (!localUri) return;
    try {
      await DownloadStorage.shareTrack(localUri);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Error al compartir');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Canción',
      `¿Deseas borrar "${track.title}" de tu celular?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteDownloadedTrack(track.id);
            onDeleted?.();
          },
        },
      ],
    );
  };

  const durationText = formatDurationSeconds(track.duration);

  return (
    <View style={[styles.card, isCurrent && styles.cardActive]}>
      <TouchableOpacity
        style={styles.thumbnailContainer}
        onPress={handlePlay}
        activeOpacity={0.8}
      >
        {track.thumbnail ? (
          <Image source={{ uri: track.thumbnail }} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnailFallback}>
            <Ionicons name="musical-notes" size={24} color={colors.textMuted} />
          </View>
        )}
        <View style={styles.playOverlay}>
          {isCurrent && player.isLoading ? (
            <ActivityIndicator size="small" color={colors.textPrimary} />
          ) : (
            <Ionicons
              name={isPlayingThis ? 'pause' : 'play'}
              size={20}
              color={colors.textPrimary}
            />
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.info}
        onPress={handleOpenPlayer}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.title, isCurrent && styles.titleActive]}
          numberOfLines={1}
        >
          {track.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {track.artist || track.channel || 'Desconocido'}
          {durationText ? ` · ${durationText}` : ''}
        </Text>
      </TouchableOpacity>

      <TrackActions
        downloading={downloading}
        downloadProgress={queueItem?.progress || 0}
        downloaded={downloaded}
        onDownload={handleDownload}
        onShare={handleShare}
        onDelete={handleDelete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 10,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceActive,
  },
  thumbnailContainer: {
    width: 54,
    height: 54,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surfaceElevated,
  },
  thumbnail: { width: '100%', height: '100%' },
  thumbnailFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: withOpacity(colors.shadow, 0.4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  title: {
    color: colors.textBright,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
    marginBottom: 3,
  },
  titleActive: { color: colors.primary },
  artist: { color: colors.textSecondary, fontSize: typography.size.base },
});

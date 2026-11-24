import React, { useEffect, useState } from 'react';
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
import { usePlayer } from '../context/PlayerContext';
import { DownloadService } from '../services/download';
import type { DownloadedTrack, Track } from '../types';

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
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloaded, setDownloaded] = useState(isDownloaded);

  const isCurrent = player.currentTrack?.id === track.id;
  const isPlayingThis = isCurrent && player.isPlaying;

  useEffect(() => {
    if (!isDownloaded) {
      DownloadService.isTrackDownloaded(track.id).then(setDownloaded);
    }
  }, [track.id, isDownloaded]);

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
    if (isCurrent) {
      player.setIsExpanded(true);
    } else {
      await handlePlay();
    }
  };

  const handleDownload = async () => {
    if (downloading) return;
    try {
      setDownloading(true);
      setDownloadProgress(0);

      await DownloadService.downloadTrack(track, 'mp3', (progress) => {
        setDownloadProgress(progress);
      });

      setDownloaded(true);
      onDownloaded?.();
      Alert.alert(
        '¡Descarga Completada!',
        `"${track.title}" se guardó en tu celular. Ya puedes escucharla sin internet.`,
      );
    } catch (err) {
      Alert.alert(
        'Error de Descarga',
        err instanceof Error ? err.message : 'No se pudo descargar la canción',
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const localUri = (track as DownloadedTrack).localUri;
    if (localUri) {
      try {
        await DownloadService.shareTrack(localUri);
      } catch (err) {
        Alert.alert('Error', err instanceof Error ? err.message : 'Error al compartir');
      }
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
            await DownloadService.deleteTrack(track.id);
            setDownloaded(false);
            onDeleted?.();
          },
        },
      ],
    );
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.card, isCurrent && styles.cardActive]}>
      {/* Portada */}
      <TouchableOpacity style={styles.thumbnailContainer} onPress={handlePlay} activeOpacity={0.8}>
        {track.thumbnail ? (
          <Image source={{ uri: track.thumbnail }} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnailFallback}>
            <Ionicons name="musical-notes" size={24} color="#666" />
          </View>
        )}
        <View style={styles.playOverlay}>
          {isCurrent && player.isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons
              name={isPlayingThis ? 'pause' : 'play'}
              size={20}
              color="#fff"
            />
          )}
        </View>
      </TouchableOpacity>

      {/* Información de la canción */}
      <TouchableOpacity style={styles.info} onPress={handleOpenPlayer} activeOpacity={0.7}>
        <Text style={[styles.title, isCurrent && styles.titleActive]} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {track.artist || track.channel || 'Desconocido'}
          {track.duration ? ` · ${formatDuration(track.duration)}` : ''}
        </Text>
      </TouchableOpacity>

      {/* Botones de acción */}
      <View style={styles.actions}>
        {downloading ? (
          <View style={styles.progressBadge}>
            <ActivityIndicator size="small" color="#22c55e" />
            <Text style={styles.progressText}>
              {(downloadProgress * 100).toFixed(0)}%
            </Text>
          </View>
        ) : downloaded ? (
          <View style={styles.downloadedGroup}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleShare}
              accessibilityLabel="Compartir canción"
            >
              <Ionicons name="share-outline" size={20} color="#a3a3a3" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleDelete}
              accessibilityLabel="Eliminar descarga"
            >
              <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.downloadBtn}
            onPress={handleDownload}
            activeOpacity={0.7}
            accessibilityLabel="Descargar MP3"
          >
            <Ionicons name="download-outline" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  cardActive: {
    borderColor: '#22c55e',
    backgroundColor: '#1c1917',
  },
  thumbnailContainer: {
    width: 54,
    height: 54,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#27272a',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    color: '#f5f5f5',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  titleActive: {
    color: '#22c55e',
  },
  artist: {
    color: '#a1a1aa',
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadBtn: {
    backgroundColor: '#27272a',
    padding: 10,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadedGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    padding: 6,
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34,197,94,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  progressText: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '700',
  },
});

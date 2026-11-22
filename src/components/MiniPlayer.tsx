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
import { usePlayer } from '../context/PlayerContext';

export const MiniPlayer: React.FC = () => {
  const player = usePlayer();
  const track = player.currentTrack;

  if (!track) return null;

  const progress =
    player.durationMillis > 0
      ? (player.positionMillis / player.durationMillis) * 100
      : 0;

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Barra de progreso superior */}
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${Math.min(100, Math.max(0, progress))}%` }]} />
      </View>

      <View style={styles.content}>
        {/* Portada */}
        {track.thumbnail ? (
          <Image source={{ uri: track.thumbnail }} style={styles.cover} />
        ) : (
          <View style={styles.coverFallback}>
            <Ionicons name="musical-note" size={20} color="#888" />
          </View>
        )}

        {/* Título y artista */}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {track.title}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {track.artist || 'Desconocido'} · {formatTime(player.positionMillis)} / {formatTime(player.durationMillis)}
          </Text>
        </View>

        {/* Controles de reproducción */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={player.togglePlayPause}
            activeOpacity={0.8}
          >
            {player.isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons
                name={player.isPlaying ? 'pause' : 'play'}
                size={24}
                color="#fff"
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={player.stop}>
            <Ionicons name="close" size={20} color="#71717a" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#18181b',
    borderTopWidth: 1,
    borderColor: '#27272a',
    position: 'absolute',
    bottom: 56, // justo encima de la barra de navegación
    left: 0,
    right: 0,
    zIndex: 100,
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: '#27272a',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22c55e',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cover: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#27272a',
  },
  coverFallback: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  meta: {
    color: '#a1a1aa',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playButton: {
    backgroundColor: '#22c55e',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: 6,
  },
});

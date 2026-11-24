import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../context/PlayerContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ARTWORK_SIZE = SCREEN_WIDTH - 64;

export const FullPlayerModal: React.FC = () => {
  const player = usePlayer();
  const track = player.currentTrack;

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekingPosition, setSeekingPosition] = useState(0);
  const progressBarWidthRef = useRef<number>(0);
  const swipeAnimX = useRef(new Animated.Value(0)).current;

  // PanResponder para detectar deslizamiento (Swipe) a la izquierda/derecha en la carátula
  const swipePanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dx) > 15 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
        );
      },
      onPanResponderMove: (_, gestureState) => {
        swipeAnimX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -60) {
          // Deslizó hacia la izquierda -> Siguiente canción
          Animated.timing(swipeAnimX, {
            toValue: -SCREEN_WIDTH,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            player.playNext();
            swipeAnimX.setValue(0);
          });
        } else if (gestureState.dx > 60) {
          // Deslizó hacia la derecha -> Canción anterior
          Animated.timing(swipeAnimX, {
            toValue: SCREEN_WIDTH,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            player.playPrevious();
            swipeAnimX.setValue(0);
          });
        } else {
          // No superó el umbral -> regresar al centro
          Animated.spring(swipeAnimX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  // PanResponder para la barra de reproducción (Tocar o arrastrar para adelantar/atrasar)
  const seekPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setIsSeeking(true);
        handleSeekEvent(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        handleSeekEvent(evt.nativeEvent.locationX);
      },
      onPanResponderRelease: (evt) => {
        const totalDuration = player.durationMillis;
        const barWidth = progressBarWidthRef.current;
        if (barWidth > 0 && totalDuration > 0) {
          const ratio = Math.max(0, Math.min(1, evt.nativeEvent.locationX / barWidth));
          const targetMillis = Math.floor(ratio * totalDuration);
          player.seekTo(targetMillis);
        }
        setIsSeeking(false);
      },
    }),
  ).current;

  const handleSeekEvent = (locationX: number) => {
    const totalDuration = player.durationMillis;
    const barWidth = progressBarWidthRef.current;
    if (barWidth > 0 && totalDuration > 0) {
      const ratio = Math.max(0, Math.min(1, locationX / barWidth));
      setSeekingPosition(Math.floor(ratio * totalDuration));
    }
  };

  if (!track) return null;

  const currentMillis = isSeeking ? seekingPosition : player.positionMillis;
  const totalDuration = player.durationMillis || 1;
  const progressRatio = Math.max(0, Math.min(1, currentMillis / totalDuration));
  const progressPercent = progressRatio * 100;

  const formatTime = (millis: number) => {
    const totalSeconds = Math.max(0, Math.floor(millis / 1000));
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      visible={player.isExpanded}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => player.setIsExpanded(false)}
    >
      <SafeAreaView style={styles.container}>
        {/* Barra superior con botón minimizar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => player.setIsExpanded(false)}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-down" size={28} color="#fff" />
          </TouchableOpacity>

          <View style={styles.topBarCenter}>
            <Text style={styles.topBarSub}>REPRODUCIENDO AHORA</Text>
            <Text style={styles.topBarTitle} numberOfLines={1}>
              {player.queue.length > 1
                ? `${player.currentIndex + 1} de ${player.queue.length}`
                : 'ClassMusic'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={player.stop}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#a1a1aa" />
          </TouchableOpacity>
        </View>

        {/* Carátula grande con soporte para Swipe izquierda/derecha */}
        <View style={styles.artworkContainer} {...swipePanResponder.panHandlers}>
          <Animated.View
            style={[
              styles.artworkWrapper,
              { transform: [{ translateX: swipeAnimX }] },
            ]}
          >
            {track.thumbnail ? (
              <Image
                source={{ uri: track.thumbnail }}
                style={styles.artworkImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.artworkFallback}>
                <Ionicons name="musical-note" size={80} color="#71717a" />
              </View>
            )}
          </Animated.View>
        </View>

        {/* Indicador de gesto */}
        <View style={styles.swipeHintRow}>
          <Ionicons name="chevron-back" size={14} color="#52525b" />
          <Text style={styles.swipeHintText}>Desliza para cambiar de canción</Text>
          <Ionicons name="chevron-forward" size={14} color="#52525b" />
        </View>

        {/* Información de la pista */}
        <View style={styles.infoContainer}>
          <Text style={styles.trackTitle} numberOfLines={2}>
            {track.title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {track.artist || track.channel || 'Desconocido'}
          </Text>
        </View>

        {/* Barra de progreso interactiva (Seekbar) */}
        <View style={styles.progressSection}>
          <View
            style={styles.progressBarTouchArea}
            onLayout={(e) => {
              progressBarWidthRef.current = e.nativeEvent.layout.width;
            }}
            {...seekPanResponder.panHandlers}
          >
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${progressPercent}%` }]}
              />
              <View
                style={[
                  styles.scrubberThumb,
                  { left: `${Math.min(98, Math.max(0, progressPercent))}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(currentMillis)}</Text>
            <Text style={styles.timeText}>{formatTime(player.durationMillis)}</Text>
          </View>
        </View>

        {/* Controles principales de reproducción */}
        <View style={styles.controlsRow}>
          {/* Botón Anterior */}
          <TouchableOpacity
            style={styles.controlSideBtn}
            onPress={player.playPrevious}
            activeOpacity={0.7}
          >
            <Ionicons name="play-skip-back" size={30} color="#fff" />
          </TouchableOpacity>

          {/* Botón Reproducir / Pausar */}
          <TouchableOpacity
            style={styles.playPauseBtn}
            onPress={player.togglePlayPause}
            activeOpacity={0.85}
          >
            {player.isLoading ? (
              <ActivityIndicator size="small" color="#09090b" />
            ) : (
              <Ionicons
                name={player.isPlaying ? 'pause' : 'play'}
                size={34}
                color="#09090b"
                style={!player.isPlaying ? { marginLeft: 3 } : undefined}
              />
            )}
          </TouchableOpacity>

          {/* Botón Siguiente */}
          <TouchableOpacity
            style={styles.controlSideBtn}
            onPress={player.playNext}
            activeOpacity={0.7}
          >
            <Ionicons name="play-skip-forward" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  topBarCenter: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 12,
  },
  topBarSub: {
    color: '#71717a',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  topBarTitle: {
    color: '#e4e4e7',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  artworkWrapper: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#18181b',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  artworkImage: {
    width: '100%',
    height: '100%',
  },
  artworkFallback: {
    flex: 1,
    backgroundColor: '#1c1917',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  swipeHintText: {
    color: '#52525b',
    fontSize: 11,
    fontWeight: '500',
  },
  infoContainer: {
    marginVertical: 12,
  },
  trackTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: 6,
  },
  trackArtist: {
    color: '#a1a1aa',
    fontSize: 15,
    fontWeight: '500',
  },
  progressSection: {
    marginVertical: 8,
  },
  progressBarTouchArea: {
    height: 30,
    justifyContent: 'center',
  },
  progressTrack: {
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#27272a',
    position: 'relative',
    overflow: 'visible',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2.5,
    backgroundColor: '#22c55e',
  },
  scrubberThumb: {
    position: 'absolute',
    top: -4.5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
    marginLeft: -7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeText: {
    color: '#71717a',
    fontSize: 12,
    fontWeight: '500',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginVertical: 14,
    paddingHorizontal: 20,
  },
  controlSideBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18181b',
  },
  playPauseBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});

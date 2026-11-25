import React from 'react';
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '@/store';
import { colors, radius, spacing, typography } from '@/theme';
import { usePlayerGestures } from '../hooks/usePlayerGestures';
import { PlayerArtwork } from './PlayerArtwork';
import { PlayerControls } from './PlayerControls';
import { SeekBar } from './SeekBar';

export const FullPlayerModal: React.FC = () => {
  const player = usePlayer();
  const track = player.currentTrack;

  const gestures = usePlayerGestures({
    durationMillis: player.durationMillis,
    onNext: player.playNext,
    onPrevious: player.playPrevious,
    onSeekTo: player.seekTo,
  });

  if (!track) return null;

  const currentMillis = gestures.isSeeking
    ? gestures.seekingPosition
    : player.positionMillis;

  return (
    <Modal
      visible={player.isExpanded}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => player.setIsExpanded(false)}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => player.setIsExpanded(false)}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-down" size={28} color={colors.textPrimary} />
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
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <PlayerArtwork
          thumbnail={track.thumbnail}
          swipeAnimX={gestures.swipeAnimX}
          panHandlers={gestures.swipePanResponder.panHandlers}
        />

        <View style={styles.infoContainer}>
          <Text style={styles.trackTitle} numberOfLines={2}>
            {track.title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {track.artist || track.channel || 'Desconocido'}
          </Text>
        </View>

        <SeekBar
          currentMillis={currentMillis}
          durationMillis={player.durationMillis}
          panHandlers={gestures.seekPanResponder.panHandlers}
          onLayoutWidth={gestures.setProgressBarWidth}
        />

        <PlayerControls
          isPlaying={player.isPlaying}
          isLoading={player.isLoading}
          onPrevious={player.playPrevious}
          onTogglePlayPause={player.togglePlayPause}
          onNext={player.playNext}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  topBarCenter: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: spacing.md,
  },
  topBarSub: {
    color: colors.textMuted,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  topBarTitle: {
    color: colors.textLight,
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.modal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: { marginVertical: spacing.md },
  trackTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.title,
    fontWeight: typography.weight.extrabold,
    lineHeight: 26,
    marginBottom: 6,
  },
  trackArtist: {
    color: colors.textSecondary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.medium,
  },
});

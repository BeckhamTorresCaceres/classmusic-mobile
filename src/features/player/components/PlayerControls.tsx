import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';

interface PlayerControlsProps {
  isPlaying: boolean;
  isLoading: boolean;
  onPrevious: () => void;
  onTogglePlayPause: () => void;
  onNext: () => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  isLoading,
  onPrevious,
  onTogglePlayPause,
  onNext,
}) => (
  <View style={styles.controlsRow}>
    <TouchableOpacity
      style={styles.controlSideBtn}
      onPress={onPrevious}
      activeOpacity={0.7}
    >
      <Ionicons name="play-skip-back" size={30} color={colors.textPrimary} />
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.playPauseBtn}
      onPress={onTogglePlayPause}
      activeOpacity={0.85}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.primaryForeground} />
      ) : (
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={34}
          color={colors.primaryForeground}
          style={!isPlaying ? styles.playIconOffset : undefined}
        />
      )}
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.controlSideBtn}
      onPress={onNext}
      activeOpacity={0.7}
    >
      <Ionicons name="play-skip-forward" size={30} color={colors.textPrimary} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginVertical: 14,
    paddingHorizontal: spacing.xl,
  },
  controlSideBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  playPauseBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  playIconOffset: { marginLeft: 3 },
});

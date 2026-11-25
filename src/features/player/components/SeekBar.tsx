import React from 'react';
import {
  GestureResponderHandlers,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { formatTimeFromMillis } from '@/shared/utils/formatters';
import { colors, spacing, typography } from '@/theme';

interface SeekBarProps {
  currentMillis: number;
  durationMillis: number;
  panHandlers: GestureResponderHandlers;
  onLayoutWidth: (width: number) => void;
}

export const SeekBar: React.FC<SeekBarProps> = ({
  currentMillis,
  durationMillis,
  panHandlers,
  onLayoutWidth,
}) => {
  const safeDuration = durationMillis || 1;
  const progressRatio = Math.max(0, Math.min(1, currentMillis / safeDuration));
  const progressPercent = progressRatio * 100;

  return (
    <View style={styles.section}>
      <View
        style={styles.touchArea}
        onLayout={(e) => onLayoutWidth(e.nativeEvent.layout.width)}
        {...panHandlers}
      >
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progressPercent}%` }]} />
          <View
            style={[
              styles.thumb,
              { left: `${Math.min(98, Math.max(0, progressPercent))}%` },
            ]}
          />
        </View>
      </View>

      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{formatTimeFromMillis(currentMillis)}</Text>
        <Text style={styles.timeText}>
          {formatTimeFromMillis(durationMillis)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginVertical: spacing.sm },
  touchArea: { height: 30, justifyContent: 'center' },
  track: {
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.surfaceElevated,
    position: 'relative',
    overflow: 'visible',
  },
  fill: {
    height: '100%',
    borderRadius: 2.5,
    backgroundColor: colors.primary,
  },
  thumb: {
    position: 'absolute',
    top: -4.5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.textPrimary,
    marginLeft: -7,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  timeText: {
    color: colors.textMuted,
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
  },
});

import React from 'react';
import {
  Animated,
  Dimensions,
  GestureResponderHandlers,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/theme';

const ARTWORK_SIZE = Dimensions.get('window').width - 64;

interface PlayerArtworkProps {
  thumbnail?: string;
  swipeAnimX: Animated.Value;
  panHandlers: GestureResponderHandlers;
}

export const PlayerArtwork: React.FC<PlayerArtworkProps> = ({
  thumbnail,
  swipeAnimX,
  panHandlers,
}) => (
  <>
    <View style={styles.container} {...panHandlers}>
      <Animated.View
        style={[styles.wrapper, { transform: [{ translateX: swipeAnimX }] }]}
      >
        {thumbnail ? (
          <Image
            source={{ uri: thumbnail }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.fallback}>
            <Ionicons name="musical-note" size={80} color={colors.textMuted} />
          </View>
        )}
      </Animated.View>
    </View>

    <View style={styles.hintRow}>
      <Ionicons name="chevron-back" size={14} color={colors.iconMuted} />
      <Text style={styles.hintText}>Desliza para cambiar de canción</Text>
      <Ionicons name="chevron-forward" size={14} color={colors.iconMuted} />
    </View>
  </>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  wrapper: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  image: { width: '100%', height: '100%' },
  fallback: {
    flex: 1,
    backgroundColor: colors.surfaceActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  hintText: {
    color: colors.iconMuted,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
});

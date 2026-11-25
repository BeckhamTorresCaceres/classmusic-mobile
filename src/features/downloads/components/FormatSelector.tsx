import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { AudioFormat } from '@/shared/types';
import { colors, radius, spacing, typography } from '@/theme';

interface FormatSelectorProps {
  format: AudioFormat;
  onChange: (format: AudioFormat) => void;
}

const FORMATS: AudioFormat[] = ['mp3', 'm4a'];

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  format,
  onChange,
}) => (
  <View style={styles.card}>
    <View>
      <Text style={styles.label}>Formato de descarga</Text>
      <Text style={styles.hint}>
        {format === 'mp3'
          ? 'MP3 · Máxima compatibilidad con carátula'
          : 'M4A · Audio AAC ligero y rápido'}
      </Text>
    </View>
    <View style={styles.switch}>
      {FORMATS.map((fmt) => (
        <TouchableOpacity
          key={fmt}
          style={[styles.pill, format === fmt && styles.pillActive]}
          onPress={() => onChange(fmt)}
        >
          <Text
            style={[styles.pillText, format === fmt && styles.pillTextActive]}
          >
            {fmt.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  label: {
    color: colors.textPrimary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
  hint: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
    marginTop: 1,
  },
  switch: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: 3,
    gap: spacing.xs,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
  },
  pillActive: { backgroundColor: colors.primary },
  pillText: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  pillTextActive: { color: colors.primaryForeground },
});

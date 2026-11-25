import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, withOpacity } from '@/theme';
import { LOCAL_SORT_OPTIONS, type LocalSortOption } from '../types';

interface LocalFilterBarProps {
  query: string;
  sortBy: LocalSortOption;
  onChangeQuery: (q: string) => void;
  onChangeSort: (sort: LocalSortOption) => void;
}

export const LocalFilterBar: React.FC<LocalFilterBarProps> = ({
  query,
  sortBy,
  onChangeQuery,
  onChangeSort,
}) => (
  <View style={styles.controlsBlock}>
    <View style={styles.searchBar}>
      <Ionicons name="search" size={18} color={colors.textMuted} />
      <TextInput
        style={styles.searchInput}
        placeholder="Filtrar en tus canciones descargadas..."
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={onChangeQuery}
      />
      {query.length > 0 && (
        <TouchableOpacity onPress={() => onChangeQuery('')}>
          <Ionicons
            name="close-circle"
            size={18}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>

    <View style={styles.sortRow}>
      {LOCAL_SORT_OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.key}
          style={[styles.sortChip, sortBy === opt.key && styles.sortChipActive]}
          onPress={() => onChangeSort(opt.key)}
        >
          <Text
            style={[
              styles.sortChipText,
              sortBy === opt.key && styles.sortChipTextActive,
            ]}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  controlsBlock: { marginBottom: 10, gap: spacing.sm },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 42,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.size.lg,
  },
  sortRow: { flexDirection: 'row', gap: 6 },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortChipActive: {
    backgroundColor: withOpacity(colors.primary, 0.15),
    borderColor: colors.primary,
  },
  sortChipText: {
    color: colors.textSecondary,
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
  },
  sortChipTextActive: {
    color: colors.primary,
    fontWeight: typography.weight.bold,
  },
});

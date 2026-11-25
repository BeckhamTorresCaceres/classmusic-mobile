import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/theme';

interface SearchInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder: string;
  buttonLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  helperText?: string;
  autoCapitalize?: 'none' | 'sentences';
}

const SearchInputBar: React.FC<SearchInputBarProps> = ({
  value,
  onChangeText,
  onSubmit,
  placeholder,
  buttonLabel,
  icon,
  helperText,
  autoCapitalize = 'sentences',
}) => (
  <View style={styles.section}>
    <View style={styles.searchBar}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        autoCapitalize={autoCapitalize}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.actionBtn} onPress={onSubmit}>
        <Text style={styles.actionBtnText}>{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
    {helperText && <Text style={styles.helperText}>{helperText}</Text>}
  </View>
);

export const AlbumForm: React.FC<{ onSubmit: (query: string) => void }> = ({
  onSubmit,
}) => {
  const [query, setQuery] = useState('');
  return (
    <SearchInputBar
      value={query}
      onChangeText={setQuery}
      onSubmit={() => onSubmit(query)}
      placeholder="Álbum o artista (ej. Un Verano Sin Ti)"
      buttonLabel="Buscar"
      icon="disc-outline"
      helperText="Escribe el nombre del álbum + artista o pega el link de un álbum de YouTube Music."
    />
  );
};

export const SingleForm: React.FC<{ onSubmit: (query: string) => void }> = ({
  onSubmit,
}) => {
  const [query, setQuery] = useState('');
  return (
    <SearchInputBar
      value={query}
      onChangeText={setQuery}
      onSubmit={() => onSubmit(query)}
      placeholder="Nombre o enlace de YouTube..."
      buttonLabel="Cargar"
      icon="link-outline"
      autoCapitalize="none"
    />
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 10, gap: 6 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 46,
    color: colors.textPrimary,
    fontSize: typography.size.lg,
  },
  actionBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.md,
  },
  actionBtnText: {
    color: colors.primaryForeground,
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
  },
  helperText: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
    paddingHorizontal: 2,
  },
});

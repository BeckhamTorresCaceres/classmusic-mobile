import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, withOpacity } from '@/theme';
import type { ListSubMode } from '../types';

interface ListFormProps {
  onSearchTextList: (text: string) => void;
  onLoadUrls: (raw: string) => void;
}

const SUB_MODES: { key: ListSubMode; label: string }[] = [
  { key: 'text', label: 'Lista por nombres' },
  { key: 'url', label: 'URL Playlist / Links' },
];

export const ListForm: React.FC<ListFormProps> = ({
  onSearchTextList,
  onLoadUrls,
}) => {
  const [subMode, setSubMode] = useState<ListSubMode>('text');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');

  return (
    <View style={styles.section}>
      <View style={styles.subModeRow}>
        {SUB_MODES.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.subChip, subMode === opt.key && styles.subChipActive]}
            onPress={() => setSubMode(opt.key)}
          >
            <Text
              style={[
                styles.subChipText,
                subMode === opt.key && styles.subChipTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {subMode === 'text' ? (
        <>
          <TextInput
            style={styles.multiInput}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholder={
              'Una canción por línea:\nBad Bunny - Moscow Mule\nFeid - Normal\nKarol G - Provenza'
            }
            placeholderTextColor={colors.textMuted}
            value={textInput}
            onChangeText={setTextInput}
          />
          <TouchableOpacity
            style={styles.fullWidthBtn}
            onPress={() => onSearchTextList(textInput)}
          >
            <Ionicons name="search" size={16} color={colors.primaryForeground} />
            <Text style={styles.fullWidthBtnText}>Buscar lista completa</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={styles.multiInput}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholder="Pega un enlace de playlist (?list=...) o varios links de YouTube (uno por línea)"
            placeholderTextColor={colors.textMuted}
            value={urlInput}
            onChangeText={setUrlInput}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.fullWidthBtn}
            onPress={() => onLoadUrls(urlInput)}
          >
            <Ionicons name="link" size={16} color={colors.primaryForeground} />
            <Text style={styles.fullWidthBtnText}>
              Cargar canciones del enlace
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 10, gap: 6 },
  subModeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: 2 },
  subChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subChipActive: {
    borderColor: colors.primary,
    backgroundColor: withOpacity(colors.primary, 0.12),
  },
  subChipText: {
    color: colors.textSecondary,
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
  },
  subChipTextActive: {
    color: colors.primary,
    fontWeight: typography.weight.bold,
  },
  multiInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.size.base,
    minHeight: 88,
    maxHeight: 130,
  },
  fullWidthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 10,
  },
  fullWidthBtnText: {
    color: colors.primaryForeground,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
});

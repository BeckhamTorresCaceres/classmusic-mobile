import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AudioFormat, Track } from '@/shared/types';
import { useDownload, usePlayer } from '@/store';
import { colors, layout, radius, spacing, typography } from '@/theme';
import { SelectableTrackRow } from './SelectableTrackRow';

interface DownloadResultsPanelProps {
  title: string | null;
  tracks: Track[];
  selectedIds: Set<string>;
  selectableCount: number;
  allSelectableSelected: boolean;
  format: AudioFormat;
  onToggleTrack: (trackId: string) => void;
  onToggleAll: () => void;
  onDownloadSelected: () => void;
}

export const DownloadResultsPanel: React.FC<DownloadResultsPanelProps> = ({
  title,
  tracks,
  selectedIds,
  selectableCount,
  allSelectableSelected,
  format,
  onToggleTrack,
  onToggleAll,
  onDownloadSelected,
}) => {
  const { isTrackDownloaded, getQueueItem } = useDownload();
  const player = usePlayer();

  return (
    <View style={styles.resultsContainer}>
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle} numberOfLines={1}>
          {title}
        </Text>
        {selectableCount > 0 && (
          <TouchableOpacity onPress={onToggleAll}>
            <Text style={styles.selectAllText}>
              {allSelectableSelected ? 'Deseleccionar' : 'Seleccionar todas'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          selectedIds.size > 0 ? styles.listContentWithBtn : styles.listContent
        }
        renderItem={({ item }) => (
          <SelectableTrackRow
            track={item}
            selected={selectedIds.has(item.id)}
            isDownloaded={isTrackDownloaded(item.id)}
            isInQueue={Boolean(getQueueItem(item.id))}
            onToggle={onToggleTrack}
          />
        )}
      />

      {selectedIds.size > 0 && (
        <TouchableOpacity
          style={[
            styles.downloadCtaBtn,
            { bottom: player.currentTrack ? 76 : 12 },
          ]}
          onPress={onDownloadSelected}
          activeOpacity={0.85}
        >
          <Ionicons
            name="cloud-download"
            size={18}
            color={colors.primaryForeground}
          />
          <Text style={styles.downloadCtaText}>
            Descargar {selectedIds.size}{' '}
            {selectedIds.size === 1 ? 'canción' : 'canciones'} (
            {format.toUpperCase()})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  resultsContainer: { flex: 1, position: 'relative' },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  resultsTitle: {
    flex: 1,
    color: colors.textBody,
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
  },
  selectAllText: {
    color: colors.primary,
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
  },
  listContent: { paddingBottom: layout.listBottomPadding },
  listContentWithBtn: { paddingBottom: layout.listBottomPaddingWithCta },
  downloadCtaBtn: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: radius.xl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  downloadCtaText: {
    color: colors.primaryForeground,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.extrabold,
  },
});

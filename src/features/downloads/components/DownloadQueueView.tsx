import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StateMessage } from '@/shared/components';
import { useDownload } from '@/store';
import { colors, layout, radius, typography } from '@/theme';
import { DownloadQueueItemRow } from './DownloadQueueItemRow';

export const DownloadQueueView: React.FC = () => {
  const { queue, activeCount, retryItem, removeFromQueue, clearCompleted } =
    useDownload();

  const completedCount = queue.filter((i) => i.status === 'completed').length;
  const hasFinished =
    completedCount > 0 || queue.some((i) => i.status === 'error');

  if (queue.length === 0) {
    return (
      <StateMessage
        variant="empty"
        icon="cloud-done-outline"
        title="No hay descargas en cola"
        message="Selecciona un álbum, una lista o una canción para empezar a descargar a tu biblioteca Local."
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          {activeCount > 0
            ? `${activeCount} descargando / en espera`
            : `${completedCount} completadas`}
        </Text>
        {hasFinished && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearCompleted}>
            <Text style={styles.clearBtnText}>Limpiar historial</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={queue}
        keyExtractor={(item) => `${item.track.id}-${item.format}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <DownloadQueueItemRow
            item={item}
            onRetry={retryItem}
            onRemove={removeFromQueue}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryText: {
    color: colors.textSecondary,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  clearBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearBtnText: {
    color: colors.textBody,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  listContent: { paddingBottom: layout.listBottomPadding + 10 },
});

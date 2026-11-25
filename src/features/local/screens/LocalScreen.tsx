import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { StateMessage, TrackCard } from '@/shared/components';
import { colors, layout, spacing } from '@/theme';
import { LocalFilterBar } from '../components/LocalFilterBar';
import { LocalHeaderCard } from '../components/LocalHeaderCard';
import { useLocalLibrary } from '../hooks/useLocalLibrary';

export const LocalScreen: React.FC = () => {
  const lib = useLocalLibrary();

  return (
    <View style={styles.container}>
      <LocalHeaderCard
        totalCount={lib.totalCount}
        totalSizeMB={lib.totalSizeMB}
        hasVisibleTracks={lib.visibleTracks.length > 0}
        onRefresh={lib.refreshDownloads}
        onPlayAll={lib.playAll}
        onShuffle={lib.shufflePlay}
      />

      {lib.totalCount > 0 && (
        <LocalFilterBar
          query={lib.filterQuery}
          sortBy={lib.sortBy}
          onChangeQuery={lib.setFilterQuery}
          onChangeSort={lib.setSortBy}
        />
      )}

      {lib.isLoadingLocal ? (
        <StateMessage variant="loading" message="Cargando música guardada..." />
      ) : lib.totalCount === 0 ? (
        <StateMessage
          variant="empty"
          icon="musical-notes-outline"
          title="Tu biblioteca local está vacía"
          message="Descarga canciones individuales desde Explorar o baja álbumes y listas completas en la pestaña Descargas para escucharlas aquí sin internet."
        />
      ) : lib.visibleTracks.length === 0 ? (
        <StateMessage
          variant="empty"
          icon="search-outline"
          title="Sin coincidencias"
          message={`No hay canciones descargadas que coincidan con "${lib.filterQuery}".`}
        />
      ) : (
        <FlatList
          data={lib.visibleTracks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TrackCard
              track={item}
              queue={lib.visibleTracks}
              isDownloaded={true}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  listContent: { paddingBottom: layout.listBottomPadding },
});

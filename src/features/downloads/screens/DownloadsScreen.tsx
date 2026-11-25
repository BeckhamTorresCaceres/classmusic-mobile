import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StateMessage } from '@/shared/components';
import { useDownload } from '@/store';
import { colors, spacing } from '@/theme';
import { DownloadModeTabs } from '../components/DownloadModeTabs';
import { DownloadQueueView } from '../components/DownloadQueueView';
import { DownloadResultsPanel } from '../components/DownloadResultsPanel';
import { FormatSelector } from '../components/FormatSelector';
import { ListForm } from '../components/ListForm';
import { AlbumForm, SingleForm } from '../components/SingleAndAlbumForms';
import { useBatchResolver } from '../hooks/useBatchResolver';
import type { DownloadMode } from '../types';

const MODE_EMPTY_STATE: Record<
  Exclude<DownloadMode, 'queue'>,
  { icon: keyof typeof Ionicons.glyphMap; message: string }
> = {
  album: {
    icon: 'disc-outline',
    message:
      'Ingresa un álbum para ver su lista de temas y descargarlos de una sola vez.',
  },
  list: {
    icon: 'list-outline',
    message:
      'Pega una lista de canciones o un enlace de playlist para bajarlas todas juntas.',
  },
  single: {
    icon: 'musical-note-outline',
    message:
      'Pega un enlace de YouTube o busca una canción para descargarla en tu formato preferido.',
  },
};

export const DownloadsScreen: React.FC = () => {
  const { defaultFormat, setDefaultFormat, activeCount } = useDownload();
  const [mode, setMode] = useState<DownloadMode>('album');

  const resolver = useBatchResolver(() => setMode('queue'));

  return (
    <View style={styles.container}>
      <FormatSelector format={defaultFormat} onChange={setDefaultFormat} />
      <DownloadModeTabs
        mode={mode}
        activeCount={activeCount}
        onSelect={setMode}
      />

      {mode === 'queue' ? (
        <DownloadQueueView />
      ) : (
        <View style={styles.body}>
          {mode === 'album' && <AlbumForm onSubmit={resolver.searchAlbum} />}
          {mode === 'single' && <SingleForm onSubmit={resolver.searchSingle} />}
          {mode === 'list' && (
            <ListForm
              onSearchTextList={resolver.searchTextList}
              onLoadUrls={resolver.loadPlaylistOrUrls}
            />
          )}

          {resolver.searching ? (
            <StateMessage
              variant="loading"
              message="Obteniendo canciones del servidor..."
            />
          ) : resolver.errorMsg ? (
            <StateMessage variant="error" message={resolver.errorMsg} />
          ) : resolver.foundTracks.length > 0 ? (
            <DownloadResultsPanel
              title={resolver.resultsTitle}
              tracks={resolver.foundTracks}
              selectedIds={resolver.selectedIds}
              selectableCount={resolver.selectableCount}
              allSelectableSelected={resolver.allSelectableSelected}
              format={defaultFormat}
              onToggleTrack={resolver.toggleTrackSelection}
              onToggleAll={resolver.toggleAll}
              onDownloadSelected={resolver.downloadSelected}
            />
          ) : (
            <StateMessage
              variant="empty"
              icon={MODE_EMPTY_STATE[mode].icon}
              message={MODE_EMPTY_STATE[mode].message}
            />
          )}
        </View>
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
  body: { flex: 1 },
});

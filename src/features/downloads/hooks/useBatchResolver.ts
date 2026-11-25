import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import type { Track } from '@/shared/types';
import { useDownload } from '@/store';
import {
  resolveAlbumQuery,
  resolvePlaylistOrUrlsQuery,
  resolveSingleQuery,
  resolveTextListQuery,
  type ResolvedBatch,
} from '../services/batchResolvers';
import { LONG_TRACK_THRESHOLD_SECONDS } from '../types';

export function useBatchResolver(onEnqueued: () => void) {
  const { defaultFormat, isTrackDownloaded, getQueueItem, enqueueMany } =
    useDownload();

  const [searching, setSearching] = useState(false);
  const [resultsTitle, setResultsTitle] = useState<string | null>(null);
  const [foundTracks, setFoundTracks] = useState<Track[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const applyResolvedBatch = useCallback(
    ({ tracks, title }: ResolvedBatch) => {
      setFoundTracks(tracks);
      setResultsTitle(title);

      const autoSelected = new Set<string>();
      for (const t of tracks) {
        const isLong = (t.duration || 0) > LONG_TRACK_THRESHOLD_SECONDS;
        if (!isLong && !isTrackDownloaded(t.id) && !getQueueItem(t.id)) {
          autoSelected.add(t.id);
        }
      }
      setSelectedIds(autoSelected);
    },
    [getQueueItem, isTrackDownloaded],
  );

  const runResolver = async (
    task: () => Promise<ResolvedBatch>,
    fallbackErr: string,
  ) => {
    try {
      setSearching(true);
      setErrorMsg(null);
      setFoundTracks([]);
      applyResolvedBatch(await task());
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : fallbackErr);
    } finally {
      setSearching(false);
    }
  };

  const searchAlbum = (rawQuery: string) => {
    if (!rawQuery.trim()) return;
    return runResolver(
      () => resolveAlbumQuery(rawQuery),
      'No se pudo cargar el álbum.',
    );
  };

  const searchTextList = (rawText: string) => {
    if (!rawText.trim()) {
      Alert.alert(
        'Lista vacía',
        'Escribe o pega al menos una canción (una por línea).',
      );
      return;
    }
    return runResolver(
      () => resolveTextListQuery(rawText),
      'Error procesando la lista.',
    );
  };

  const loadPlaylistOrUrls = (rawInput: string) => {
    if (!rawInput.trim()) return;
    return runResolver(
      () => resolvePlaylistOrUrlsQuery(rawInput),
      'No se pudo cargar la playlist o enlaces.',
    );
  };

  const searchSingle = (rawQuery: string) => {
    if (!rawQuery.trim()) return;
    return runResolver(
      () => resolveSingleQuery(rawQuery),
      'No se pudo buscar la canción.',
    );
  };

  const toggleTrackSelection = (trackId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
  };

  const selectableTracks = useMemo(
    () =>
      foundTracks.filter(
        (t) => !isTrackDownloaded(t.id) && !getQueueItem(t.id),
      ),
    [foundTracks, getQueueItem, isTrackDownloaded],
  );

  const allSelectableSelected =
    selectableTracks.length > 0 &&
    selectableTracks.every((t) => selectedIds.has(t.id));

  const toggleAll = () => {
    setSelectedIds(
      allSelectableSelected
        ? new Set()
        : new Set(selectableTracks.map((t) => t.id)),
    );
  };

  const downloadSelected = () => {
    const toDownload = foundTracks.filter((t) => selectedIds.has(t.id));
    if (toDownload.length === 0) return;

    const { added, skipped } = enqueueMany(toDownload, defaultFormat);
    setSelectedIds(new Set());
    onEnqueued();

    if (added > 0 && skipped > 0) {
      Alert.alert(
        'Descarga iniciada',
        `Se agregaron ${added} canciones (${skipped} ya estaban guardadas o en cola).`,
      );
    }
  };

  return {
    searching,
    resultsTitle,
    foundTracks,
    selectedIds,
    errorMsg,
    selectableCount: selectableTracks.length,
    allSelectableSelected,
    searchAlbum,
    searchTextList,
    loadPlaylistOrUrls,
    searchSingle,
    toggleTrackSelection,
    toggleAll,
    downloadSelected,
  };
}

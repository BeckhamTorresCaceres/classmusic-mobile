import { useMemo, useState } from 'react';
import { formatMegabytes } from '@/shared/utils/formatters';
import { useDownload, usePlayer } from '@/store';
import type { LocalSortOption } from '../types';

export function useLocalLibrary() {
  const { downloadedTracks, isLoadingLocal, refreshDownloads } = useDownload();
  const player = usePlayer();

  const [filterQuery, setFilterQuery] = useState('');
  const [sortBy, setSortBy] = useState<LocalSortOption>('recent');

  const totalSizeMB = useMemo(() => {
    const bytes = downloadedTracks.reduce((acc, t) => acc + (t.fileSize || 0), 0);
    return formatMegabytes(bytes);
  }, [downloadedTracks]);

  const visibleTracks = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    const filtered = q
      ? downloadedTracks.filter((t) => {
          const haystack = [
            t.title,
            t.artist,
            t.channel,
            t.album,
            ...(t.artists || []),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return haystack.includes(q);
        })
      : [...downloadedTracks];

    filtered.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'artist') {
        return (a.artist || a.channel || '').localeCompare(
          b.artist || b.channel || '',
        );
      }
      if (sortBy === 'size') return (b.fileSize || 0) - (a.fileSize || 0);
      return (b.downloadedAt || 0) - (a.downloadedAt || 0);
    });

    return filtered;
  }, [downloadedTracks, filterQuery, sortBy]);

  const playAll = async () => {
    if (visibleTracks.length === 0) return;
    await player.playTrack(visibleTracks[0], visibleTracks);
    player.setIsExpanded(true);
  };

  const shufflePlay = async () => {
    if (visibleTracks.length === 0) return;
    const shuffled = [...visibleTracks];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    await player.playTrack(shuffled[0], shuffled);
    player.setIsExpanded(true);
  };

  return {
    totalCount: downloadedTracks.length,
    totalSizeMB,
    visibleTracks,
    isLoadingLocal,
    filterQuery,
    setFilterQuery,
    sortBy,
    setSortBy,
    refreshDownloads,
    playAll,
    shufflePlay,
  };
}

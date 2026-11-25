import { useCallback, useEffect, useState } from 'react';
import { MusicApi } from '@/services';
import type { Track } from '@/shared/types';

const INITIAL_QUERY = 'musica exitos 2026';

export function useTrackSearch() {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(
    async (term?: string) => {
      const searchText = (term !== undefined ? term : query).trim();
      if (!searchText) return;

      try {
        setLoading(true);
        setError(null);
        const results = await MusicApi.searchTracks(searchText, 20);
        setTracks(results);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudo completar la búsqueda',
        );
      } finally {
        setLoading(false);
      }
    },
    [query],
  );

  useEffect(() => {
    let active = true;
    MusicApi.searchTracks(INITIAL_QUERY, 20)
      .then((results) => {
        if (active) setTracks(results);
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo completar la búsqueda',
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    query,
    setQuery,
    tracks,
    loading,
    error,
    handleSearch,
  };
}

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  buildEnqueueBatch,
  DownloadStorage,
  loadSavedAudioFormat,
  patchQueueItem,
  saveAudioFormat,
  type EnqueueResult,
} from '@/services';
import type {
  AudioFormat,
  DownloadedTrack,
  DownloadQueueItem,
  Track,
} from '@/shared/types';

const MAX_CONCURRENT_DOWNLOADS = 2;

interface DownloadContextType {
  downloadedTracks: DownloadedTrack[];
  queue: DownloadQueueItem[];
  defaultFormat: AudioFormat;
  activeCount: number;
  isLoadingLocal: boolean;
  setDefaultFormat: (format: AudioFormat) => Promise<void>;
  isTrackDownloaded: (trackId: string) => boolean;
  getQueueItem: (trackId: string) => DownloadQueueItem | undefined;
  enqueueTrack: (track: Track, format?: AudioFormat) => EnqueueResult;
  enqueueMany: (tracks: Track[], format?: AudioFormat) => EnqueueResult;
  retryItem: (trackId: string) => void;
  removeFromQueue: (trackId: string) => void;
  clearCompleted: () => void;
  deleteDownloadedTrack: (trackId: string) => Promise<void>;
  refreshDownloads: () => Promise<void>;
}

const DownloadContext = createContext<DownloadContextType>(
  {} as DownloadContextType,
);

export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [downloadedTracks, setDownloadedTracks] = useState<DownloadedTrack[]>([]);
  const [queue, setQueue] = useState<DownloadQueueItem[]>([]);
  const [defaultFormat, setDefaultFormatState] = useState<AudioFormat>('mp3');
  const [isLoadingLocal, setIsLoadingLocal] = useState(true);

  const downloadedRef = useRef<DownloadedTrack[]>([]);
  const queueRef = useRef<DownloadQueueItem[]>([]);
  const runningIdsRef = useRef<Set<string>>(new Set());

  const updateQueue = useCallback(
    (fn: (prev: DownloadQueueItem[]) => DownloadQueueItem[]) => {
      setQueue((prev) => {
        const next = fn(prev);
        queueRef.current = next;
        return next;
      });
    },
    [],
  );

  const refreshDownloads = useCallback(async () => {
    try {
      const tracks = await DownloadStorage.getDownloadedTracks();
      downloadedRef.current = tracks;
      setDownloadedTracks(tracks);
    } finally {
      setIsLoadingLocal(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    DownloadStorage.getDownloadedTracks()
      .then((tracks) => {
        if (!active) return;
        downloadedRef.current = tracks;
        setDownloadedTracks(tracks);
      })
      .finally(() => {
        if (active) setIsLoadingLocal(false);
      });

    loadSavedAudioFormat().then((fmt) => {
      if (active && fmt) setDefaultFormatState(fmt);
    });

    return () => {
      active = false;
    };
  }, []);

  const setDefaultFormat = useCallback(async (format: AudioFormat) => {
    setDefaultFormatState(format);
    await saveAudioFormat(format);
  }, []);

  const processQueue = useCallback(() => {
    const scheduleAvailable = () => {
      while (runningIdsRef.current.size < MAX_CONCURRENT_DOWNLOADS) {
        const next = queueRef.current.find(
          (i) => i.status === 'queued' && !runningIdsRef.current.has(i.track.id),
        );
        if (!next) break;

        const { track, format } = next;
        runningIdsRef.current.add(track.id);
        updateQueue((p) =>
          patchQueueItem(p, track.id, {
            status: 'downloading',
            progress: 0,
            error: undefined,
          }),
        );

        DownloadStorage.downloadTrack(track, format, (progress) =>
          updateQueue((p) =>
            p.map((i) =>
              i.track.id === track.id && i.status === 'downloading'
                ? { ...i, progress }
                : i,
            ),
          ),
        )
          .then((saved) => {
            downloadedRef.current = [
              saved,
              ...downloadedRef.current.filter((t) => t.id !== saved.id),
            ];
            setDownloadedTracks(downloadedRef.current);
            updateQueue((p) =>
              patchQueueItem(p, track.id, { status: 'completed', progress: 1 }),
            );
          })
          .catch((err) => {
            const error = err instanceof Error ? err.message : 'Error al descargar';
            updateQueue((p) =>
              patchQueueItem(p, track.id, { status: 'error', error }),
            );
          })
          .finally(() => {
            runningIdsRef.current.delete(track.id);
            scheduleAvailable();
          });
      }
    };

    scheduleAvailable();
  }, [updateQueue]);

  const enqueueMany = useCallback(
    (tracks: Track[], format?: AudioFormat): EnqueueResult => {
      const { newItems, summary } = buildEnqueueBatch(
        tracks,
        format || defaultFormat,
        downloadedRef.current,
        queueRef.current,
      );
      if (newItems.length > 0) {
        updateQueue((prev) => {
          const ids = new Set(newItems.map((i) => i.track.id));
          return [...prev.filter((i) => !ids.has(i.track.id)), ...newItems];
        });
        setTimeout(() => processQueue(), 0);
      }
      return summary;
    },
    [defaultFormat, processQueue, updateQueue],
  );

  const enqueueTrack = useCallback(
    (t: Track, f?: AudioFormat) => enqueueMany([t], f),
    [enqueueMany],
  );

  const retryItem = useCallback(
    (trackId: string) => {
      updateQueue((p) =>
        patchQueueItem(p, trackId, {
          status: 'queued',
          progress: 0,
          error: undefined,
        }),
      );
      setTimeout(() => processQueue(), 0);
    },
    [processQueue, updateQueue],
  );

  const removeFromQueue = useCallback(
    (trackId: string) =>
      updateQueue((p) =>
        p.filter((i) => i.track.id !== trackId || i.status === 'downloading'),
      ),
    [updateQueue],
  );

  const clearCompleted = useCallback(
    () =>
      updateQueue((p) =>
        p.filter((i) => i.status === 'queued' || i.status === 'downloading'),
      ),
    [updateQueue],
  );

  const deleteDownloadedTrack = useCallback(async (trackId: string) => {
    await DownloadStorage.deleteTrack(trackId);
    downloadedRef.current = downloadedRef.current.filter((t) => t.id !== trackId);
    setDownloadedTracks(downloadedRef.current);
  }, []);

  const isTrackDownloaded = useCallback(
    (id: string) => downloadedTracks.some((t) => t.id === id),
    [downloadedTracks],
  );

  const getQueueItem = useCallback(
    (id: string) => queue.find((i) => i.track.id === id),
    [queue],
  );

  const activeCount = queue.filter(
    (i) => i.status === 'queued' || i.status === 'downloading',
  ).length;

  return (
    <DownloadContext.Provider
      value={{
        downloadedTracks,
        queue,
        defaultFormat,
        activeCount,
        isLoadingLocal,
        setDefaultFormat,
        isTrackDownloaded,
        getQueueItem,
        enqueueTrack,
        enqueueMany,
        retryItem,
        removeFromQueue,
        clearCompleted,
        deleteDownloadedTrack,
        refreshDownloads,
      }}
    >
      {children}
    </DownloadContext.Provider>
  );
};

export const useDownload = () => useContext(DownloadContext);

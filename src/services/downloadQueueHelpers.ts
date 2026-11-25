import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AudioFormat,
  DownloadedTrack,
  DownloadQueueItem,
  Track,
} from '@/shared/types';

const FORMAT_KEY = '@classmusic_default_format';

export interface EnqueueResult {
  added: number;
  skipped: number;
}

export async function loadSavedAudioFormat(): Promise<AudioFormat | null> {
  try {
    const val = await AsyncStorage.getItem(FORMAT_KEY);
    return val === 'mp3' || val === 'm4a' ? val : null;
  } catch {
    return null;
  }
}

export async function saveAudioFormat(format: AudioFormat): Promise<void> {
  await AsyncStorage.setItem(FORMAT_KEY, format).catch(() => {});
}

export function patchQueueItem(
  queue: DownloadQueueItem[],
  trackId: string,
  patch: Partial<DownloadQueueItem>,
): DownloadQueueItem[] {
  return queue.map((item) =>
    item.track.id === trackId ? { ...item, ...patch } : item,
  );
}

export function buildEnqueueBatch(
  tracks: Track[],
  format: AudioFormat,
  downloadedTracks: DownloadedTrack[],
  currentQueue: DownloadQueueItem[],
): { newItems: DownloadQueueItem[]; summary: EnqueueResult } {
  let added = 0;
  let skipped = 0;
  const newItems: DownloadQueueItem[] = [];
  const seenInBatch = new Set<string>();

  for (const track of tracks) {
    if (!track.id || seenInBatch.has(track.id)) {
      skipped++;
      continue;
    }
    seenInBatch.add(track.id);

    const alreadyLocal = downloadedTracks.some((d) => d.id === track.id);
    const alreadyInQueue = currentQueue.some(
      (q) =>
        q.track.id === track.id &&
        (q.status === 'queued' || q.status === 'downloading'),
    );

    if (alreadyLocal || alreadyInQueue) {
      skipped++;
      continue;
    }

    added++;
    newItems.push({ track, format, status: 'queued', progress: 0 });
  }

  return { newItems, summary: { added, skipped } };
}

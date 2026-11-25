import { MusicApi } from '@/services';
import type { Track } from '@/shared/types';
import {
  extractYoutubePlaylistId,
  extractYoutubeVideoId,
} from '@/shared/utils/youtubeUrl';

const RESOLVE_BATCH_SIZE = 3;
const MAX_BATCH_ITEMS = 30;

export interface ResolvedBatch {
  title: string;
  tracks: Track[];
}

async function resolveTracksInBatches<T>(
  items: T[],
  resolver: (item: T) => Promise<Track | null>,
): Promise<Track[]> {
  const resolved: Track[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < items.length; i += RESOLVE_BATCH_SIZE) {
    const chunk = items.slice(i, i + RESOLVE_BATCH_SIZE);
    const settled = await Promise.allSettled(chunk.map((item) => resolver(item)));
    for (const res of settled) {
      if (res.status === 'fulfilled' && res.value && !seenIds.has(res.value.id)) {
        seenIds.add(res.value.id);
        resolved.push(res.value);
      }
    }
  }
  return resolved;
}

export async function resolveAlbumQuery(rawQuery: string): Promise<ResolvedBatch> {
  const q = rawQuery.trim();
  if (extractYoutubePlaylistId(q)) {
    return MusicApi.resolvePlaylistTracks(q);
  }
  const tracks = await MusicApi.searchTracks(q, 25);
  if (tracks.length === 0) {
    throw new Error('No se encontraron canciones para ese álbum o artista.');
  }
  return { title: `Álbum / Búsqueda: "${q}"`, tracks };
}

export async function resolveTextListQuery(rawText: string): Promise<ResolvedBatch> {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, MAX_BATCH_ITEMS);

  const resolved = await resolveTracksInBatches(lines, async (line) => {
    const vidId = extractYoutubeVideoId(line);
    if (vidId) return MusicApi.getTrackDetails(vidId);
    const matches = await MusicApi.searchTracks(line, 1);
    return matches[0] || null;
  });

  if (resolved.length === 0) {
    throw new Error('No se encontró ninguna canción de tu lista.');
  }
  return {
    title: `Lista resuelta (${resolved.length} de ${lines.length} líneas)`,
    tracks: resolved,
  };
}

export async function resolvePlaylistOrUrlsQuery(
  rawInput: string,
): Promise<ResolvedBatch> {
  const lines = rawInput
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 1 && extractYoutubePlaylistId(lines[0])) {
    return MusicApi.resolvePlaylistTracks(lines[0]);
  }

  const uniqueIds = Array.from(
    new Set(
      lines
        .map((l) => extractYoutubeVideoId(l))
        .filter((id): id is string => Boolean(id)),
    ),
  ).slice(0, MAX_BATCH_ITEMS);

  if (uniqueIds.length === 0) {
    throw new Error(
      'Pega una URL de playlist de YouTube (?list=...) o varios links de canciones.',
    );
  }

  const tracks = await resolveTracksInBatches(uniqueIds, async (id) => {
    try {
      return await MusicApi.getTrackDetails(id);
    } catch {
      return {
        id,
        title: `Pista ${id}`,
        url: `https://www.youtube.com/watch?v=${id}`,
      };
    }
  });
  return { title: `${tracks.length} enlaces listos`, tracks };
}

export async function resolveSingleQuery(rawQuery: string): Promise<ResolvedBatch> {
  const q = rawQuery.trim();
  const vidId = extractYoutubeVideoId(q);
  if (vidId) {
    const track = await MusicApi.getTrackDetails(vidId);
    return { title: 'Canción por enlace', tracks: [track] };
  }
  const tracks = await MusicApi.searchTracks(q, 15);
  if (tracks.length === 0) {
    throw new Error('No se encontraron coincidencias para esa canción.');
  }
  return { title: `Resultados para "${q}"`, tracks };
}

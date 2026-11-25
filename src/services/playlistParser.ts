import type { Track } from '@/shared/types';

function extractPlaylistTitle(data: unknown): string | undefined {
  try {
    const json = JSON.stringify(data);
    const match = json.match(/"playlistMetadataRenderer":\{"title":"([^"]+)"/);
    return match?.[1];
  } catch {
    return undefined;
  }
}

function parsePlaylistInitialData(data: unknown): Track[] {
  const tracks: Track[] = [];
  const seen = new Set<string>();

  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }

    const record = node as Record<string, unknown>;
    if (
      record.playlistVideoRenderer &&
      typeof record.playlistVideoRenderer === 'object'
    ) {
      const v = record.playlistVideoRenderer as Record<string, unknown>;
      const videoId = typeof v.videoId === 'string' ? v.videoId : null;
      if (videoId && !seen.has(videoId)) {
        seen.add(videoId);
        const titleRuns = (v.title as { runs?: { text?: string }[] })?.runs;
        const simpleTitle = (v.title as { simpleText?: string })?.simpleText;
        const title = titleRuns?.[0]?.text || simpleTitle || 'Sin título';

        const artistRuns = (
          v.shortBylineText as { runs?: { text?: string }[] }
        )?.runs;
        const rawArtist = artistRuns?.[0]?.text;
        const artist = rawArtist
          ? rawArtist.replace(/\s*-\s*Topic$/i, '').trim()
          : undefined;

        const lengthSec = Number(v.lengthSeconds);
        const thumbs = (
          v.thumbnail as { thumbnails?: { url?: string }[] }
        )?.thumbnails;
        const thumbnail =
          thumbs?.at(-1)?.url ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

        tracks.push({
          id: videoId,
          title,
          artist,
          channel: rawArtist,
          duration:
            Number.isFinite(lengthSec) && lengthSec > 0 ? lengthSec : undefined,
          thumbnail,
          url: `https://www.youtube.com/watch?v=${videoId}`,
        });
      }
      return;
    }

    for (const value of Object.values(record)) {
      walk(value);
    }
  };

  walk(data);
  return tracks;
}

export async function fetchPublicYoutubePlaylist(
  playlistUrl: string,
): Promise<{ title: string; tracks: Track[] }> {
  const res = await fetch(playlistUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
    },
  });

  if (!res.ok) {
    throw new Error('No se pudo leer la lista desde YouTube.');
  }

  const html = await res.text();
  const match = html.match(
    /var ytInitialData\s*=\s*(\{[\s\S]*?\});\s*<\/script>/,
  );
  if (!match?.[1]) {
    throw new Error(
      'No se pudieron extraer las canciones de esta URL. Prueba buscar el álbum por nombre.',
    );
  }

  const initialData = JSON.parse(match[1]) as Record<string, unknown>;
  const tracks = parsePlaylistInitialData(initialData);
  if (tracks.length === 0) {
    throw new Error(
      'La playlist está vacía, es privada o requiere soporte adicional en el servidor.',
    );
  }

  return {
    title: extractPlaylistTitle(initialData) || 'Lista de reproducción',
    tracks,
  };
}

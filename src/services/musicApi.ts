import type {
  ArtistCatalog,
  AudioFormat,
  SearchCatalog,
  Track,
} from '@/shared/types';
import {
  extractYoutubePlaylistId,
  extractYoutubeVideoId,
} from '@/shared/utils/youtubeUrl';
import { ApiClient } from './apiClient';
import { fetchPublicYoutubePlaylist } from './playlistParser';

export const MusicApi = {
  async searchTracks(query: string, limit = 20): Promise<Track[]> {
    const data = await ApiClient.request<{ success: boolean; tracks: Track[] }>(
      `/search?q=${encodeURIComponent(query)}&limit=${limit}`,
    );
    return data.tracks || [];
  },

  async searchCatalog(query: string): Promise<SearchCatalog> {
    const data = await ApiClient.request<{ success: boolean } & SearchCatalog>(
      `/search/catalog?q=${encodeURIComponent(query)}`,
    );
    return {
      tracks: data.tracks || [],
      albums: data.albums || [],
      artists: data.artists || [],
    };
  },

  async getArtistCatalog(artist: string): Promise<ArtistCatalog> {
    const data = await ApiClient.request<{ success: boolean } & ArtistCatalog>(
      `/artists/${encodeURIComponent(artist.trim())}`,
    );
    return {
      artist: data.artist || artist,
      popular: data.popular || [],
      albums: data.albums || [],
      singles: data.singles || [],
    };
  },

  async getTrackDetails(id: string): Promise<Track> {
    const cleanId = extractYoutubeVideoId(id) || id.trim();
    const data = await ApiClient.request<{ success: boolean; track: Track }>(
      `/tracks/${encodeURIComponent(cleanId)}`,
    );
    return data.track;
  },

  async resolvePlaylistTracks(
    urlOrId: string,
  ): Promise<{ title: string; tracks: Track[] }> {
    const listId = extractYoutubePlaylistId(urlOrId);
    if (!listId) {
      throw new Error('No se detectó un enlace o ID de playlist/álbum válido.');
    }

    const playlistUrl = `https://www.youtube.com/playlist?list=${encodeURIComponent(listId)}`;

    try {
      const data = await ApiClient.request<{
        success: boolean;
        title?: string;
        tracks?: Track[];
      }>(`/playlist?url=${encodeURIComponent(playlistUrl)}`);
      if (data.tracks && data.tracks.length > 0) {
        return {
          title: data.title || 'Lista de reproducción',
          tracks: data.tracks,
        };
      }
    } catch {
      // Fallback al lector público de YouTube si el backend aún no expone /playlist
    }

    return fetchPublicYoutubePlaylist(playlistUrl);
  },

  async getStreamUrl(trackId: string): Promise<string> {
    if (!trackId || !trackId.trim()) {
      throw new Error('ID de canción no especificado');
    }
    const { accessToken } = await ApiClient.getTokens();
    return `${ApiClient.getBaseUrl()}/stream/${encodeURIComponent(trackId.trim())}?token=${accessToken || ''}`;
  },

  async getDownloadUrl(
    trackId: string,
    format: AudioFormat = 'mp3',
  ): Promise<string> {
    if (!trackId || !trackId.trim()) {
      throw new Error('ID de canción no especificado');
    }
    const { accessToken } = await ApiClient.getTokens();
    return `${ApiClient.getBaseUrl()}/download/${encodeURIComponent(trackId.trim())}?format=${format}&token=${accessToken || ''}`;
  },

  async checkHealth(): Promise<{ status: string; ytdlpVersion?: string }> {
    const res = await fetch(`${ApiClient.getBaseUrl()}/health`);
    if (!res.ok) throw new Error('Servidor no responde');
    return res.json();
  },
};

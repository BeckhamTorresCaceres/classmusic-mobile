import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { AudioFormat, DownloadedTrack, Track } from '@/shared/types';
import { MusicApi } from './musicApi';

const DOWNLOADS_KEY = '@classmusic_downloaded_tracks_list';
const MIN_VALID_AUDIO_BYTES = 50000;

export class DownloadStorage {
  private static musicDir = `${FileSystem.documentDirectory}music/`;

  static async init(): Promise<void> {
    const info = await FileSystem.getInfoAsync(this.musicDir);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(this.musicDir, {
        intermediates: true,
      });
    }
  }

  static async getDownloadedTracks(): Promise<DownloadedTrack[]> {
    try {
      const json = await AsyncStorage.getItem(DOWNLOADS_KEY);
      if (!json) return [];
      const tracks: DownloadedTrack[] = JSON.parse(json);

      const validTracks: DownloadedTrack[] = [];
      let hadCorrupt = false;

      for (const t of tracks) {
        if (!t.localUri) {
          hadCorrupt = true;
          continue;
        }
        try {
          const info = await FileSystem.getInfoAsync(t.localUri);
          const size = info.exists ? (info as { size: number }).size : 0;
          if (info.exists && size >= MIN_VALID_AUDIO_BYTES) {
            validTracks.push({ ...t, fileSize: size });
          } else {
            hadCorrupt = true;
            if (info.exists) {
              await FileSystem.deleteAsync(t.localUri, { idempotent: true });
            }
          }
        } catch {
          hadCorrupt = true;
        }
      }

      if (hadCorrupt) {
        await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(validTracks));
      }

      return validTracks;
    } catch {
      return [];
    }
  }

  static async downloadTrack(
    track: Track,
    format: AudioFormat = 'mp3',
    onProgress?: (progress: number) => void,
  ): Promise<DownloadedTrack> {
    await this.init();

    const downloadUrl = await MusicApi.getDownloadUrl(track.id, format);
    const cleanTitle = (track.title || 'cancion')
      .replace(/[\\/:*?"<>|]/g, '_')
      .slice(0, 80);
    const fileUri = `${this.musicDir}${track.id}-${cleanTitle}.${format}`;

    const existing = await FileSystem.getInfoAsync(fileUri);
    if (existing.exists) {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    }

    const downloadResumable = FileSystem.createDownloadResumable(
      downloadUrl,
      fileUri,
      {},
      (downloadProgress) => {
        if (downloadProgress.totalBytesExpectedToWrite > 0) {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          onProgress?.(Math.min(1, Math.max(0, progress)));
        }
      },
    );

    const result = await downloadResumable.downloadAsync();
    if (!result || !result.uri || result.status !== 200) {
      if (result?.uri) {
        await FileSystem.deleteAsync(result.uri, { idempotent: true });
      }
      throw new Error(
        `Error del servidor al descargar (HTTP ${result?.status || 500}).`,
      );
    }

    const fileInfo = await FileSystem.getInfoAsync(result.uri);
    const size = fileInfo.exists ? (fileInfo as { size: number }).size : 0;
    if (size < MIN_VALID_AUDIO_BYTES) {
      await FileSystem.deleteAsync(result.uri, { idempotent: true });
      throw new Error(
        'El archivo descargado no es un audio válido (respuesta de error del servidor).',
      );
    }

    const downloadedTrack: DownloadedTrack = {
      ...track,
      localUri: result.uri,
      downloadedAt: Date.now(),
      fileSize: size,
      format,
    };

    const current = await this.getDownloadedTracks();
    const updated = [
      downloadedTrack,
      ...current.filter((t) => t.id !== track.id),
    ];
    await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updated));

    return downloadedTrack;
  }

  static async shareTrack(localUri: string): Promise<void> {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Compartir archivos no está disponible en este dispositivo');
    }
    const isM4a = localUri.toLowerCase().endsWith('.m4a');
    await Sharing.shareAsync(localUri, {
      mimeType: isM4a ? 'audio/mp4' : 'audio/mpeg',
      dialogTitle: 'Guardar o compartir canción',
      UTI: isM4a ? 'public.mpeg-4-audio' : 'public.mp3',
    });
  }

  static async deleteTrack(trackId: string): Promise<void> {
    const current = await this.getDownloadedTracks();
    const target = current.find((t) => t.id === trackId);

    if (target?.localUri) {
      try {
        await FileSystem.deleteAsync(target.localUri, { idempotent: true });
      } catch {
        // Ignorar si el archivo ya no existía
      }
    }

    const updated = current.filter((t) => t.id !== trackId);
    await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updated));
  }
}

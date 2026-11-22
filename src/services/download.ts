import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { DownloadedTrack, Track } from '../types';
import { ApiService } from './api';

const DOWNLOADS_KEY = '@classmusic_downloaded_tracks_list';

export class DownloadService {
  private static musicDir = `${FileSystem.documentDirectory}music/`;

  static async init(): Promise<void> {
    const info = await FileSystem.getInfoAsync(this.musicDir);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(this.musicDir, { intermediates: true });
    }
  }

  static async getDownloadedTracks(): Promise<DownloadedTrack[]> {
    try {
      const json = await AsyncStorage.getItem(DOWNLOADS_KEY);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  }

  static async isTrackDownloaded(trackId: string): Promise<boolean> {
    const tracks = await this.getDownloadedTracks();
    return tracks.some((t) => t.id === trackId);
  }

  static async downloadTrack(
    track: Track,
    format: 'mp3' | 'm4a' = 'mp3',
    onProgress?: (progress: number) => void,
  ): Promise<DownloadedTrack> {
    await this.init();

    const downloadUrl = await ApiService.getDownloadUrl(track.id, format);
    // Sanear el nombre del archivo para evitar caracteres inválidos
    const cleanTitle = (track.title || 'cancion')
      .replace(/[\\/:*?"<>|]/g, '_')
      .slice(0, 80);
    const fileName = `${track.id}-${cleanTitle}.${format}`;
    const fileUri = `${this.musicDir}${fileName}`;

    // Si ya existe el archivo físico, lo eliminamos primero
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
    if (!result || !result.uri) {
      throw new Error('No se pudo completar la descarga del archivo');
    }

    const fileInfo = await FileSystem.getInfoAsync(result.uri);
    const downloadedTrack: DownloadedTrack = {
      ...track,
      localUri: result.uri,
      downloadedAt: Date.now(),
      fileSize: fileInfo.exists ? (fileInfo as { size: number }).size : undefined,
    };

    // Guardar en la lista de canciones descargadas
    const current = await this.getDownloadedTracks();
    const updated = [downloadedTrack, ...current.filter((t) => t.id !== track.id)];
    await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updated));

    return downloadedTrack;
  }

  static async shareTrack(localUri: string): Promise<void> {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Compartir archivos no está disponible en este dispositivo');
    }
    await Sharing.shareAsync(localUri, {
      mimeType: 'audio/mpeg',
      dialogTitle: 'Guardar o compartir canción',
      UTI: 'public.mp3',
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

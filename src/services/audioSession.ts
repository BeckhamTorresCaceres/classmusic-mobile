import {
  AudioPlayer,
  preload,
  requestNotificationPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import type { DownloadedTrack, Track } from '@/shared/types';
import { MusicApi } from './musicApi';

const MIN_LOCAL_BYTES = 50000;
const PRELOAD_BUFFER_SECONDS = 15;

export async function configureBackgroundAudioMode(): Promise<void> {
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'doNotMix',
      shouldPlayInBackground: true,
    });
  } catch {
    // Ignorar si el sistema de audio aún no está listo
  }
}

export async function requestPlaybackNotifications(): Promise<void> {
  await requestNotificationPermissionsAsync().catch(() => {});
}

export async function resolvePlayableUri(
  track: Track | DownloadedTrack,
): Promise<string> {
  const localUri = (track as DownloadedTrack).localUri;
  if (localUri) {
    try {
      const info = await FileSystem.getInfoAsync(localUri);
      if (info.exists && (info as { size: number }).size >= MIN_LOCAL_BYTES) {
        return localUri;
      }
    } catch {
      // Si el archivo local falla, recurrir a streaming
    }
  }
  return MusicApi.getStreamUrl(track.id);
}

export async function preloadNextTrack(
  idx: number,
  queue: (Track | DownloadedTrack)[],
): Promise<void> {
  const nextIdx = idx + 1;
  if (nextIdx >= queue.length) return;

  try {
    const nextUri = await resolvePlayableUri(queue[nextIdx]);
    if (nextUri) {
      await preload(
        { uri: nextUri },
        { preferredForwardBufferDuration: PRELOAD_BUFFER_SECONDS },
      );
    }
  } catch {
    // La precarga es silenciosa y opcional
  }
}

export function activateLockScreenControls(
  player: AudioPlayer,
  track: Track | DownloadedTrack,
): void {
  try {
    player.setActiveForLockScreen(
      true,
      {
        title: track.title || 'ClassMusic',
        artist: track.artist || track.channel || 'ClassMusic',
        artworkUrl: track.thumbnail || undefined,
      },
      {
        showSeekForward: true,
        showSeekBackward: true,
        showNextTrack: true,
        showPreviousTrack: true,
        seekForwardIntervalSeconds: 10,
        seekBackwardIntervalSeconds: 10,
      },
    );
  } catch {
    // Ignorar si la plataforma no soporta controles en pantalla de bloqueo
  }
}

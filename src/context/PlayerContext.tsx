import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  createAudioPlayer,
  setAudioModeAsync,
  requestNotificationPermissionsAsync,
  preload,
  AudioPlayer,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { ApiService } from '../services/api';
import type { DownloadedTrack, Track } from '../types';

interface PlayerContextType {
  currentTrack: Track | DownloadedTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  positionMillis: number;
  durationMillis: number;
  queue: (Track | DownloadedTrack)[];
  currentIndex: number;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  playTrack: (track: Track | DownloadedTrack, newQueue?: (Track | DownloadedTrack)[]) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekTo: (millis: number) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  stop: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType>({} as PlayerContextType);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | DownloadedTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [queue, setQueue] = useState<(Track | DownloadedTrack)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isExpanded, setIsExpanded] = useState(false);

  const playerRef = useRef<AudioPlayer | null>(null);
  const queueRef = useRef<(Track | DownloadedTrack)[]>([]);
  const currentIndexRef = useRef(-1);
  const positionMillisRef = useRef(0);
  const playNextRef = useRef<() => Promise<void>>(async () => {});

  queueRef.current = queue;
  currentIndexRef.current = currentIndex;
  positionMillisRef.current = positionMillis;

  useEffect(() => {
    // Configurar modo de audio para segundo plano
    const initAudio = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          interruptionMode: 'doNotMix',
          shouldPlayInBackground: true,
        });
        // Solicitar permisos de notificación en Android para controles en pantalla de bloqueo
        await requestNotificationPermissionsAsync().catch(() => {});
      } catch {
        // Ignorar si el sistema de audio no está listo aún
      }
    };

    initAudio();

    return () => {
      try {
        playerRef.current?.clearLockScreenControls();
        playerRef.current?.remove();
      } catch {}
    };
  }, []);

  const resolveTrackUri = async (track: Track | DownloadedTrack): Promise<string> => {
    let sourceUri = (track as DownloadedTrack).localUri;
    if (sourceUri) {
      try {
        const info = await FileSystem.getInfoAsync(sourceUri);
        if (!info.exists || (info as { size: number }).size < 50000) {
          sourceUri = await ApiService.getStreamUrl(track.id);
        }
      } catch {
        sourceUri = await ApiService.getStreamUrl(track.id);
      }
    } else {
      sourceUri = await ApiService.getStreamUrl(track.id);
    }
    return sourceUri;
  };

  const preloadNext = async (idx: number, activeQueue: (Track | DownloadedTrack)[]) => {
    const nextIdx = idx + 1;
    if (nextIdx < activeQueue.length) {
      const nextTrack = activeQueue[nextIdx];
      try {
        const nextUri = await resolveTrackUri(nextTrack);
        if (nextUri) {
          await preload({ uri: nextUri }, { preferredForwardBufferDuration: 15 });
        }
      } catch {
        // Fallback silencioso si la precarga falla
      }
    }
  };

  const playTrack = async (
    track: Track | DownloadedTrack,
    newQueue?: (Track | DownloadedTrack)[],
  ) => {
    try {
      setIsLoading(true);
      setCurrentTrack(track);

      // Actualizar cola e índice
      let activeQueue = newQueue || queueRef.current;
      if (newQueue && newQueue.length > 0) {
        setQueue(newQueue);
        activeQueue = newQueue;
      } else if (activeQueue.length === 0) {
        activeQueue = [track];
        setQueue(activeQueue);
      }

      const foundIdx = activeQueue.findIndex((t) => t.id === track.id);
      const newIdx = foundIdx !== -1 ? foundIdx : 0;
      setCurrentIndex(newIdx);
      currentIndexRef.current = newIdx;

      // Si ya hay un reproductor activo, liberar controles y remover
      if (playerRef.current) {
        try {
          playerRef.current.clearLockScreenControls();
          playerRef.current.pause();
          playerRef.current.remove();
        } catch {}
        playerRef.current = null;
      }

      // Asegurar que el modo de audio permita reproducción en segundo plano
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          interruptionMode: 'doNotMix',
          shouldPlayInBackground: true,
        });
      } catch {}

      const sourceUri = await resolveTrackUri(track);

      const player = createAudioPlayer(
        { uri: sourceUri },
        {
          updateInterval: 500,
          keepAudioSessionActive: true,
        },
      );
      playerRef.current = player;

      player.addListener('playbackStatusUpdate', (status) => {
        setIsPlaying(status.playing);
        const currentMs = Math.floor((status.currentTime || 0) * 1000);
        setPositionMillis(currentMs);
        positionMillisRef.current = currentMs;
        setDurationMillis(Math.floor((status.duration || 0) * 1000));
        setIsLoading(status.isBuffering);

        if (status.playbackState === 'ended') {
          setIsPlaying(false);
          setPositionMillis(0);
          // Al finalizar la canción, pasar a la siguiente de la cola automáticamente
          playNextRef.current?.();
        } else if (status.playbackState === 'error') {
          setIsPlaying(false);
          setIsLoading(false);
        }
      });

      // Activar controles en la pantalla de bloqueo y barra de notificaciones
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
      } catch (err) {
        console.warn('Error configurando controles de pantalla de bloqueo:', err);
      }

      player.play();
      setIsPlaying(true);

      // Precargar la siguiente canción en segundo plano para reproducción instantánea
      preloadNext(newIdx, activeQueue);
    } catch (err) {
      setIsPlaying(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const playNext = async () => {
    const currentQ = queueRef.current;
    const currentI = currentIndexRef.current;
    if (currentQ.length === 0) return;

    if (currentI + 1 < currentQ.length) {
      await playTrack(currentQ[currentI + 1], currentQ);
    } else if (currentQ.length > 0) {
      // Si llega al final de la lista, volver al principio
      await playTrack(currentQ[0], currentQ);
    }
  };

  const playPrevious = async () => {
    const currentQ = queueRef.current;
    const currentI = currentIndexRef.current;
    if (currentQ.length === 0) return;

    // Si lleva más de 3 segundos, reiniciar la canción actual
    if (positionMillisRef.current > 3000) {
      await seekTo(0);
      return;
    }

    if (currentI - 1 >= 0) {
      await playTrack(currentQ[currentI - 1], currentQ);
    } else {
      await seekTo(0);
    }
  };

  playNextRef.current = playNext;

  const togglePlayPause = async () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pause();
      setIsPlaying(false);
    } else {
      playerRef.current.play();
      setIsPlaying(true);
    }
  };

  const seekTo = async (millis: number) => {
    if (!playerRef.current) return;
    const seconds = millis / 1000;
    await playerRef.current.seekTo(seconds);
    setPositionMillis(millis);
    positionMillisRef.current = millis;
  };

  const stop = async () => {
    if (!playerRef.current) return;
    try {
      playerRef.current.clearLockScreenControls();
      playerRef.current.pause();
      playerRef.current.remove();
    } catch {}
    playerRef.current = null;
    setIsPlaying(false);
    setCurrentTrack(null);
    setPositionMillis(0);
    setDurationMillis(0);
    setIsExpanded(false);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isLoading,
        positionMillis,
        durationMillis,
        queue,
        currentIndex,
        isExpanded,
        setIsExpanded,
        playTrack,
        togglePlayPause,
        seekTo,
        playNext,
        playPrevious,
        stop,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);

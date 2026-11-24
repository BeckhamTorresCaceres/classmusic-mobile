import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  createAudioPlayer,
  setAudioModeAsync,
  requestNotificationPermissionsAsync,
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
  playTrack: (track: Track | DownloadedTrack) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekTo: (millis: number) => Promise<void>;
  stop: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType>({} as PlayerContextType);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | DownloadedTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);

  const playerRef = useRef<AudioPlayer | null>(null);

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

  const playTrack = async (track: Track | DownloadedTrack) => {
    try {
      setIsLoading(true);
      setCurrentTrack(track);

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

      // Si la pista tiene localUri (ya descargada), usar archivo local solo si es íntegro
      let sourceUri = (track as DownloadedTrack).localUri;
      if (sourceUri) {
        try {
          const info = await FileSystem.getInfoAsync(sourceUri);
          if (!info.exists || (info as { size: number }).size < 50000) {
            // El archivo local está corrupto (ej: texto de error anterior). Usar streaming.
            sourceUri = await ApiService.getStreamUrl(track.id);
          }
        } catch {
          sourceUri = await ApiService.getStreamUrl(track.id);
        }
      } else {
        sourceUri = await ApiService.getStreamUrl(track.id);
      }

      const player = createAudioPlayer(
        { uri: sourceUri },
        {
          updateInterval: 500,
          keepAudioSessionActive: true,
        }
      );
      playerRef.current = player;

      player.addListener('playbackStatusUpdate', (status) => {
        setIsPlaying(status.playing);
        setPositionMillis(Math.floor((status.currentTime || 0) * 1000));
        setDurationMillis(Math.floor((status.duration || 0) * 1000));
        setIsLoading(status.isBuffering);

        if (status.playbackState === 'ended') {
          setIsPlaying(false);
          setPositionMillis(0);
        } else if (status.playbackState === 'error') {
          setIsPlaying(false);
          setIsLoading(false);
        }
      });

      // Activar controles en la pantalla de bloqueo y barra de notificaciones (foreground service en Android)
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
            seekForwardIntervalSeconds: 10,
            seekBackwardIntervalSeconds: 10,
          }
        );
      } catch (err) {
        console.warn('Error configurando controles de pantalla de bloqueo:', err);
      }

      player.play();
      setIsPlaying(true);
    } catch (err) {
      setIsPlaying(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

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
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isLoading,
        positionMillis,
        durationMillis,
        playTrack,
        togglePlayPause,
        seekTo,
        stop,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);

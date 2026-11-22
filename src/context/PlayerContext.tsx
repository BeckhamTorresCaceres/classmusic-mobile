import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
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

  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    // Configurar modo de audio de forma segura
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch {
        // Ignorar si el sistema de audio no está listo al inicio
      }
    };
    setupAudio();

    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  const onPlaybackStatusUpdate = (status: any) => {
    if (!status.isLoaded) {
      if (status.error) {
        setIsPlaying(false);
        setIsLoading(false);
      }
      return;
    }

    setIsPlaying(status.isPlaying);
    setPositionMillis(status.positionMillis || 0);
    setDurationMillis(status.durationMillis || 0);
    setIsLoading(status.isBuffering);

    if (status.didJustFinish) {
      setIsPlaying(false);
      setPositionMillis(0);
    }
  };

  const playTrack = async (track: Track | DownloadedTrack) => {
    try {
      setIsLoading(true);
      setCurrentTrack(track);

      // Si ya hay una canción cargada, descargarla
      if (soundRef.current) {
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }

      // Si la pista tiene localUri (ya fue descargada), la reproduce desde el almacenamiento local
      let sourceUri = (track as DownloadedTrack).localUri;
      if (!sourceUri) {
        sourceUri = await ApiService.getStreamUrl(track.id);
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: sourceUri },
        { shouldPlay: true, progressUpdateIntervalMillis: 500 },
        onPlaybackStatusUpdate,
      );

      soundRef.current = sound;
      setIsPlaying(true);
    } catch (err) {
      setIsPlaying(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  };

  const seekTo = async (millis: number) => {
    if (!soundRef.current) return;
    await soundRef.current.setPositionAsync(millis);
  };

  const stop = async () => {
    if (!soundRef.current) return;
    await soundRef.current.stopAsync();
    await soundRef.current.unloadAsync();
    soundRef.current = null;
    setIsPlaying(false);
    setCurrentTrack(null);
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

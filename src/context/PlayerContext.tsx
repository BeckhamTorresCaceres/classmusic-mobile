import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';
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
    // Configurar modo de audio de fondo de forma segura
    try {
      setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'duckOthers',
      }).catch(() => {});
    } catch {
      // Ignorar si el audio no está listo aún
    }

    return () => {
      try {
        playerRef.current?.remove();
      } catch {}
    };
  }, []);

  const playTrack = async (track: Track | DownloadedTrack) => {
    try {
      setIsLoading(true);
      setCurrentTrack(track);

      // Si ya hay un reproductor activo, liberarlo
      if (playerRef.current) {
        try {
          playerRef.current.pause();
          playerRef.current.remove();
        } catch {}
        playerRef.current = null;
      }

      // Si la pista tiene localUri (ya descargada), usar archivo local
      let sourceUri = (track as DownloadedTrack).localUri;
      if (!sourceUri) {
        sourceUri = await ApiService.getStreamUrl(track.id);
      }

      const player = createAudioPlayer({ uri: sourceUri }, { updateInterval: 500 });
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

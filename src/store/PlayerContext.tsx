import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AudioPlayer, createAudioPlayer } from 'expo-audio';
import {
  activateLockScreenControls,
  configureBackgroundAudioMode,
  preloadNextTrack,
  requestPlaybackNotifications,
  resolvePlayableUri,
} from '@/services';
import type { DownloadedTrack, Track } from '@/shared/types';

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
  playTrack: (
    track: Track | DownloadedTrack,
    newQueue?: (Track | DownloadedTrack)[],
  ) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekTo: (millis: number) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  stop: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType>({} as PlayerContextType);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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
  const indexRef = useRef(-1);
  const positionRef = useRef(0);
  const playNextRef = useRef<() => Promise<void>>(async () => {});

  const releasePlayer = useCallback(() => {
    if (!playerRef.current) return;
    try {
      playerRef.current.clearLockScreenControls();
      playerRef.current.pause();
      playerRef.current.remove();
    } catch {}
    playerRef.current = null;
  }, []);

  useEffect(() => {
    configureBackgroundAudioMode().then(requestPlaybackNotifications);
    return releasePlayer;
  }, [releasePlayer]);

  const playTrack = useCallback(
    async (
      track: Track | DownloadedTrack,
      newQueue?: (Track | DownloadedTrack)[],
    ) => {
      try {
        setIsLoading(true);
        setCurrentTrack(track);

        let activeQueue = newQueue || queueRef.current;
        if (newQueue && newQueue.length > 0) {
          queueRef.current = newQueue;
          setQueue(newQueue);
          activeQueue = newQueue;
        } else if (activeQueue.length === 0) {
          activeQueue = [track];
          queueRef.current = activeQueue;
          setQueue(activeQueue);
        }

        const foundIdx = activeQueue.findIndex((t) => t.id === track.id);
        const nextIdx = foundIdx !== -1 ? foundIdx : 0;
        indexRef.current = nextIdx;
        setCurrentIndex(nextIdx);

        releasePlayer();
        await configureBackgroundAudioMode();

        const sourceUri = await resolvePlayableUri(track);
        const player = createAudioPlayer(
          { uri: sourceUri },
          { updateInterval: 500, keepAudioSessionActive: true },
        );
        playerRef.current = player;

        player.addListener('playbackStatusUpdate', (status) => {
          setIsPlaying(status.playing);
          const currentMs = Math.floor((status.currentTime || 0) * 1000);
          positionRef.current = currentMs;
          setPositionMillis(currentMs);
          setDurationMillis(Math.floor((status.duration || 0) * 1000));
          setIsLoading(status.isBuffering);
          if (status.playbackState === 'ended') {
            setIsPlaying(false);
            positionRef.current = 0;
            setPositionMillis(0);
            playNextRef.current();
          } else if (status.playbackState === 'error') {
            setIsPlaying(false);
            setIsLoading(false);
          }
        });

        activateLockScreenControls(player, track);
        player.play();
        setIsPlaying(true);
        preloadNextTrack(nextIdx, activeQueue);
      } catch (err) {
        setIsPlaying(false);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [releasePlayer],
  );

  const playNext = useCallback(async () => {
    const q = queueRef.current;
    if (q.length === 0) return;
    const nextIdx = indexRef.current + 1 < q.length ? indexRef.current + 1 : 0;
    await playTrack(q[nextIdx], q);
  }, [playTrack]);

  useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);

  const seekTo = useCallback(async (millis: number) => {
    if (!playerRef.current) return;
    await playerRef.current.seekTo(millis / 1000);
    positionRef.current = millis;
    setPositionMillis(millis);
  }, []);

  const playPrevious = useCallback(async () => {
    const q = queueRef.current;
    if (q.length === 0) return;
    if (positionRef.current > 3000 || indexRef.current - 1 < 0) {
      await seekTo(0);
      return;
    }
    await playTrack(q[indexRef.current - 1], q);
  }, [playTrack, seekTo]);

  const togglePlayPause = useCallback(async () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pause();
      setIsPlaying(false);
    } else {
      playerRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const stop = useCallback(async () => {
    releasePlayer();
    setIsPlaying(false);
    setCurrentTrack(null);
    positionRef.current = 0;
    setPositionMillis(0);
    setDurationMillis(0);
    setIsExpanded(false);
  }, [releasePlayer]);

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

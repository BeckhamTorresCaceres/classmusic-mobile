import { useMemo, useState } from 'react';
import { Animated, Dimensions, PanResponder } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface UsePlayerGesturesParams {
  durationMillis: number;
  onNext: () => void;
  onPrevious: () => void;
  onSeekTo: (millis: number) => void;
}

export function usePlayerGestures({
  durationMillis,
  onNext,
  onPrevious,
  onSeekTo,
}: UsePlayerGesturesParams) {
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekingPosition, setSeekingPosition] = useState(0);
  const [barWidth, setProgressBarWidth] = useState(0);
  const [swipeAnimX] = useState(() => new Animated.Value(0));

  const swipePanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gs) =>
          Math.abs(gs.dx) > 15 && Math.abs(gs.dx) > Math.abs(gs.dy),
        onPanResponderMove: (_, gs) => {
          swipeAnimX.setValue(gs.dx);
        },
        onPanResponderRelease: (_, gs) => {
          if (gs.dx < -60) {
            Animated.timing(swipeAnimX, {
              toValue: -SCREEN_WIDTH,
              duration: 150,
              useNativeDriver: true,
            }).start(() => {
              onNext();
              swipeAnimX.setValue(0);
            });
          } else if (gs.dx > 60) {
            Animated.timing(swipeAnimX, {
              toValue: SCREEN_WIDTH,
              duration: 150,
              useNativeDriver: true,
            }).start(() => {
              onPrevious();
              swipeAnimX.setValue(0);
            });
          } else {
            Animated.spring(swipeAnimX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [onNext, onPrevious, swipeAnimX],
  );

  const seekPanResponder = useMemo(() => {
    const computeSeekMillis = (locationX: number): number => {
      if (barWidth <= 0 || durationMillis <= 0) return 0;
      const ratio = Math.max(0, Math.min(1, locationX / barWidth));
      return Math.floor(ratio * durationMillis);
    };

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setIsSeeking(true);
        setSeekingPosition(computeSeekMillis(evt.nativeEvent.locationX));
      },
      onPanResponderMove: (evt) => {
        setSeekingPosition(computeSeekMillis(evt.nativeEvent.locationX));
      },
      onPanResponderRelease: (evt) => {
        if (barWidth > 0 && durationMillis > 0) {
          onSeekTo(computeSeekMillis(evt.nativeEvent.locationX));
        }
        setIsSeeking(false);
      },
    });
  }, [barWidth, durationMillis, onSeekTo]);

  return {
    isSeeking,
    seekingPosition,
    swipeAnimX,
    swipePanResponder,
    seekPanResponder,
    setProgressBarWidth,
  };
}

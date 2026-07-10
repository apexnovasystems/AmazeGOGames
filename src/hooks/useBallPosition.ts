import {useEffect, useRef} from 'react';
import {useSharedValue, withTiming, Easing} from 'react-native-reanimated';
import {GameConfig} from '../constants/gameConfig';

function toPixelCenter(row: number, col: number, cellSize: number, gap: number) {
  return {
    x: col * (cellSize + gap) + cellSize / 2,
    y: row * (cellSize + gap) + cellSize / 2,
  };
}

/**
 * Drives the ball's Skia cx/cy shared values with a smooth glide whenever
 * its grid row/col changes. Duration scales with how far it actually
 * traveled so a long slide across ice doesn't feel rushed.
 */
export function useBallPosition(row: number, col: number, cellSize: number, gap: number) {
  const initial = toPixelCenter(row, col, cellSize, gap);
  const cx = useSharedValue(initial.x);
  const cy = useSharedValue(initial.y);
  const previous = useRef({row, col});

  useEffect(() => {
    const target = toPixelCenter(row, col, cellSize, gap);
    const cellsTraveled = Math.max(
      1,
      Math.hypot(row - previous.current.row, col - previous.current.col),
    );
    const duration = cellsTraveled * GameConfig.BALL_MOVE_MS_PER_TILE;

    cx.value = withTiming(target.x, {duration, easing: Easing.out(Easing.quad)});
    cy.value = withTiming(target.y, {duration, easing: Easing.out(Easing.quad)});

    previous.current = {row, col};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row, col, cellSize, gap]);

  return {cx, cy};
}

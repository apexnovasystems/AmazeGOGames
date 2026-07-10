import {useEffect} from 'react';
import {GameStatus} from '../types';

const TICK_MS = 1000;

/** Advances the game clock by one second while the level is actively being played. */
export function useGameTimer(status: GameStatus, tick: (deltaMs: number) => void) {
  useEffect(() => {
    if (status !== 'playing') {
      return undefined;
    }
    const id = setInterval(() => tick(TICK_MS), TICK_MS);
    return () => clearInterval(id);
  }, [status, tick]);
}

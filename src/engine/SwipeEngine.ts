import {Gesture} from 'react-native-gesture-handler';
import {runOnJS} from 'react-native-reanimated';
import {Direction} from '../types';

const MIN_SWIPE_DISTANCE = 24;

function resolveDirection(translationX: number, translationY: number): Direction {
  'worklet';
  if (Math.abs(translationX) > Math.abs(translationY)) {
    return translationX > 0 ? Direction.Right : Direction.Left;
  }
  return translationY > 0 ? Direction.Down : Direction.Up;
}

/**
 * Builds a gesture-handler Pan gesture that resolves into a single
 * Direction callback once the user releases, ignoring sub-threshold
 * jitter so small taps don't register as swipes.
 */
export function createSwipeGesture(onSwipe: (direction: Direction) => void) {
  return Gesture.Pan()
    .minDistance(MIN_SWIPE_DISTANCE)
    .onEnd(event => {
      'worklet';
      const distance = Math.hypot(event.translationX, event.translationY);
      if (distance < MIN_SWIPE_DISTANCE) {
        return;
      }
      const direction = resolveDirection(event.translationX, event.translationY);
      runOnJS(onSwipe)(direction);
    });
}

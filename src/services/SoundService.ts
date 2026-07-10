import Sound from 'react-native-sound';
import {useSettingsStore} from '../store/useSettingsStore';

Sound.setCategory('Playback');

export type SoundEffect = 'click' | 'swipe' | 'paint' | 'unlock' | 'victory' | 'coin' | 'fail';

const SOUND_FILES: Record<SoundEffect, string> = {
  click: 'sfx_click.wav',
  swipe: 'sfx_swipe.wav',
  paint: 'sfx_paint.wav',
  unlock: 'sfx_unlock.wav',
  victory: 'sfx_victory.wav',
  coin: 'sfx_coin.wav',
  fail: 'sfx_fail.wav',
};

const cache = new Map<SoundEffect, Sound>();

function getSound(effect: SoundEffect): Sound {
  let sound = cache.get(effect);
  if (!sound) {
    sound = new Sound(SOUND_FILES[effect], Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.warn(`SoundService: failed to load "${effect}"`, error);
      }
    });
    cache.set(effect, sound);
  }
  return sound;
}

export const SoundService = {
  /** Warms up the native players so the first play() of a level has no latency. */
  preloadAll(): void {
    (Object.keys(SOUND_FILES) as SoundEffect[]).forEach(getSound);
  },

  play(effect: SoundEffect): void {
    const {soundEnabled, soundVolume} = useSettingsStore.getState();
    if (!soundEnabled) {
      return;
    }
    const sound = getSound(effect);
    sound.setVolume(soundVolume);
    sound.stop(() => {
      sound.play();
    });
  },
};

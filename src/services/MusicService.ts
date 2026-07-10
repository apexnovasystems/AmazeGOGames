import Sound from 'react-native-sound';
import {useSettingsStore} from '../store/useSettingsStore';

const MUSIC_FILE = 'music_loop.wav';

let track: Sound | null = null;
let isPlaying = false;

function getTrack(): Sound {
  if (!track) {
    track = new Sound(MUSIC_FILE, Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.warn('MusicService: failed to load background music', error);
      }
    });
    track.setNumberOfLoops(-1);
  }
  return track;
}

export const MusicService = {
  start(): void {
    const {musicEnabled, musicVolume} = useSettingsStore.getState();
    if (!musicEnabled || isPlaying) {
      return;
    }
    const t = getTrack();
    t.setVolume(musicVolume);
    t.play();
    isPlaying = true;
  },

  stop(): void {
    track?.stop();
    isPlaying = false;
  },

  setEnabled(enabled: boolean): void {
    if (enabled) {
      this.start();
    } else {
      this.stop();
    }
  },

  setVolume(volume: number): void {
    track?.setVolume(volume);
  },
};

const SPLASH_SOUND_STORAGE_KEY = 'pl-splash-sound-enabled';

let hasPlayedLaunchEffects = false;

const isSplashSoundEnabled = (): boolean => {
  try {
    const value = window.localStorage.getItem(SPLASH_SOUND_STORAGE_KEY);
    if (value === null) {
      return true;
    }
    return value !== '0' && value !== 'false' && value !== 'off';
  } catch {
    return true;
  }
};

export const shouldReduceSplashMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const consumeSplashLaunchEffects = (): boolean => {
  if (hasPlayedLaunchEffects) {
    return false;
  }
  hasPlayedLaunchEffects = true;
  return true;
};

export const triggerSplashHaptic = (pattern: number | number[] = 10): void => {
  if (!('vibrate' in navigator)) {
    return;
  }
  navigator.vibrate(pattern);
};

export const playSplashSting = async (): Promise<void> => {
  if (!isSplashSoundEnabled()) {
    return;
  }

  const AudioContextCtor =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) {
    return;
  }

  try {
    const context = new AudioContextCtor();
    const master = context.createGain();
    master.connect(context.destination);

    const primary = context.createOscillator();
    const secondary = context.createOscillator();
    primary.type = 'triangle';
    secondary.type = 'sine';

    primary.connect(master);
    secondary.connect(master);

    const now = context.currentTime;
    primary.frequency.setValueAtTime(440, now);
    primary.frequency.exponentialRampToValueAtTime(690, now + 0.25);
    secondary.frequency.setValueAtTime(660, now);
    secondary.frequency.exponentialRampToValueAtTime(980, now + 0.22);

    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.055, now + 0.03);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.27);

    primary.start(now);
    secondary.start(now);
    primary.stop(now + 0.28);
    secondary.stop(now + 0.28);

    window.setTimeout(() => {
      void context.close();
    }, 420);
  } catch {
    // Ignore autoplay/policy errors and keep splash silent.
  }
};

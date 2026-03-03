const HELP_TAB_SESSION_STORAGE_KEY = 'profit-lens.help-tab-session';

export interface HelpTabSessionState {
  uid: string;
  description: string;
}

let helpTabSessionState: HelpTabSessionState | null = null;

const cloneHelpTabSessionState = (state: HelpTabSessionState): HelpTabSessionState => {
  return {
    uid: state.uid,
    description: state.description,
  };
};

const readHelpTabSessionStateFromStorage = (): HelpTabSessionState | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(HELP_TAB_SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as HelpTabSessionState;
  } catch {
    return null;
  }
};

const writeHelpTabSessionStateToStorage = (state: HelpTabSessionState): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.sessionStorage.setItem(HELP_TAB_SESSION_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors and keep in-memory fallback.
  }
};

export const readHelpTabSessionState = (uid: string): HelpTabSessionState | null => {
  if (helpTabSessionState?.uid === uid) {
    return cloneHelpTabSessionState(helpTabSessionState);
  }

  const storageState = readHelpTabSessionStateFromStorage();
  if (!storageState || storageState.uid !== uid) {
    return null;
  }

  helpTabSessionState = cloneHelpTabSessionState(storageState);
  return cloneHelpTabSessionState(storageState);
};

export const writeHelpTabSessionState = (nextState: HelpTabSessionState): void => {
  const cloned = cloneHelpTabSessionState(nextState);
  helpTabSessionState = cloned;
  writeHelpTabSessionStateToStorage(cloned);
};

import {
  createContextId,
  useContext,
  useContextProvider,
  useSignal,
  useVisibleTask$,
  type Signal,
} from '@builder.io/qwik';
import {
  authStateListener,
  consumeEmbeddedAndroidCustomToken,
  hasEmbeddedAndroidCustomToken,
  notifyEmbeddedAndroidAuthState,
  readCurrentAuthUser,
} from '../firebase/auth';
import type { AuthUser } from '../types/auth';

export interface AuthStore {
  user: Signal<AuthUser | null>;
  ready: Signal<boolean>;
}

const AuthContext = createContextId<AuthStore>('profit-lens.auth');

export const setupAuthProvider = () => {
  const user = useSignal<AuthUser | null>(null);
  const ready = useSignal<boolean>(false);

  const store: AuthStore = {
    user,
    ready,
  };

  useContextProvider(AuthContext, store);

  useVisibleTask$(({ cleanup }) => {
    let initialStateResolved = false;
    const hasPendingAndroidToken = hasEmbeddedAndroidCustomToken();
    let androidBootstrapPending = hasPendingAndroidToken;
    const syncUserFromAuthClient = () => {
      store.user.value = readCurrentAuthUser();
    };

    const readyTimeout = window.setTimeout(() => {
      if (initialStateResolved) {
        return;
      }
      initialStateResolved = true;
      syncUserFromAuthClient();
      store.ready.value = true;
      console.warn('[auth] auth state listener timed out; using current auth snapshot');
    }, 6000);

    const resolveInitialReady = () => {
      if (initialStateResolved) {
        return;
      }
      initialStateResolved = true;
      window.clearTimeout(readyTimeout);
      store.ready.value = true;
    };

    const applyAuthState = (currentUser: AuthUser | null) => {
      if (androidBootstrapPending && !currentUser) {
        return;
      }
      store.user.value = currentUser;
      notifyEmbeddedAndroidAuthState(currentUser);
      resolveInitialReady();
    };

    const unsubscribe = authStateListener(
      (currentUser) => {
        applyAuthState(currentUser);
      },
      (error) => {
        console.error('[auth] auth state listener failed', error);
        syncUserFromAuthClient();
        resolveInitialReady();
      },
    );

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncUserFromAuthClient();
      }
    };
    const onFocus = () => {
      syncUserFromAuthClient();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);

    void (async () => {
      if (!hasPendingAndroidToken) {
        return;
      }
      try {
        await consumeEmbeddedAndroidCustomToken();
      } catch (error) {
        console.error('[auth] embedded android sign-in failed', error);
      } finally {
        androidBootstrapPending = false;
        syncUserFromAuthClient();
        resolveInitialReady();
      }
    })();

    cleanup(() => {
      window.clearTimeout(readyTimeout);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
      unsubscribe();
    });
  });

  return store;
};

export const useAuth = (): AuthStore => {
  return useContext(AuthContext);
};

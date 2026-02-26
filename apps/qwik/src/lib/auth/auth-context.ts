import {
  createContextId,
  useContext,
  useContextProvider,
  useSignal,
  useVisibleTask$,
  type Signal,
} from '@builder.io/qwik';
import { authStateListener } from '../firebase/auth';
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
    const readyTimeout = window.setTimeout(() => {
      if (initialStateResolved) {
        return;
      }
      initialStateResolved = true;
      store.ready.value = true;
      console.warn('[auth] auth state listener timed out; continuing as signed-out');
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
      store.user.value = currentUser;
      resolveInitialReady();
    };

    const unsubscribe = authStateListener(
      (currentUser) => {
        applyAuthState(currentUser);
      },
      (error) => {
        console.error('[auth] auth state listener failed', error);
        resolveInitialReady();
      },
    );
    cleanup(() => {
      window.clearTimeout(readyTimeout);
      unsubscribe();
    });
  });

  return store;
};

export const useAuth = (): AuthStore => {
  return useContext(AuthContext);
};

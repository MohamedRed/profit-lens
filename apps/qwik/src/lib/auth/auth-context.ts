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
    let isResolved = false;
    const readyTimeout = window.setTimeout(() => {
      if (isResolved) {
        return;
      }
      isResolved = true;
      store.user.value = null;
      store.ready.value = true;
      console.warn('[auth] auth state listener timed out; continuing as signed-out');
    }, 6000);

    const resolveReady = (currentUser: AuthUser | null) => {
      if (isResolved) {
        return;
      }
      isResolved = true;
      window.clearTimeout(readyTimeout);
      store.user.value = currentUser;
      store.ready.value = true;
    };

    const unsubscribe = authStateListener(
      (currentUser) => {
        resolveReady(currentUser);
      },
      (error) => {
        console.error('[auth] auth state listener failed', error);
        resolveReady(null);
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

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
    const unsubscribe = authStateListener((currentUser) => {
      store.user.value = currentUser;
      store.ready.value = true;
    });
    cleanup(() => {
      unsubscribe();
    });
  });

  return store;
};

export const useAuth = (): AuthStore => {
  return useContext(AuthContext);
};

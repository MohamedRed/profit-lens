import {
  createContextId,
  useContext,
  useContextProvider,
  useSignal,
  useVisibleTask$,
  type Signal,
} from '@builder.io/qwik';
import type { User } from 'firebase/auth';
import { authStateListener, readAdminClaim, readCurrentFirebaseUser } from '../firebase/auth';

export interface AdminAuthStore {
  user: Signal<User | null>;
  hasUser: Signal<boolean>;
  ready: Signal<boolean>;
  claimReady: Signal<boolean>;
  isAdmin: Signal<boolean>;
}

const AdminAuthContext = createContextId<AdminAuthStore>('profit-lens.admin-auth');

export const setupAdminAuthProvider = () => {
  const user = useSignal<User | null>(null);
  const hasUser = useSignal<boolean>(false);
  const ready = useSignal<boolean>(false);
  const claimReady = useSignal<boolean>(false);
  const isAdmin = useSignal<boolean>(false);

  const store: AdminAuthStore = {
    user,
    hasUser,
    ready,
    claimReady,
    isAdmin,
  };

  useContextProvider(AdminAuthContext, store);

  useVisibleTask$(({ cleanup }) => {
    let disposed = false;
    let claimVersion = 0;

    const loadClaim = async (nextUser: User | null) => {
      const version = ++claimVersion;
      if (!nextUser) {
        store.hasUser.value = false;
        store.isAdmin.value = false;
        store.claimReady.value = true;
        return;
      }

      store.hasUser.value = true;
      store.claimReady.value = false;
      try {
        const hasAdminClaim = await readAdminClaim(nextUser);
        if (disposed || version !== claimVersion) {
          return;
        }
        store.isAdmin.value = hasAdminClaim;
      } catch {
        if (disposed || version !== claimVersion) {
          return;
        }
        store.isAdmin.value = false;
      } finally {
        if (!disposed && version === claimVersion) {
          store.claimReady.value = true;
        }
      }
    };

    const timeoutId = window.setTimeout(() => {
      if (store.ready.value) {
        return;
      }
      store.user.value = readCurrentFirebaseUser();
      store.hasUser.value = Boolean(store.user.value);
      store.ready.value = true;
      void loadClaim(store.user.value);
    }, 6000);

    const unsubscribe = authStateListener(
      (nextUser) => {
        store.user.value = nextUser;
        store.hasUser.value = Boolean(nextUser);
        store.ready.value = true;
        void loadClaim(nextUser);
      },
      () => {
        store.user.value = readCurrentFirebaseUser();
        store.hasUser.value = Boolean(store.user.value);
        store.ready.value = true;
        void loadClaim(store.user.value);
      },
    );

    cleanup(() => {
      disposed = true;
      window.clearTimeout(timeoutId);
      unsubscribe();
    });
  });

  return store;
};

export const useAdminAuth = (): AdminAuthStore => {
  return useContext(AdminAuthContext);
};

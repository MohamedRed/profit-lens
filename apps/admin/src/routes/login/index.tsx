import { component$, useSignal } from '@builder.io/qwik';
import { AdminGuard } from '../../components/guards/admin-guard';
import { signInWithEmail } from '../../lib/firebase/auth';

export default component$(() => {
  const email = useSignal('');
  const password = useSignal('');
  const loading = useSignal(false);
  const status = useSignal('');

  return (
    <AdminGuard requireAdmin={false}>
      <div class="admin-auth-page">
        <div class="admin-auth-card">
          <p class="admin-muted" style={{ margin: 0 }}>Admin Console</p>
          <h1>Sign in</h1>
          <p class="admin-muted" style={{ margin: 0 }}>
            Authorized Profit Lens operators only.
          </p>

          <label class="admin-field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email.value}
              onInput$={(_, target) => {
                email.value = target.value;
              }}
            />
          </label>

          <label class="admin-field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password.value}
              onInput$={(_, target) => {
                password.value = target.value;
              }}
            />
          </label>

          <button
            class="admin-button"
            disabled={loading.value}
            onClick$={async () => {
              status.value = '';
              loading.value = true;
              try {
                await signInWithEmail(email.value.trim(), password.value);
              } catch (error) {
                const message = error instanceof Error ? error.message : 'Sign in failed.';
                status.value = message;
              } finally {
                loading.value = false;
              }
            }}
          >
            {loading.value ? 'Signing in…' : 'Sign in'}
          </button>

          <div class={{ 'admin-status': true, error: Boolean(status.value) }}>{status.value}</div>
        </div>
      </div>
    </AdminGuard>
  );
});

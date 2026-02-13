import { component$, useSignal } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import { AuthGuard } from '../../components/guards/auth-guard';
import { registerWithEmail } from '../../lib/firebase/auth';
import { t, useI18n } from '../../lib/i18n/i18n-context';

export default component$(() => {
  const i18n = useI18n();
  const navigate = useNavigate();
  const email = useSignal('');
  const password = useSignal('');
  const confirm = useSignal('');
  const loading = useSignal(false);
  const status = useSignal('');

  return (
    <AuthGuard requireAuth={false}>
      <div class="pl-page">
        <section class="pl-card pl-stack">
          <span class="pl-badge">ProfitLens</span>
          <h1 class="pl-title">{t(i18n, 'registerTitle', 'Create account')}</h1>

          <div class="pl-field">
            <label for="email">{t(i18n, 'emailLabel', 'Email')}</label>
            <input
              id="email"
              class="pl-input"
              type="email"
              value={email.value}
              onInput$={(_, target) => (email.value = target.value)}
              autoComplete="email"
            />
          </div>

          <div class="pl-field">
            <label for="password">{t(i18n, 'passwordLabel', 'Password')}</label>
            <input
              id="password"
              class="pl-input"
              type="password"
              value={password.value}
              onInput$={(_, target) => (password.value = target.value)}
              autoComplete="new-password"
            />
          </div>

          <div class="pl-field">
            <label for="confirm">{t(i18n, 'confirmPasswordLabel', 'Confirm password')}</label>
            <input
              id="confirm"
              class="pl-input"
              type="password"
              value={confirm.value}
              onInput$={(_, target) => (confirm.value = target.value)}
              autoComplete="new-password"
            />
          </div>

          <button
            class="pl-button pl-button-primary"
            disabled={loading.value}
            onClick$={async () => {
              status.value = '';
              if (password.value.length < 8) {
                status.value = t(i18n, 'passwordLengthError', 'Password must be at least 8 characters.');
                return;
              }
              if (password.value !== confirm.value) {
                status.value = t(i18n, 'passwordMismatchError', 'Passwords do not match.');
                return;
              }

              loading.value = true;
              try {
                await registerWithEmail(email.value.trim(), password.value);
                navigate('/next/app/offer');
              } catch (error) {
                status.value = error instanceof Error ? error.message : String(error);
              } finally {
                loading.value = false;
              }
            }}
          >
            {loading.value ? t(i18n, 'loadingLabel', 'Loading...') : t(i18n, 'registerButton', 'Register')}
          </button>

          <button class="pl-button pl-button-ghost" onClick$={() => navigate('/next/login')}>
            {t(i18n, 'signInButton', 'Sign in')}
          </button>

          <div class={{ 'pl-status': true, 'pl-status-error': Boolean(status.value) }}>{status.value}</div>
        </section>
      </div>
    </AuthGuard>
  );
});

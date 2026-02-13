import { component$, useSignal } from '@builder.io/qwik';
import { useLocation, useNavigate } from '@builder.io/qwik-city';
import { AuthGuard } from '../../components/guards/auth-guard';
import { signInWithEmail } from '../../lib/firebase/auth';
import { t, useI18n } from '../../lib/i18n/i18n-context';

export default component$(() => {
  const i18n = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const email = useSignal('');
  const password = useSignal('');
  const loading = useSignal(false);
  const status = useSignal('');

  return (
    <AuthGuard requireAuth={false}>
      <div class="pl-page">
        <section class="pl-card pl-stack">
          <span class="pl-badge">ProfitLens</span>
          <h1 class="pl-title">{t(i18n, 'signInTitle', 'Sign in')}</h1>
          <p class="pl-subtitle">{t(i18n, 'signInSubtitle', 'Analyze offers faster.')}</p>

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
              autoComplete="current-password"
            />
          </div>

          <button
            class="pl-button pl-button-primary"
            disabled={loading.value}
            onClick$={async () => {
              status.value = '';
              loading.value = true;
              try {
                await signInWithEmail(email.value.trim(), password.value);
                const redirect = location.url.searchParams.get('redirect');
                navigate(redirect ?? '/next/app/offer');
              } catch (error) {
                status.value = error instanceof Error ? error.message : String(error);
              } finally {
                loading.value = false;
              }
            }}
          >
            {loading.value ? t(i18n, 'loadingLabel', 'Loading...') : t(i18n, 'signInButton', 'Sign in')}
          </button>

          <div class="pl-row">
            <button class="pl-button pl-button-ghost" onClick$={() => navigate('/next/register')}>
              {t(i18n, 'createAccountButton', 'Create an account')}
            </button>
            <a class="pl-button pl-button-ghost" href="/app?entry=login">
              Open Flutter login
            </a>
          </div>

          <div class={{ 'pl-status': true, 'pl-status-error': Boolean(status.value) }}>{status.value}</div>
        </section>
      </div>
    </AuthGuard>
  );
});

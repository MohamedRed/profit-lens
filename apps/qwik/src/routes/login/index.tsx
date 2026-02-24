import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import { AuthGuard } from '../../components/guards/auth-guard';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { signInWithEmail } from '../../lib/firebase/auth';
import { resolveUserFacingErrorMessage } from '../../lib/errors/user-facing-error';
import { t, useI18n } from '../../lib/i18n/i18n-context';
import { restoreAuthFormInteraction } from '../../lib/ui/restore-auth-form-interaction';

export default component$(() => {
  const i18n = useI18n();
  const navigate = useNavigate();
  const email = useSignal('');
  const password = useSignal('');
  const loading = useSignal(false);
  const status = useSignal('');

  useVisibleTask$(({ cleanup }) => {
    const teardown = restoreAuthFormInteraction();
    cleanup(() => {
      teardown();
    });
  });

  return (
    <AuthGuard requireAuth={false}>
      <div class="ui-page">
        <Card class="ui-stack ui-login-card">
          <CardHeader class="ui-login-header">
            <div class="ui-login-brand">
              <span class="ui-login-brand-mark" aria-hidden="true" />
              <Badge class="ui-login-brand-badge">{t(i18n, 'appTitle', 'Liive Profit')}</Badge>
            </div>
            <CardTitle class="ui-login-title">{t(i18n, 'signInTitle', 'Sign in')}</CardTitle>
            <CardDescription class="ui-login-description">
              {t(i18n, 'signInSubtitle', 'Analyze offers faster.')}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div class="ui-field">
              <Label for="email">{t(i18n, 'emailLabel', 'Email')}</Label>
              <Input
                id="email"
                type="email"
                value={email.value}
                onInput$={(_, target) => (email.value = target.value)}
                autoComplete="email"
              />
            </div>

            <div class="ui-field">
              <Label for="password">{t(i18n, 'passwordLabel', 'Password')}</Label>
              <Input
                id="password"
                type="password"
                value={password.value}
                onInput$={(_, target) => (password.value = target.value)}
                autoComplete="current-password"
              />
            </div>

            <Button
              variant="default"
              disabled={loading.value}
              onClick$={async () => {
                status.value = '';
                loading.value = true;
                try {
                  await signInWithEmail(email.value.trim(), password.value);
                } catch (error) {
                  status.value = resolveUserFacingErrorMessage(i18n, error, 'auth-signin');
                } finally {
                  loading.value = false;
                }
              }}
            >
              {loading.value ? t(i18n, 'loadingLabel', 'Loading...') : t(i18n, 'signInButton', 'Sign in')}
            </Button>

            <div class="ui-login-actions">
              <Button
                variant="secondary"
                class="ui-login-create-account"
                onClick$={() => navigate('/next/register')}
              >
                {t(i18n, 'createAccountButton', 'Create an account')}
                <span class="material-icons-outlined" aria-hidden="true">
                  arrow_forward
                </span>
              </Button>
            </div>

            <div class={{ 'ui-status': true, 'ui-status-error': Boolean(status.value) }}>{status.value}</div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
});

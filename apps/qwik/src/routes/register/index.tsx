import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import { AuthGuard } from '../../components/guards/auth-guard';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { registerWithEmail } from '../../lib/firebase/auth';
import { resolveUserFacingErrorMessage } from '../../lib/errors/user-facing-error';
import { t, useI18n } from '../../lib/i18n/i18n-context';
import { restoreAuthFormInteraction } from '../../lib/ui/restore-auth-form-interaction';

export default component$(() => {
  const i18n = useI18n();
  const navigate = useNavigate();
  const email = useSignal('');
  const password = useSignal('');
  const confirm = useSignal('');
  const loading = useSignal(false);
  const status = useSignal('');

  useVisibleTask$(() => {
    restoreAuthFormInteraction();
  });

  return (
    <AuthGuard requireAuth={false}>
      <div class="ui-page">
        <Card class="ui-stack">
          <CardHeader>
            <Badge>Liive Profit</Badge>
            <CardTitle>{t(i18n, 'registerTitle', 'Create account')}</CardTitle>
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
                autoComplete="new-password"
              />
            </div>

            <div class="ui-field">
              <Label for="confirm">{t(i18n, 'confirmPasswordLabel', 'Confirm password')}</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm.value}
                onInput$={(_, target) => (confirm.value = target.value)}
                autoComplete="new-password"
              />
            </div>

            <Button
              variant="default"
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
                  status.value = resolveUserFacingErrorMessage(i18n, error, 'auth-register');
                } finally {
                  loading.value = false;
                }
              }}
            >
              {loading.value ? t(i18n, 'loadingLabel', 'Loading...') : t(i18n, 'registerButton', 'Register')}
            </Button>

            <Button variant="secondary" onClick$={() => navigate('/next/login')}>
              {t(i18n, 'signInButton', 'Sign in')}
            </Button>

            <div class={{ 'ui-status': true, 'ui-status-error': Boolean(status.value) }}>{status.value}</div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
});

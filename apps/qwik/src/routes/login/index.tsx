import { component$, useSignal } from '@builder.io/qwik';
import { useLocation, useNavigate } from '@builder.io/qwik-city';
import { AuthGuard } from '../../components/guards/auth-guard';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
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
      <div class="ui-page">
        <Card class="ui-stack">
          <CardHeader>
            <Badge>ProfitLens</Badge>
            <CardTitle>{t(i18n, 'signInTitle', 'Sign in')}</CardTitle>
            <CardDescription>{t(i18n, 'signInSubtitle', 'Analyze offers faster.')}</CardDescription>
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
            </Button>

            <div class="ui-row">
              <Button variant="secondary" onClick$={() => navigate('/next/register')}>
                {t(i18n, 'createAccountButton', 'Create an account')}
              </Button>
              <a class="ui-button ui-button-secondary ui-button-md" href="/app?entry=login">
                Open Flutter login
              </a>
            </div>

            <div class={{ 'ui-status': true, 'ui-status-error': Boolean(status.value) }}>{status.value}</div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
});

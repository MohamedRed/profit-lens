(function (root) {
  'use strict';

  var resolveLocale = root.PROFIT_LENS_RESOLVE_BOOTSTRAP_LOCALE || function () {
    return 'en';
  };
  var translate = root.PROFIT_LENS_TRANSLATE_BOOTSTRAP || function (_, key) {
    return key;
  };

  var core = {
    AUTH_TIMEOUT_MS: 6000,
    STATES: {
      checkingSession: 'checking_session',
      signedOutReady: 'signed_out_ready',
      signingIn: 'signing_in',
      sessionError: 'session_error',
      redirecting: 'redirecting',
    },
    locale: resolveLocale((root.navigator && root.navigator.language) || 'en'),
    runtime: {
      installEvent: null,
      sessionResolved: false,
      timeoutId: null,
      currentState: null,
    },
    refs: {
      statusText: document.getElementById('status-text'),
      errorText: document.getElementById('error-text'),
      installHelp: document.getElementById('install-help'),
      signInForm: document.getElementById('sign-in-form'),
      emailInput: document.getElementById('email-input'),
      passwordInput: document.getElementById('password-input'),
      signInBtn: document.getElementById('sign-in-btn'),
      installBtn: document.getElementById('install-btn'),
      retryBtn: document.getElementById('retry-btn'),
      createAccountBtn: document.getElementById('create-account-btn'),
      openFullLoginBtn: document.getElementById('open-full-login-btn'),
      badgeText: document.getElementById('badge-text'),
      titleText: document.getElementById('title-text'),
      emailLabel: document.getElementById('email-label'),
      passwordLabel: document.getElementById('password-label'),
    },
  };

  core.t = function (key) {
    return translate(core.locale, key);
  };

  core.show = function (el) {
    if (el) {
      el.hidden = false;
    }
  };

  core.hide = function (el) {
    if (el) {
      el.hidden = true;
    }
  };

  core.setStatus = function (key, fallbackText) {
    if (core.refs.statusText) {
      core.refs.statusText.textContent = key ? core.t(key) : (fallbackText || '');
    }
  };

  core.setErrorText = function (key, fallbackText) {
    if (!core.refs.errorText) {
      return;
    }

    var value = key ? core.t(key) : fallbackText;
    if (!value) {
      core.refs.errorText.textContent = '';
      core.hide(core.refs.errorText);
      return;
    }

    core.refs.errorText.textContent = value;
    core.show(core.refs.errorText);
  };

  core.isIos = function () {
    var ua = (root.navigator && root.navigator.userAgent) || '';
    return /iPad|iPhone|iPod/.test(ua);
  };

  core.isStandalone = function () {
    return (
      (root.matchMedia && root.matchMedia('(display-mode: standalone)').matches) ||
      (root.navigator && root.navigator.standalone) === true
    );
  };

  core.copyParamsWithOverrides = function (overrides) {
    var params = new URLSearchParams(root.location.search);
    Object.keys(overrides).forEach(function (key) {
      var value = overrides[key];
      if (value === null || value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    return params;
  };

  core.buildAppUrl = function (overrides) {
    var url = new URL('/app', root.location.origin);
    var params = core.copyParamsWithOverrides(overrides || {});
    var query = params.toString();
    if (query) {
      url.search = query;
    }
    if (root.location.hash) {
      url.hash = root.location.hash;
    }
    return url.toString();
  };

  core.openFullLogin = function () {
    root.location.assign(core.buildAppUrl({ entry: 'login' }));
  };

  core.navigateToApp = function () {
    root.location.replace(core.buildAppUrl({}));
  };

  core.showInstallHelpMessage = function () {
    if (!core.refs.installHelp) {
      return;
    }

    if (core.isStandalone()) {
      core.hide(core.refs.installHelp);
      return;
    }

    core.refs.installHelp.textContent = core.isIos()
      ? core.t('installHelpIos')
      : core.t('installHelpDefault');
    core.show(core.refs.installHelp);
  };

  core.setFormEnabled = function (enabled) {
    if (core.refs.emailInput) {
      core.refs.emailInput.disabled = !enabled;
    }
    if (core.refs.passwordInput) {
      core.refs.passwordInput.disabled = !enabled;
    }
    if (core.refs.signInBtn) {
      core.refs.signInBtn.disabled = !enabled;
      core.refs.signInBtn.textContent = enabled ? core.t('signIn') : core.t('signingIn');
    }
  };

  core.setState = function (nextState, options) {
    var payload = options || {};
    core.runtime.currentState = nextState;

    core.hide(core.refs.retryBtn);
    core.hide(core.refs.openFullLoginBtn);

    if (nextState === core.STATES.checkingSession) {
      core.setStatus('statusCheckingSession');
      core.setErrorText();
      core.hide(core.refs.signInForm);
      core.hide(core.refs.installBtn);
      core.hide(core.refs.createAccountBtn);
      core.hide(core.refs.installHelp);
      return;
    }

    if (nextState === core.STATES.redirecting) {
      core.setStatus('statusRedirecting');
      core.setErrorText();
      core.hide(core.refs.signInForm);
      core.hide(core.refs.installBtn);
      core.hide(core.refs.createAccountBtn);
      core.hide(core.refs.installHelp);
      return;
    }

    if (nextState === core.STATES.signingIn) {
      core.setStatus('statusSigningIn');
      core.setErrorText();
      core.show(core.refs.signInForm);
      core.show(core.refs.installBtn);
      core.show(core.refs.createAccountBtn);
      core.setFormEnabled(false);
      core.showInstallHelpMessage();
      return;
    }

    if (nextState === core.STATES.sessionError) {
      core.setStatus('statusSessionError');
      core.setErrorText(payload.errorKey, payload.fallbackError);
      core.show(core.refs.installBtn);
      core.show(core.refs.createAccountBtn);
      core.show(core.refs.retryBtn);
      core.show(core.refs.openFullLoginBtn);
      if (payload.disableForm) {
        core.hide(core.refs.signInForm);
      } else {
        core.show(core.refs.signInForm);
        core.setFormEnabled(true);
      }
      core.showInstallHelpMessage();
      return;
    }

    core.setStatus('statusSignedOut');
    core.setErrorText(payload.errorKey, payload.fallbackError);
    core.show(core.refs.signInForm);
    core.show(core.refs.installBtn);
    core.show(core.refs.createAccountBtn);
    core.setFormEnabled(true);
    if (payload.showFullLoginFallback) {
      core.show(core.refs.openFullLoginBtn);
    }
    core.showInstallHelpMessage();
  };

  core.mapAuthError = function (error) {
    var code = (error && error.code) ? String(error.code) : '';

    if (code.indexOf('invalid-email') !== -1) {
      return { key: 'errorInvalidEmail', showFullLoginFallback: false };
    }
    if (code.indexOf('user-not-found') !== -1) {
      return { key: 'errorUserNotFound', showFullLoginFallback: false };
    }
    if (code.indexOf('wrong-password') !== -1 || code.indexOf('invalid-credential') !== -1) {
      return { key: 'errorWrongPassword', showFullLoginFallback: false };
    }
    if (code.indexOf('too-many-requests') !== -1) {
      return { key: 'errorTooManyRequests', showFullLoginFallback: true };
    }
    if (code.indexOf('network-request-failed') !== -1) {
      return { key: 'errorNetwork', showFullLoginFallback: true };
    }

    return { key: 'errorUnknownAuth', showFullLoginFallback: true };
  };

  core.validateSignInForm = function () {
    var email = core.refs.emailInput ? core.refs.emailInput.value.trim() : '';
    var password = core.refs.passwordInput ? core.refs.passwordInput.value : '';
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return { ok: false, key: 'errorInvalidEmail' };
    }

    if (!password) {
      return { ok: false, key: 'errorMissingPassword' };
    }

    return { ok: true, email: email, password: password };
  };

  core.initializeLocalization = function () {
    document.documentElement.setAttribute('lang', core.locale);
    document.documentElement.setAttribute('dir', core.locale === 'ar' ? 'rtl' : 'ltr');

    if (core.refs.badgeText) core.refs.badgeText.textContent = core.t('badge');
    if (core.refs.titleText) core.refs.titleText.textContent = core.t('title');
    if (core.refs.emailLabel) core.refs.emailLabel.textContent = core.t('emailLabel');
    if (core.refs.passwordLabel) core.refs.passwordLabel.textContent = core.t('passwordLabel');
    if (core.refs.emailInput) core.refs.emailInput.placeholder = core.t('emailPlaceholder');
    if (core.refs.passwordInput) core.refs.passwordInput.placeholder = core.t('passwordPlaceholder');
    if (core.refs.installBtn) core.refs.installBtn.textContent = core.t('installApp');
    if (core.refs.retryBtn) core.refs.retryBtn.textContent = core.t('retry');
    if (core.refs.createAccountBtn) core.refs.createAccountBtn.textContent = core.t('createAccount');
    if (core.refs.openFullLoginBtn) core.refs.openFullLoginBtn.textContent = core.t('openFullLogin');

    core.setFormEnabled(true);
  };

  root.PROFIT_LENS_BOOTSTRAP_CORE = core;
})(window);

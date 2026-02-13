(function () {
  'use strict';

  var AUTH_TIMEOUT_MS = 6000;
  var installEvent = null;
  var sessionResolved = false;
  var timeoutId = null;

  var statusText = document.getElementById('status-text');
  var errorText = document.getElementById('error-text');
  var installHelp = document.getElementById('install-help');
  var signInBtn = document.getElementById('sign-in-btn');
  var installBtn = document.getElementById('install-btn');
  var retryBtn = document.getElementById('retry-btn');

  function show(el) {
    if (el) {
      el.hidden = false;
    }
  }

  function hide(el) {
    if (el) {
      el.hidden = true;
    }
  }

  function setStatus(text) {
    if (statusText) {
      statusText.textContent = text;
    }
  }

  function setError(text) {
    if (!errorText) {
      return;
    }
    if (!text) {
      hide(errorText);
      errorText.textContent = '';
      return;
    }
    errorText.textContent = text;
    show(errorText);
  }

  function isIos() {
    var ua = navigator.userAgent || '';
    return /iPad|iPhone|iPod/.test(ua);
  }

  function isStandalone() {
    return (
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator.standalone === true
    );
  }

  function copyParamsWithOverrides(overrides) {
    var params = new URLSearchParams(window.location.search);
    Object.keys(overrides).forEach(function (key) {
      var value = overrides[key];
      if (value === null || value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    return params;
  }

  function buildAppUrl(overrides) {
    var url = new URL('/app', window.location.origin);
    var params = copyParamsWithOverrides(overrides || {});
    var query = params.toString();
    if (query) {
      url.search = query;
    }
    if (window.location.hash) {
      url.hash = window.location.hash;
    }
    return url.toString();
  }

  function navigateToApp(overrides) {
    window.location.replace(buildAppUrl(overrides));
  }

  function showInstallHelpMessage() {
    if (!installHelp) {
      return;
    }

    if (isStandalone()) {
      hide(installHelp);
      return;
    }

    if (isIos()) {
      installHelp.textContent = 'On iOS: tap Share, then Add to Home Screen.';
    } else {
      installHelp.textContent = 'Install prompt unavailable. You can still sign in now.';
    }
    show(installHelp);
  }

  function showSignedOutUi(reasonMessage) {
    setStatus(reasonMessage || 'You are not signed in yet.');
    setError('');
    show(signInBtn);
    show(installBtn);
    showInstallHelpMessage();
  }

  function handleSessionResolved(user) {
    if (sessionResolved) {
      return;
    }
    sessionResolved = true;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (user) {
      setStatus('Session found. Opening your app...');
      navigateToApp({});
      return;
    }

    showSignedOutUi('Session not found. Sign in to continue.');
  }

  function handleSessionCheckFailure(message) {
    if (sessionResolved) {
      return;
    }
    sessionResolved = true;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    setStatus('Session check failed.');
    setError(message || 'Unable to validate session right now.');
    show(signInBtn);
    show(installBtn);
    show(retryBtn);
    showInstallHelpMessage();
  }

  function startSessionTimeout() {
    timeoutId = window.setTimeout(function () {
      handleSessionCheckFailure('Session check timed out.');
    }, AUTH_TIMEOUT_MS);
  }

  function initInstallEvents() {
    window.addEventListener('beforeinstallprompt', function (event) {
      event.preventDefault();
      installEvent = event;
    });

    window.addEventListener('appinstalled', function () {
      installEvent = null;
      hide(installHelp);
    });
  }

  function initActions() {
    if (signInBtn) {
      signInBtn.addEventListener('click', function () {
        navigateToApp({ entry: 'login' });
      });
    }

    if (installBtn) {
      installBtn.addEventListener('click', function () {
        if (installEvent && typeof installEvent.prompt === 'function') {
          installEvent.prompt();
          if (installEvent.userChoice && typeof installEvent.userChoice.then === 'function') {
            installEvent.userChoice.then(function () {
              installEvent = null;
            });
          }
          return;
        }
        showInstallHelpMessage();
      });
    }

    if (retryBtn) {
      retryBtn.addEventListener('click', function () {
        window.location.reload();
      });
    }
  }

  function initializeFirebaseAuth() {
    if (!window.PROFIT_LENS_FIREBASE_CONFIG) {
      handleSessionCheckFailure('Missing Firebase web config.');
      return;
    }

    if (!window.firebase || !window.firebase.auth) {
      handleSessionCheckFailure('Firebase Auth failed to load.');
      return;
    }

    try {
      if (!window.firebase.apps || window.firebase.apps.length === 0) {
        window.firebase.initializeApp(window.PROFIT_LENS_FIREBASE_CONFIG);
      }

      startSessionTimeout();
      window.firebase.auth().onAuthStateChanged(
        function (user) {
          handleSessionResolved(user);
        },
        function (error) {
          handleSessionCheckFailure(
            error && error.message ? error.message : 'Session check error.'
          );
        }
      );
    } catch (error) {
      handleSessionCheckFailure(error && error.message ? error.message : 'Session bootstrap failed.');
    }
  }

  initInstallEvents();
  initActions();
  initializeFirebaseAuth();
})();

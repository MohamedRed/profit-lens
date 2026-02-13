(function (root) {
  'use strict';

  var core = root.PROFIT_LENS_BOOTSTRAP_CORE;
  if (!core) {
    return;
  }

  function clearTimeoutIfNeeded() {
    if (core.runtime.timeoutId) {
      clearTimeout(core.runtime.timeoutId);
      core.runtime.timeoutId = null;
    }
  }

  function handleSessionResolved(user) {
    if (core.runtime.sessionResolved) {
      return;
    }

    core.runtime.sessionResolved = true;
    clearTimeoutIfNeeded();

    if (user) {
      core.setState(core.STATES.redirecting);
      core.navigateToApp();
      return;
    }

    core.setState(core.STATES.signedOutReady);
  }

  function handleSessionCheckFailure(errorKey, fallbackError, disableForm) {
    if (core.runtime.sessionResolved) {
      return;
    }

    core.runtime.sessionResolved = true;
    clearTimeoutIfNeeded();
    core.setState(core.STATES.sessionError, {
      errorKey: errorKey,
      fallbackError: fallbackError,
      disableForm: !!disableForm,
    });
  }

  function startSessionTimeout() {
    core.runtime.timeoutId = root.setTimeout(function () {
      handleSessionCheckFailure('errorSessionTimedOut', null, false);
    }, core.AUTH_TIMEOUT_MS);
  }

  function initInstallEvents() {
    root.addEventListener('beforeinstallprompt', function (event) {
      event.preventDefault();
      core.runtime.installEvent = event;
    });

    root.addEventListener('appinstalled', function () {
      core.runtime.installEvent = null;
      core.hide(core.refs.installHelp);
    });
  }

  function initActions(authInstance) {
    if (core.refs.installBtn) {
      core.refs.installBtn.addEventListener('click', function () {
        var installEvent = core.runtime.installEvent;
        if (installEvent && typeof installEvent.prompt === 'function') {
          installEvent.prompt();
          if (installEvent.userChoice && typeof installEvent.userChoice.then === 'function') {
            installEvent.userChoice.then(function () {
              core.runtime.installEvent = null;
            });
          }
          return;
        }
        core.showInstallHelpMessage();
      });
    }

    if (core.refs.retryBtn) {
      core.refs.retryBtn.addEventListener('click', function () {
        root.location.reload();
      });
    }

    if (core.refs.createAccountBtn) {
      core.refs.createAccountBtn.addEventListener('click', core.openFullLogin);
    }

    if (core.refs.openFullLoginBtn) {
      core.refs.openFullLoginBtn.addEventListener('click', core.openFullLogin);
    }

    if (!core.refs.signInForm) {
      return;
    }

    core.refs.signInForm.addEventListener('submit', function (event) {
      event.preventDefault();

      if (
        core.runtime.currentState !== core.STATES.signedOutReady &&
        core.runtime.currentState !== core.STATES.sessionError
      ) {
        return;
      }

      var validation = core.validateSignInForm();
      if (!validation.ok) {
        core.setState(core.STATES.signedOutReady, {
          errorKey: validation.key,
          showFullLoginFallback: false,
        });
        return;
      }

      core.setState(core.STATES.signingIn);
      authInstance
        .signInWithEmailAndPassword(validation.email, validation.password)
        .then(function () {
          core.setState(core.STATES.redirecting);
          core.navigateToApp();
        })
        .catch(function (error) {
          var mapped = core.mapAuthError(error);
          core.setState(core.STATES.signedOutReady, {
            errorKey: mapped.key,
            showFullLoginFallback: mapped.showFullLoginFallback,
          });
        });
    });
  }

  function initializeFirebaseAuth() {
    if (!root.PROFIT_LENS_FIREBASE_CONFIG) {
      handleSessionCheckFailure('errorMissingFirebaseConfig', null, true);
      return;
    }

    if (!root.firebase || !root.firebase.auth) {
      handleSessionCheckFailure('errorFirebaseAuthUnavailable', null, true);
      return;
    }

    try {
      if (!root.firebase.apps || root.firebase.apps.length === 0) {
        root.firebase.initializeApp(root.PROFIT_LENS_FIREBASE_CONFIG);
      }

      var authInstance = root.firebase.auth();
      initActions(authInstance);
      core.setState(core.STATES.checkingSession);
      startSessionTimeout();

      authInstance.onAuthStateChanged(
        function (user) {
          handleSessionResolved(user);
        },
        function (error) {
          handleSessionCheckFailure('errorSessionUnknown', error && error.message, false);
        }
      );
    } catch (error) {
      handleSessionCheckFailure('errorSessionUnknown', error && error.message, true);
    }
  }

  root.PROFIT_LENS_BOOTSTRAP_APP = {
    start: function () {
      initInstallEvents();
      core.initializeLocalization();
      initializeFirebaseAuth();
    },
  };
})(window);

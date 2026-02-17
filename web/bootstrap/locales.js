(function (root) {
  'use strict';

  var MESSAGES = {
    en: {
      badge: 'Liive Lens',
      title: 'Open the fastest path',
      emailLabel: 'Email',
      emailPlaceholder: 'you@example.com',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password',
      signIn: 'Sign in',
      signingIn: 'Signing in...',
      createAccount: 'Create account',
      openFullLogin: 'Open full login',
      installApp: 'Install app',
      retry: 'Retry session check',
      statusCheckingSession: 'Checking your session...',
      statusSignedOut: 'Session not found. Sign in to continue.',
      statusSessionError: 'Session check failed.',
      statusSigningIn: 'Signing in...',
      statusRedirecting: 'Session found. Opening your app...',
      errorMissingFirebaseConfig: 'Missing Firebase web config.',
      errorFirebaseAuthUnavailable: 'Firebase Auth failed to load.',
      errorSessionTimedOut: 'Session check timed out.',
      errorSessionUnknown: 'Unable to validate session right now.',
      errorInvalidEmail: 'Enter a valid email address.',
      errorMissingPassword: 'Enter your password.',
      errorWrongPassword: 'Incorrect password. Please try again.',
      errorUserNotFound: 'No account found for this email.',
      errorTooManyRequests: 'Too many attempts. Please wait and retry.',
      errorNetwork: 'Network issue detected. Check your connection and retry.',
      errorUnknownAuth: 'Sign-in failed. Use full login for advanced recovery.',
      installHelpIos: 'On iOS: tap Share, then Add to Home Screen.',
      installHelpDefault: 'Install prompt unavailable. You can still sign in now.',
    },
    fr: {
      badge: 'Liive Lens',
      title: 'Ouvrez le chemin le plus rapide',
      emailLabel: 'E-mail',
      emailPlaceholder: 'vous@exemple.com',
      passwordLabel: 'Mot de passe',
      passwordPlaceholder: 'Saisissez votre mot de passe',
      signIn: 'Se connecter',
      signingIn: 'Connexion en cours...',
      createAccount: 'Créer un compte',
      openFullLogin: 'Ouvrir la connexion complète',
      installApp: 'Installer l\'application',
      retry: 'Relancer la vérification',
      statusCheckingSession: 'Vérification de session en cours...',
      statusSignedOut: 'Session introuvable. Connectez-vous pour continuer.',
      statusSessionError: 'La vérification de session a échoué.',
      statusSigningIn: 'Connexion en cours...',
      statusRedirecting: 'Session trouvée. Ouverture de votre application...',
      errorMissingFirebaseConfig: 'Configuration Firebase Web manquante.',
      errorFirebaseAuthUnavailable: 'Le chargement de Firebase Auth a échoué.',
      errorSessionTimedOut: 'La vérification de session a expiré.',
      errorSessionUnknown: 'Impossible de valider la session pour le moment.',
      errorInvalidEmail: 'Saisissez une adresse e-mail valide.',
      errorMissingPassword: 'Saisissez votre mot de passe.',
      errorWrongPassword: 'Mot de passe incorrect. Réessayez.',
      errorUserNotFound: 'Aucun compte trouvé pour cet e-mail.',
      errorTooManyRequests: 'Trop de tentatives. Réessayez plus tard.',
      errorNetwork: 'Problème réseau détecté. Vérifiez la connexion puis réessayez.',
      errorUnknownAuth: 'La connexion a échoué. Utilisez la connexion complète.',
      installHelpIos: 'Sur iOS: touchez Partager, puis Ajouter à l\'écran d\'accueil.',
      installHelpDefault: 'Invite d\'installation indisponible. Vous pouvez toujours vous connecter.',
    },
    ar: {
      badge: 'Liive Lens',
      title: 'افتح المسار الأسرع',
      emailLabel: 'البريد الإلكتروني',
      emailPlaceholder: 'you@example.com',
      passwordLabel: 'كلمة المرور',
      passwordPlaceholder: 'أدخل كلمة المرور',
      signIn: 'تسجيل الدخول',
      signingIn: 'جارٍ تسجيل الدخول...',
      createAccount: 'إنشاء حساب',
      openFullLogin: 'فتح تسجيل الدخول الكامل',
      installApp: 'تثبيت التطبيق',
      retry: 'إعادة فحص الجلسة',
      statusCheckingSession: 'جارٍ التحقق من الجلسة...',
      statusSignedOut: 'لا توجد جلسة. سجّل الدخول للمتابعة.',
      statusSessionError: 'فشل التحقق من الجلسة.',
      statusSigningIn: 'جارٍ تسجيل الدخول...',
      statusRedirecting: 'تم العثور على جلسة. جارٍ فتح التطبيق...',
      errorMissingFirebaseConfig: 'إعداد Firebase للويب مفقود.',
      errorFirebaseAuthUnavailable: 'فشل تحميل Firebase Auth.',
      errorSessionTimedOut: 'انتهت مهلة التحقق من الجلسة.',
      errorSessionUnknown: 'تعذر التحقق من الجلسة الآن.',
      errorInvalidEmail: 'أدخل بريدًا إلكترونيًا صالحًا.',
      errorMissingPassword: 'أدخل كلمة المرور.',
      errorWrongPassword: 'كلمة المرور غير صحيحة. حاول مرة أخرى.',
      errorUserNotFound: 'لا يوجد حساب لهذا البريد الإلكتروني.',
      errorTooManyRequests: 'محاولات كثيرة. انتظر قليلًا ثم أعد المحاولة.',
      errorNetwork: 'مشكلة في الشبكة. تحقق من الاتصال ثم أعد المحاولة.',
      errorUnknownAuth: 'فشل تسجيل الدخول. استخدم تسجيل الدخول الكامل للاسترداد.',
      installHelpIos: 'على iOS: اضغط مشاركة ثم إضافة إلى الشاشة الرئيسية.',
      installHelpDefault: 'مطالبة التثبيت غير متاحة الآن. يمكنك متابعة تسجيل الدخول.',
    },
  };

  function resolveLocale(rawLocale) {
    var normalized = (rawLocale || '').toLowerCase();
    if (normalized.indexOf('fr') === 0) {
      return 'fr';
    }
    if (normalized.indexOf('ar') === 0) {
      return 'ar';
    }
    return 'en';
  }

  function translate(locale, key) {
    var table = MESSAGES[locale] || MESSAGES.en;
    return table[key] || MESSAGES.en[key] || key;
  }

  root.PROFIT_LENS_BOOTSTRAP_MESSAGES = MESSAGES;
  root.PROFIT_LENS_RESOLVE_BOOTSTRAP_LOCALE = resolveLocale;
  root.PROFIT_LENS_TRANSLATE_BOOTSTRAP = translate;
})(window);

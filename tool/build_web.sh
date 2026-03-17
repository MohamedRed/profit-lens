#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEFINES_FILE="${DEFINES_FILE:-${ROOT_DIR}/tool/dev_runtime_defines.json}"
BUILD_DIR="${ROOT_DIR}/build/web"
QWIK_DIR="${ROOT_DIR}/apps/qwik"
ANDROID_APK_SOURCE="${ROOT_DIR}/artifacts/android/profit-lens-android-release.apk"
ANDROID_APP_CERT_SHA256="${ANDROID_APP_CERT_SHA256:-}"
ANDROID_APP_PACKAGE="${ANDROID_APP_PACKAGE:-com.profitlens.android}"
ANDROID_APP_DOWNLOAD_SUFFIX="${ANDROID_APP_DOWNLOAD_SUFFIX:-}"

if [[ ! -f "${DEFINES_FILE}" ]]; then
  echo "Missing ${DEFINES_FILE}."
  echo "Create it from tool/dev_runtime_defines.example.json and set STRIPE_PRICE_TIER_* values."
  exit 1
fi

if [[ ! -x "${ROOT_DIR}/tool/sync_web_runtime_config.sh" ]]; then
  chmod +x "${ROOT_DIR}/tool/sync_web_runtime_config.sh"
fi

if [[ -z "${ANDROID_APP_DOWNLOAD_SUFFIX}" && -f "${ANDROID_APK_SOURCE}" ]]; then
  ANDROID_APP_DOWNLOAD_SUFFIX="$(shasum -a 256 "${ANDROID_APK_SOURCE}" | awk '{print substr($1, 1, 16)}')"
fi

DEFINES_FILE="${DEFINES_FILE}" ANDROID_APP_DOWNLOAD_SUFFIX="${ANDROID_APP_DOWNLOAD_SUFFIX}" "${ROOT_DIR}/tool/sync_web_runtime_config.sh"

rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}/next"

npm --prefix "${QWIK_DIR}" ci --include=dev
npm --prefix "${QWIK_DIR}" run build

if [[ ! -f "${QWIK_DIR}/dist/next/index.html" ]]; then
  echo "Missing Qwik build output at ${QWIK_DIR}/dist/next/index.html." >&2
  exit 1
fi
cp -R "${QWIK_DIR}/dist/next/." "${BUILD_DIR}/next/"

if [[ -f "${ANDROID_APK_SOURCE}" ]]; then
  mkdir -p "${BUILD_DIR}/downloads"
  cp "${ANDROID_APK_SOURCE}" "${BUILD_DIR}/downloads/profit-lens-android-release.apk"
fi

mkdir -p "${BUILD_DIR}/android-return/billing"
cat > "${BUILD_DIR}/android-return/billing/index.html" <<'EOF'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Return to Profit Lens</title>
  <style>
    html, body {
      margin: 0;
      min-height: 100%;
      font-family: Roboto, "Avenir Next", "Segoe UI", sans-serif;
      background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
      color: #0f172a;
    }
    main {
      min-height: 100dvh;
      display: grid;
      place-items: center;
      padding: 24px;
      text-align: center;
    }
    .card {
      max-width: 420px;
      padding: 28px;
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 22px 60px rgba(15, 23, 42, 0.12);
    }
    p { line-height: 1.5; color: #334155; }
  </style>
</head>
<body>
  <main>
    <section class="card">
      <h1>Return to Profit Lens</h1>
      <p>Your billing session is finished. If the Android app does not open automatically, switch back to Profit Lens to continue.</p>
    </section>
  </main>
</body>
</html>
EOF

if [[ -n "${ANDROID_APP_CERT_SHA256}" ]]; then
  mkdir -p "${BUILD_DIR}/.well-known"
  cat > "${BUILD_DIR}/.well-known/assetlinks.json" <<EOF
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "${ANDROID_APP_PACKAGE}",
      "sha256_cert_fingerprints": ["${ANDROID_APP_CERT_SHA256}"]
    }
  }
]
EOF
fi

cat > "${BUILD_DIR}/index.html" <<'EOF'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#ece8ff" />
  <meta http-equiv="refresh" content="0;url=/next/" />
  <title>Liive Profit</title>
  <style>
    html,
    body {
      margin: 0;
      min-height: 100%;
      background:
        radial-gradient(120% 140% at 16% -10%, rgba(139, 92, 246, 0.34) 0%, rgba(139, 92, 246, 0) 58%),
        radial-gradient(100% 110% at 90% 120%, rgba(124, 58, 237, 0.2) 0%, rgba(124, 58, 237, 0) 62%),
        linear-gradient(180deg, #faf9ff 0%, #f2efff 58%, #ece8ff 100%);
      color: #18181b;
      font-family: Roboto, "Avenir Next", "Segoe UI", sans-serif;
    }

    .redirect-shell {
      min-height: 100dvh;
      display: grid;
      place-items: center;
      text-align: center;
      padding: 24px;
    }

    .redirect-copy {
      margin: 0;
      font-size: 0.95rem;
      color: #52525b;
    }
  </style>
  <script>
    window.location.replace('/next/');
  </script>
</head>
<body>
  <main class="redirect-shell" role="status" aria-live="polite">
    <p class="redirect-copy">Launching Liive Profit...</p>
  </main>
  <noscript>
    <a href="/next/">Continue to Liive Profit</a>
  </noscript>
</body>
</html>
EOF

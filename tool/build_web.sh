#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEFINES_FILE="${DEFINES_FILE:-${ROOT_DIR}/tool/dev_runtime_defines.json}"
BUILD_DIR="${ROOT_DIR}/build/web"
QWIK_DIR="${ROOT_DIR}/apps/qwik"

if [[ ! -f "${DEFINES_FILE}" ]]; then
  echo "Missing ${DEFINES_FILE}."
  echo "Create it from tool/dev_runtime_defines.example.json and set STRIPE_PRICE_TIER_* values."
  exit 1
fi

if [[ ! -x "${ROOT_DIR}/tool/sync_web_runtime_config.sh" ]]; then
  chmod +x "${ROOT_DIR}/tool/sync_web_runtime_config.sh"
fi
DEFINES_FILE="${DEFINES_FILE}" "${ROOT_DIR}/tool/sync_web_runtime_config.sh"

rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}/next"

npm --prefix "${QWIK_DIR}" ci
npm --prefix "${QWIK_DIR}" run build

if [[ ! -f "${QWIK_DIR}/dist/next/index.html" ]]; then
  echo "Missing Qwik build output at ${QWIK_DIR}/dist/next/index.html." >&2
  exit 1
fi
cp -R "${QWIK_DIR}/dist/next/." "${BUILD_DIR}/next/"

cat > "${BUILD_DIR}/index.html" <<'EOF'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="refresh" content="0;url=/next/" />
  <title>Liive Profit</title>
</head>
<body>
  <script>
    window.location.replace('/next/');
  </script>
  <noscript>
    <a href="/next/">Continue to Liive Profit</a>
  </noscript>
</body>
</html>
EOF

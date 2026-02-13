#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEFINES_FILE="${DEFINES_FILE:-${ROOT_DIR}/tool/dev_dart_defines.json}"
BUILD_DIR="${ROOT_DIR}/build/web"
BOOTSTRAP_DIR="${ROOT_DIR}/web/bootstrap"
QWIK_DIR="${ROOT_DIR}/apps/qwik"
FLUTTER_TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/profit-lens-flutter-web-XXXXXX")"

cleanup() {
  rm -rf "${FLUTTER_TMP_DIR}"
}
trap cleanup EXIT

if [[ ! -f "${DEFINES_FILE}" ]]; then
  echo "Missing ${DEFINES_FILE}."
  echo "Create it from tool/dev_dart_defines.example.json and set GOOGLE_MAPS_API_KEY."
  exit 1
fi

if [[ ! -f "${BOOTSTRAP_DIR}/index.html" ]]; then
  echo "Missing ${BOOTSTRAP_DIR}/index.html."
  exit 1
fi

if [[ ! -x "${ROOT_DIR}/tool/sync_web_runtime_config.sh" ]]; then
  chmod +x "${ROOT_DIR}/tool/sync_web_runtime_config.sh"
fi
"${ROOT_DIR}/tool/sync_web_runtime_config.sh"

rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}/app" "${BUILD_DIR}/next"

flutter build web \
  --dart-define-from-file="${DEFINES_FILE}" \
  --base-href="/app/" \
  --output="${FLUTTER_TMP_DIR}"

cp -R "${FLUTTER_TMP_DIR}/." "${BUILD_DIR}/app/"

npm --prefix "${QWIK_DIR}" ci
npm --prefix "${QWIK_DIR}" run build

if [[ ! -f "${QWIK_DIR}/dist/next/index.html" ]]; then
  echo "Missing Qwik build output at ${QWIK_DIR}/dist/next/index.html." >&2
  exit 1
fi
cp -R "${QWIK_DIR}/dist/next/." "${BUILD_DIR}/next/"

cp "${BOOTSTRAP_DIR}/index.html" "${BUILD_DIR}/index.html"

shopt -s nullglob
for file in "${BOOTSTRAP_DIR}"/*.css "${BOOTSTRAP_DIR}"/*.js; do
  cp "${file}" "${BUILD_DIR}/"
done
shopt -u nullglob

cp "${ROOT_DIR}/web/firebase-web-config.js" "${BUILD_DIR}/firebase-web-config.js"
cp "${ROOT_DIR}/web/firebase-messaging-sw.js" "${BUILD_DIR}/firebase-messaging-sw.js"

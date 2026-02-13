#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEFINES_FILE="${DEFINES_FILE:-${ROOT_DIR}/tool/dev_dart_defines.json}"
BUILD_DIR="${ROOT_DIR}/build/web"
BOOTSTRAP_DIR="${ROOT_DIR}/web/bootstrap"

if [[ ! -f "${DEFINES_FILE}" ]]; then
  echo "Missing ${DEFINES_FILE}."
  echo "Create it from tool/dev_dart_defines.example.json and set GOOGLE_MAPS_API_KEY."
  exit 1
fi

flutter build web --dart-define-from-file="${DEFINES_FILE}"

if [[ ! -f "${BOOTSTRAP_DIR}/index.html" ]]; then
  echo "Missing ${BOOTSTRAP_DIR}/index.html."
  exit 1
fi

cp "${BUILD_DIR}/index.html" "${BUILD_DIR}/app.html"
cp "${BOOTSTRAP_DIR}/index.html" "${BUILD_DIR}/index.html"
cp "${BOOTSTRAP_DIR}"/*.css "${BUILD_DIR}/"
cp "${BOOTSTRAP_DIR}"/*.js "${BUILD_DIR}/"

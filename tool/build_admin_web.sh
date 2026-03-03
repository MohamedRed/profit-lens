#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEFINES_FILE="${DEFINES_FILE:-${ROOT_DIR}/tool/dev_runtime_defines.json}"
BUILD_DIR="${ROOT_DIR}/build/admin"
ADMIN_DIR="${ROOT_DIR}/apps/admin"

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
mkdir -p "${BUILD_DIR}"

npm --prefix "${ADMIN_DIR}" ci
npm --prefix "${ADMIN_DIR}" run build

if [[ ! -f "${ADMIN_DIR}/dist/index.html" ]]; then
  echo "Missing admin build output at ${ADMIN_DIR}/dist/index.html." >&2
  exit 1
fi

cp -R "${ADMIN_DIR}/dist/." "${BUILD_DIR}/"

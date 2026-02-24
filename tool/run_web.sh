#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEFINES_FILE="${DEFINES_FILE:-${ROOT_DIR}/tool/dev_runtime_defines.json}"

if [[ ! -f "${DEFINES_FILE}" ]]; then
  echo "Missing ${DEFINES_FILE}."
  echo "Create it from tool/dev_runtime_defines.example.json and set STRIPE_PRICE_TIER_* values."
  exit 1
fi

DEFINES_FILE="${DEFINES_FILE}" "${ROOT_DIR}/tool/sync_web_runtime_config.sh"
npm --prefix "${ROOT_DIR}/apps/qwik" run dev

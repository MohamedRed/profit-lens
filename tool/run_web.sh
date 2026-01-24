#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEFINES_FILE="${ROOT_DIR}/tool/dev_dart_defines.json"

if [[ ! -f "${DEFINES_FILE}" ]]; then
  echo "Missing ${DEFINES_FILE}."
  echo "Create it from tool/dev_dart_defines.example.json and set GOOGLE_MAPS_API_KEY."
  exit 1
fi

flutter run -d chrome --dart-define-from-file="${DEFINES_FILE}"

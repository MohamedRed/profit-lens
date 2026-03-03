#!/usr/bin/env bash
set -euo pipefail

BUILD_DIR="${1:-build/admin}"
INDEX_HTML="${BUILD_DIR}/index.html"
MANIFEST_FILE="${BUILD_DIR}/manifest.webmanifest"
REGISTER_SW_FILE="${BUILD_DIR}/registerSW.js"

if [[ ! -f "${INDEX_HTML}" ]]; then
  echo "Missing ${INDEX_HTML}" >&2
  exit 1
fi

if ! grep -qi "profit lens admin" "${INDEX_HTML}"; then
  echo "${INDEX_HTML} does not look like the admin bundle entry." >&2
  exit 1
fi

if [[ ! -f "${MANIFEST_FILE}" ]]; then
  echo "Missing ${MANIFEST_FILE}" >&2
  exit 1
fi

if [[ ! -f "${REGISTER_SW_FILE}" ]]; then
  echo "Missing ${REGISTER_SW_FILE}" >&2
  exit 1
fi

echo "Admin bundle layout is valid."

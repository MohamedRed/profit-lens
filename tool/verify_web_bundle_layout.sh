#!/usr/bin/env bash
set -euo pipefail

BUILD_DIR="${1:-build/web}"

INDEX_HTML="${BUILD_DIR}/index.html"
APP_HTML="${BUILD_DIR}/app.html"

if [[ ! -f "${INDEX_HTML}" ]]; then
  echo "Missing ${INDEX_HTML}" >&2
  exit 1
fi

if [[ ! -f "${APP_HTML}" ]]; then
  echo "Missing ${APP_HTML}" >&2
  exit 1
fi

if ! grep -q "id=\"bootstrap-shell\"" "${INDEX_HTML}"; then
  echo "${INDEX_HTML} does not look like the bootstrap entry." >&2
  exit 1
fi

if ! grep -q "flutter_bootstrap.js" "${APP_HTML}"; then
  echo "${APP_HTML} does not look like the Flutter app entry." >&2
  exit 1
fi

echo "Web bundle layout is valid: bootstrap + app entries are present."

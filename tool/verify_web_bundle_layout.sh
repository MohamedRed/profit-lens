#!/usr/bin/env bash
set -euo pipefail

BUILD_DIR="${1:-build/web}"

INDEX_HTML="${BUILD_DIR}/index.html"
NEXT_HTML="${BUILD_DIR}/next/index.html"

if [[ ! -f "${INDEX_HTML}" ]]; then
  echo "Missing ${INDEX_HTML}" >&2
  exit 1
fi

if [[ ! -f "${NEXT_HTML}" ]]; then
  echo "Missing ${NEXT_HTML}" >&2
  exit 1
fi

if ! grep -q "window.location.replace('/next/')" "${INDEX_HTML}"; then
  echo "${INDEX_HTML} is missing the /next redirect." >&2
  exit 1
fi

if ! grep -q "profit-lens-next-entry" "${NEXT_HTML}"; then
  echo "${NEXT_HTML} does not look like the Qwik /next entry." >&2
  exit 1
fi

echo "Web bundle layout is valid: root redirect + /next app entry are present."

#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname -- "$0")"

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Cutroom needs Node.js 20 or newer and npm."
  echo "Install Node.js, then run this launcher again."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing Cutroom dependencies (first launch only)..."
  npm ci
fi

npm run dev

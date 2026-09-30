#!/usr/bin/env bash
set -euo pipefail

if ! command -v ollama >/dev/null 2>&1; then
  echo "Ollama is not installed. Install it from https://ollama.com/download/linux"
  exit 1
fi

echo "Downloading qwen3.5:35b (about 24 GB)..."
ollama pull qwen3.5:35b
echo "Local model is ready. Start Cutroom with ./\"Start Cutroom.sh\""

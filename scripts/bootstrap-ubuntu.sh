#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
model="${CUTROOM_MODEL:-qwen3.5:35b}"

if [ "$(uname -s)" != "Linux" ]; then
  echo "This bootstrap is intended for Ubuntu/Linux."
  exit 1
fi

if command -v sudo >/dev/null 2>&1; then
  sudo_cmd=(sudo)
elif [ "$(id -u)" -eq 0 ]; then
  sudo_cmd=()
else
  echo "sudo is required to install system packages."
  exit 1
fi

echo "[1/5] Installing basic system tools..."
"${sudo_cmd[@]}" apt-get update
"${sudo_cmd[@]}" apt-get install -y ca-certificates curl git

node_major=0
if command -v node >/dev/null 2>&1; then
  node_major="$(node -p 'Number(process.versions.node.split(".")[0])')"
fi

if [ "$node_major" -lt 20 ]; then
  echo "[2/5] Installing Node.js 24 LTS..."
  node_setup="$(mktemp)"
  trap 'rm -f "$node_setup"' EXIT
  curl -fsSL https://deb.nodesource.com/setup_24.x -o "$node_setup"
  "${sudo_cmd[@]}" bash "$node_setup"
  "${sudo_cmd[@]}" apt-get install -y nodejs
  rm -f "$node_setup"
  trap - EXIT
else
  echo "[2/5] Node.js $(node --version) is already installed."
fi

if ! command -v ollama >/dev/null 2>&1; then
  echo "[3/5] Installing Ollama..."
  ollama_setup="$(mktemp)"
  trap 'rm -f "$ollama_setup"' EXIT
  curl -fsSL https://ollama.com/install.sh -o "$ollama_setup"
  sh "$ollama_setup"
  rm -f "$ollama_setup"
  trap - EXIT
else
  echo "[3/5] Ollama $(ollama --version 2>/dev/null || true) is already installed."
fi

if command -v systemctl >/dev/null 2>&1; then
  "${sudo_cmd[@]}" systemctl enable --now ollama 2>/dev/null || true
fi

if ! curl -fsS http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
  echo "Starting the local Ollama service..."
  nohup ollama serve >"${TMPDIR:-/tmp}/cutroom-ollama.log" 2>&1 &
  for _ in $(seq 1 30); do
    curl -fsS http://127.0.0.1:11434/api/tags >/dev/null 2>&1 && break
    sleep 1
  done
fi

if ! curl -fsS http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
  echo "Ollama was installed but its service did not start. Check: ${TMPDIR:-/tmp}/cutroom-ollama.log"
  exit 1
fi

echo "[4/5] Downloading local multimodal model: $model"
ollama pull "$model"

echo "[5/5] Installing Cutroom dependencies..."
cd -- "$repo_root"
npm ci

echo
echo "Cutroom is ready with local model $model."
echo "Starting the desktop app..."
exec npm run dev

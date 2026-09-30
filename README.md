# Cutroom

Private desktop studio for crafting production-ready **MiniMax H3** and **Google Flow / Gemini Omni Flash 1.1** video prompts with a downloaded local model.

## Features

- Electron + React + TypeScript + Tailwind dark UI
- Local backends only: **Ollama** and **LM Studio**
- Streaming generation into the official 6-section Ref2VA format
- Drag-and-drop visual references with roles, traits, and optional local vision captions
- Library with search, open, copy, delete (JSON on disk)
- Persistent local settings (backend URLs, model, temperature, VRAM guidance)
- VRAM-aware warning for 24 GB cards (prefer Q4_K_M / Q5_K_M)

## Output contract

**Full reference (Ref2VA)** — six sections:

```text
subject_definitions:
summary:
retention_analysis:
detailed_description:
overall_soundscape:
non_diegetic_music:
```

**T2VA / I2VA / FL2VA / L2VA (Base)** — alignment line (when required) + three fields:

```text
integrated_multimodal_description:
overall_soundscape:
non_diegetic_music:
```

Formats follow MiniMax’s official guides:
- [Base (T2VA/I2VA/FL2VA/L2VA)](https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/docs/VIDEO_PROMPT_WRITING_GUIDE_base_en.md)
- [Full-Reference (Ref2VA)](https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/docs/VIDEO_PROMPT_WRITING_GUIDE_ref_en.md)

## Requirements

- Node.js 20+ (22 recommended)
- Windows 10/11 or Ubuntu/Linux
- One local model backend: [Ollama](https://ollama.com) or [LM Studio](https://lmstudio.ai)
- A vision-capable model is optional for automatic reference-image descriptions.

## Recommended models (Ollama)

For **24 GB VRAM**, prefer quantized 27B-class weights:

```bash
# Examples — pull whatever Qwen3.x tags you use locally
ollama pull qwen2.5:14b
ollama pull qwen2.5-vl:7b   # optional vision for reference captions
```

If you run GGUF builds in LM Studio, choose **Q4_K_M** or **Q5_K_M** for ~27B on 24 GB cards.

## Setup

```bash
npm install
npm run dev
```

### Ubuntu — easiest setup

```bash
git clone https://github.com/ironflaskai/cutroom.git
cd cutroom
chmod +x "Start Cutroom.sh"
./"Start Cutroom.sh"
```

The launcher installs dependencies on the first run and starts Cutroom. Node.js 20+ is required. On Ubuntu, install the current LTS release from [NodeSource](https://github.com/nodesource/distributions) or use [nvm](https://github.com/nvm-sh/nvm).

Install [Ollama for Linux](https://ollama.com/download/linux), then download the recommended local multimodal model:

```bash
chmod +x "Install Local Model.sh"
./"Install Local Model.sh"
```

The default is `qwen3.5:35b` (about 24 GB), which handles both prompt writing and reference-image understanding. For a server with roughly 96 GB or more available GPU memory, you can instead run `ollama pull qwen3.5:122b` and select it in Cutroom for maximum local quality.

To create a portable AppImage and a Debian package:

```bash
npm ci
npm run dist:linux
```

The packages will appear in `release/`. Make an AppImage executable before launching it: `chmod +x release/*.AppImage`.

### Click to launch (Windows)

1. Double-click **`Cutroom`** on your Desktop, or
2. Double-click **`Start Cutroom.vbs`** / **`Start Cutroom.cmd`** in the project folder

Optional standalone build:

```bash
npm run dist
```

Then open `release\Cutroom-Portable.exe` (no install) or run the NSIS installer for Start Menu + Desktop shortcuts.

Production build without packaging:

```bash
npm run build
npm run start
```

## First run

1. Start **Ollama** or **LM Studio** with the downloaded model loaded.
2. Launch Cutroom (`npm run dev`).
3. Open **Settings**, select a backend, choose a model, and confirm the top bar is green.
4. Use **Settings** (gear) to pick backend URL / model / vision model / temperature.
5. Paste a timed brief, drop references, click **Generate H3 prompt**.
6. **Copy**, **Save to Library**, or **Download (.txt)**.

## Data location

Settings + library JSON are stored under the Electron `userData` folder:

- Windows: `%APPDATA%/cutroom/cutroom/`
- Linux: `~/.config/cutroom/cutroom/`

## Project layout

```text
src/main/          Electron main process (LLM streaming, IPC, storage)
src/preload/       Secure bridge API
src/renderer/      React UI
src/shared/        Types + Ref2VA system prompt builder
```

## Privacy

- Settings remain in Electron's local user-data folder and are excluded from Git.
- Ollama and LM Studio stay local. Cutroom exposes no cloud backend in the UI and migrates old cloud selections back to Ollama.
- Reference media is read locally as data URLs/files. Cutroom has no telemetry.

## License

MIT

# VRC-GoTrans

**[简体中文](README.zh-CN.md) | [English](README.md) | [日本語](README.ja.md) | [한국어](README.ko.md)**

---

<div align="center">
  <img src="public/logo.svg" width="128" height="128" alt="VRC-GoTrans Logo">
  <h3>Real-time translation assistant for VRChat</h3>
  <p>Break language barriers in VR with instant translation</p>
</div>

---

## ✨ Features

- 🌐 **Multi-language translation** — Powered by Tencent HY-MT1.5 (offline, 38 languages) or online APIs
- 💬 **VRChat integration** — Send translations to the in-game chatbox via OSC
- 🔒 **Privacy-first** — Local translation runs 100% offline; data never leaves your machine
- ⚡ **Low latency** — ~0.3-0.5s per translation on CPU (after ~1.5s model load)
- 🎨 **Modern UI** — Clean interface built with React + Radix UI
- 🌍 **Multilingual interface** — UI in 简体中文 / English / 日本語 / 한국어
- 🚧 **Speech recognition** — faster-whisper integration planned

## 🚀 Quick Start

### Requirements

- Windows 10/11 (macOS/Linux planned)
- 4GB+ RAM
- ~2GB disk space for the model

### Install

**Option 1: Download a release (recommended)**

Grab the latest installer from [Releases](https://github.com/ChuranNeko/VRC-GoTrans/releases).

**Option 2: Build from source**

```bash
git clone https://github.com/ChuranNeko/VRC-GoTrans.git
cd VRC-GoTrans
pnpm install
pnpm tauri dev      # development
pnpm tauri build    # production
```

### First run

1. Pick your interface language
2. Point the app to your HY-MT model file — it gets moved to `~/.vrc-gotrans/models/`
3. Configure OSC (default port: 9000)
4. Done — start translating in VRChat

> The Python sidecar (translation engine) is auto-bootstrapped on first run via `uv`, downloading Python 3.11 + dependencies through configurable mirrors.

## 📖 How it works

```
Text input  (speech recognition via faster-whisper — planned)
    ↓
HY-MT1.5 / online API  (text → translation)   via Python sidecar
    ↓
OSC (rosc, Rust) → VRChat chatbox
```

## 🛠️ Tech stack

**Frontend**
- React 19 + TypeScript
- Radix UI Themes + Vite
- i18next (UI: zh-Hans / en / ja / ko)

**Shell**
- Tauri 2 (Rust)
- rosc (OSC protocol)
- Tokio (async runtime)

**AI sidecar** (Python, managed by uv, pinned to 3.11)
- llama-cpp-python — loads HY-MT GGUF for local translation
- faster-whisper — speech recognition (planned)

**AI models**
- Translation: [Tencent HY-MT1.5-1.8B](https://huggingface.co/tencent/HY-MT1.5-1.8B-GGUF) (Q4_K_M, ~1.1GB GGUF)
- Speech recognition: OpenAI Whisper (planned)

## 🌍 Supported languages

Translation supports 38 languages, including:
English, 简体中文, 繁體中文, 日本語, 한국어, 粵語, Français, Deutsch, Español, Português, Italiano, Русский, Українська, العربية, हिन्दी, ไทย, Tiếng Việt, Bahasa Indonesia, …and more.

## 📋 Configuration

All data lives in one place — `~/.vrc-gotrans/` (Windows/macOS/Linux alike):
- `config.json` — settings
- `models/` — GGUF model files
- `logs/` — application logs
- `cache/` — runtime cache

## 🤝 Contributing

Contributions welcome! Fork → feature branch → PR.

### Translation contributions

Help translate the UI into more languages! Translation files live in `src/locales/`. The locale shape is derived from `zh-Hans.ts` (`TranslationShape`) — missing keys fail the TypeScript build, so you'll know immediately if something's off.

## 📝 License

Copyright (C) 2026 ChuranNeko. Licensed under the [GNU AGPL-3.0-or-later](LICENSE).

## 🙏 Acknowledgements

- [Tencent HY-MT1.5](https://huggingface.co/tencent/HY-MT1.5-1.8B-GGUF) — translation model
- [VRChat OSC](https://docs.vrchat.com/docs/osc-overview)
- [llama.cpp](https://github.com/ggerganov/llama.cpp) — model inference
- [Tauri](https://tauri.app/) — desktop app framework
- [uv](https://docs.astral.sh/uv/) — Python package manager

## 📧 Contact

- Author: ChuranNeko
- Email: churanneko@outlook.com
- Issues: [GitHub Issues](https://github.com/ChuranNeko/VRC-GoTrans/issues)

---

<div align="center">
  Built with ❤️ for the VRChat community
</div>

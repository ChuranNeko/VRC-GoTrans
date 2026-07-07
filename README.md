# VRC-GoTrans

**[简体中文](README.zh-CN.md) | [English](README.md) | [日本語](README.ja.md)**

---

<div align="center">
  <img src="src/assets/logo.svg" width="128" height="128" alt="VRC-GoTrans Logo">
  <h3>Real-time Translation Assistant for VRChat</h3>
  <p>Break language barriers in virtual reality with instant voice-to-voice translation</p>
</div>

---

## ✨ Features

- 🎤 **Voice Recognition** — Local Whisper STT for privacy-preserving speech-to-text
- 🌐 **Multi-language Translation** — Powered by Tencent HY-MT1.5 (offline) or online APIs
- 💬 **VRChat Integration** — Send translations directly to in-game chatbox via OSC
- 🔒 **Privacy First** — All processing can run 100% offline, no data leaves your machine
- ⚡ **Low Latency** — Optimized pipeline for near-real-time translation
- 🎨 **Modern UI** — Clean, accessible interface built with React + Radix UI

## 🚀 Quick Start

### Prerequisites

- Windows 10/11 (macOS/Linux support planned)
- 4GB+ RAM
- ~2GB disk space for models

### Installation

**Option 1: Download Release (Recommended)**

Download the latest installer from [Releases](https://github.com/ChuranNeko/VRC-GoTrans/releases).

**Option 2: Build from Source**

```bash
# Clone repository
git clone https://github.com/ChuranNeko/VRC-GoTrans.git
cd VRC-GoTrans

# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev

# Build for production
pnpm tauri build
```

### First Launch

1. Select your preferred UI language
2. Choose translation engine (online API or local model)
3. Choose speech recognition engine (online or local Whisper)
4. Configure OSC settings (default port: 9000)
5. Done! Start translating in VRChat

## 📖 How It Works

```
Microphone Input
    ↓
Whisper STT (Voice → Text)
    ↓
HY-MT1.5 / Online API (Text → Translation)
    ↓
OSC Protocol → VRChat Chatbox
```

## 🛠️ Tech Stack

**Frontend**
- React 19 + TypeScript 5.8
- Radix UI Themes 3.3
- Vite 8.1
- i18next (multi-language support)

**Backend**
- Tauri 2 (Rust)
- llama.cpp (model inference)
- Tokio (async runtime)
- rosc (OSC protocol)

**AI Models**
- Translation: [Tencent HY-MT1.5-1.8B](https://huggingface.co/tencent/HY-MT1.5-1.8B-GGUF) (1.1GB GGUF)
- STT: OpenAI Whisper (base model, ~150MB)

## 🌍 Supported Languages

Translation supports 33+ languages including:
- English
- 中文 (Chinese)
- 日本語 (Japanese)
- 한국어 (Korean)
- Français (French)
- Deutsch (German)
- Español (Spanish)
- Русский (Russian)
- And more...

## 📋 Configuration

Configuration file location:
- Windows: `%APPDATA%\VRC-GoTrans\config.json`
- macOS: `~/Library/Application Support/VRC-GoTrans/config.json`
- Linux: `~/.config/VRC-GoTrans/config.json`

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) first.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request

### Translation Contributions

Help us translate the UI to more languages! Translation files are located in `src/locales/`.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [VRChat OSC Documentation](https://docs.vrchat.com/docs/osc-overview)
- [Tencent HY-MT1.5](https://huggingface.co/tencent/HY-MT1.5-1.8B-GGUF) — Translation model
- [OpenAI Whisper](https://github.com/openai/whisper) — Speech recognition
- [llama.cpp](https://github.com/ggerganov/llama.cpp) — Fast model inference
- [Tauri](https://tauri.app/) — Desktop app framework

## 📧 Contact

- Author: ChuranNeko
- Issues: [GitHub Issues](https://github.com/ChuranNeko/VRC-GoTrans/issues)

---

<div align="center">
  Made with ❤️ for the VRChat community
</div>

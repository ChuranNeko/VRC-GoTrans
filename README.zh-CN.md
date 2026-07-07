# VRC-GoTrans

**[简体中文](README.zh-CN.md) | [English](README.md) | [日本語](README.ja.md) | [한국어](README.ko.md)**

---

<div align="center">
  <img src="public/logo.svg" width="128" height="128" alt="VRC-GoTrans Logo">
  <h3>VRChat 实时翻译助手</h3>
  <p>用即时翻译打破虚拟现实中的语言隔阂</p>
</div>

---

## ✨ 功能特性

- 🌐 **多语言翻译** —— 腾讯 HY-MT1.5 离线驱动，支持 38 种语言；亦可接在线 API
- 💬 **VRChat 集成** —— 通过 OSC 把译文发送到游戏内聊天框
- 🔒 **隐私优先** —— 本地翻译 100% 离线，数据不出本机
- ⚡ **低延迟** —— CPU 模式每条 0.3-0.5 秒（模型加载约 1.5 秒）
- 🎨 **现代界面** —— React + Radix UI 简洁易用
- 🌍 **多语言界面** —— 简体中文 / English / 日本語 / 한국어
- 🚧 **语音识别** —— faster-whisper 集成开发中

## 🚀 快速开始

### 环境要求

- Windows 10/11（macOS/Linux 支持计划中）
- 4GB 以上内存
- 约 2GB 磁盘空间用于存放模型

### 安装

**方式一：下载发行版（推荐）**

从 [Releases](https://github.com/ChuranNeko/VRC-GoTrans/releases) 下载最新安装包。

**方式二：从源码构建**

```bash
git clone https://github.com/ChuranNeko/VRC-GoTrans.git
cd VRC-GoTrans
pnpm install
pnpm tauri dev      # 开发模式
pnpm tauri build    # 生产构建
```

### 首次启动

1. 选择界面语言
2. 定位你的 HY-MT 模型文件 —— 它会被移动到 `~/.vrc-gotrans/models/`
3. 配置 OSC（默认端口：9000）
4. 完成！在 VRChat 中开始翻译

> Python sidecar（翻译引擎）首次运行时由 `uv` 自动引导，通过可配置的镜像源下载 Python 3.11 + 依赖。

## 📖 工作原理

```
文本输入（语音识别 faster-whisper —— 开发中）
    ↓
HY-MT1.5 / 在线 API（文字 → 译文）   经 Python sidecar
    ↓
OSC（rosc，Rust）→ VRChat 聊天框
```

## 🛠️ 技术栈

**前端**
- React 19 + TypeScript
- Radix UI Themes + Vite
- i18next（界面：zh-Hans / en / ja / ko）

**壳**
- Tauri 2（Rust）
- rosc（OSC 协议）
- Tokio（异步运行时）

**AI sidecar**（Python，uv 管理，锁定 3.11）
- llama-cpp-python —— 加载 HY-MT GGUF 做本地翻译
- faster-whisper —— 语音识别（开发中）

**AI 模型**
- 翻译：[腾讯 HY-MT1.5-1.8B](https://huggingface.co/tencent/HY-MT1.5-1.8B-GGUF)（Q4_K_M，约 1.1GB GGUF）
- 语音识别：OpenAI Whisper（开发中）

## 🌍 支持的语言

翻译支持 38 种语言，包括：
English、简体中文、繁體中文、日本語、한국어、粵語、Français、Deutsch、Español、Português、Italiano、Русский、Українська、العربية、हिन्दी、ไทย、Tiếng Việt、Bahasa Indonesia……以及更多。

## 📋 配置

所有数据统一在 `~/.vrc-gotrans/`（Windows/macOS/Linux 一致）：
- `config.json` —— 设置
- `models/` —— GGUF 模型文件
- `logs/` —— 应用日志
- `cache/` —— 运行时缓存

## 🤝 参与贡献

欢迎贡献！Fork → 特性分支 → PR。

### 翻译贡献

帮助把界面翻译成更多语言！翻译文件在 `src/locales/`。locale 结构由 `zh-Hans.ts` 派生（`TranslationShape`），缺 key 会让 TypeScript 编译失败，立即发现。

## 📝 许可证

Copyright (C) 2026 ChuranNeko. 本项目基于 [GNU AGPL-3.0-or-later](LICENSE) 许可证开源。

## 🙏 致谢

- [腾讯 HY-MT1.5](https://huggingface.co/tencent/HY-MT1.5-1.8B-GGUF) —— 翻译模型
- [VRChat OSC](https://docs.vrchat.com/docs/osc-overview)
- [llama.cpp](https://github.com/ggerganov/llama.cpp) —— 模型推理
- [Tauri](https://tauri.app/) —— 桌面应用框架
- [uv](https://docs.astral.sh/uv/) —— Python 包管理器

## 📧 联系方式

- 作者：ChuranNeko
- 邮箱：churanneko@outlook.com
- QQ 群：[初然的猫猫头窝](https://qm.qq.com/q/MS6J5wEOOY)
- 问题反馈：[GitHub Issues](https://github.com/ChuranNeko/VRC-GoTrans/issues)

---

<div align="center">
  为 VRChat 社区用 ❤️ 打造
</div>

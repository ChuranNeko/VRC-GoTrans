# VRC-GoTrans

**[简体中文](README.zh-CN.md) | [English](README.md) | [日本語](README.ja.md)**

---

<div align="center">
  <img src="src/assets/logo.svg" width="128" height="128" alt="VRC-GoTrans Logo">
  <h3>VRChat 实时翻译助手</h3>
  <p>用即时语音互译打破虚拟现实中的语言隔阂</p>
</div>

---

## ✨ 功能特性

- 🎤 **语音识别** —— 本地 Whisper STT，保护隐私的语音转文字
- 🌐 **多语言翻译** —— 由腾讯 HY-MT1.5（离线）或在线 API 驱动
- 💬 **VRChat 集成** —— 通过 OSC 直接把译文发送到游戏内聊天框
- 🔒 **隐私优先** —— 全流程可 100% 离线运行，数据不出本机
- ⚡ **低延迟** —— 优化的处理管线，接近实时翻译
- 🎨 **现代界面** —— 基于 React + Radix UI 的简洁、易用界面

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
# 克隆仓库
git clone https://github.com/ChuranNeko/VRC-GoTrans.git
cd VRC-GoTrans

# 安装依赖
pnpm install

# 开发模式运行
pnpm tauri dev

# 构建生产版本
pnpm tauri build
```

### 首次启动

1. 选择你偏好的界面语言
2. 选择翻译引擎（在线 API 或本地模型）
3. 选择语音识别引擎（在线或本地 Whisper）
4. 配置 OSC 设置（默认端口：9000）
5. 完成！在 VRChat 中开始翻译

## 📖 工作原理

```
麦克风输入
    ↓
Whisper STT（语音 → 文字）
    ↓
HY-MT1.5 / 在线 API（文字 → 译文）
    ↓
OSC 协议 → VRChat 聊天框
```

## 🛠️ 技术栈

**前端**
- React 19 + TypeScript 5.8
- Radix UI Themes 3.3
- Vite 8.1
- i18next（多语言支持）

**后端**
- Tauri 2（Rust）
- llama.cpp（模型推理）
- Tokio（异步运行时）
- rosc（OSC 协议）

**AI 模型**
- 翻译：[腾讯 HY-MT1.5-1.8B](https://huggingface.co/tencent/HY-MT1.5-1.8B-GGUF)（1.1GB GGUF）
- 语音识别：OpenAI Whisper（base 模型，约 150MB）

## 🌍 支持的语言

翻译支持 33+ 种语言，包括：
- English（英语）
- 中文
- 日本語（日语）
- 한국어（韩语）
- Français（法语）
- Deutsch（德语）
- Español（西班牙语）
- Русский（俄语）
- 以及更多……

## 📋 配置

配置文件位置：
- Windows：`%APPDATA%\VRC-GoTrans\config.json`
- macOS：`~/Library/Application Support/VRC-GoTrans/config.json`
- Linux：`~/.config/VRC-GoTrans/config.json`

## 🤝 参与贡献

欢迎贡献！请先阅读我们的[贡献指南](CONTRIBUTING.md)。

### 开发流程

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feat/your-feature`
3. 提交更改：`git commit -m "feat: add your feature"`
4. 推送分支：`git push origin feat/your-feature`
5. 发起 Pull Request

### 翻译贡献

帮助我们把界面翻译成更多语言！翻译文件位于 `src/locales/`。

## 📝 许可证

本项目基于 MIT 许可证开源，详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- [VRChat OSC 文档](https://docs.vrchat.com/docs/osc-overview)
- [腾讯 HY-MT1.5](https://huggingface.co/tencent/HY-MT1.5-1.8B-GGUF) —— 翻译模型
- [OpenAI Whisper](https://github.com/openai/whisper) —— 语音识别
- [llama.cpp](https://github.com/ggerganov/llama.cpp) —— 快速模型推理
- [Tauri](https://tauri.app/) —— 桌面应用框架

## 📧 联系方式

- 作者：ChuranNeko
- 问题反馈：[GitHub Issues](https://github.com/ChuranNeko/VRC-GoTrans/issues)

---

<div align="center">
  为 VRChat 社区用 ❤️ 打造
</div>

# VRC-GoTrans 项目状态报告

## 项目信息

- **项目名称**: VRC-GoTrans
- **版本**: v0.1.0
- **描述**: VRChat 翻译助手 - 基于 Tauri 的桌面应用
- **技术栈**: Tauri 2 + React + TypeScript + Rust

---

## ✅ 已完成功能

### 1. OSC 通信功能

**状态**: ✅ 完成并测试通过

**功能**:
- 发送消息到 VRChat chatbox（最多 144 字符）
- 控制打字指示器显示/隐藏
- UDP 通信（端口 9000）

**文件**:
- 后端：`src-tauri/src/osc.rs`
- 前端：`src/services/osc.ts`
- UI：`src/components/OscTestPanel.tsx`

**文档**: `docs/OSC_INTEGRATION.md`

### 2. 首次启动引导

**状态**: ✅ 完成并测试通过

**功能**:
- 5 步引导向导
- 翻译引擎选择（在线/本地）
- 语音识别选择（在线/本地 Whisper）
- OSC 配置
- 配置持久化（保存到用户配置目录）

**文件**:
- 前端：`src/components/FirstRunWizard.tsx`
- 服务：`src/services/config.ts`
- 后端：`src-tauri/src/config.rs`

**文档**: `docs/FIRST_RUN_WIZARD.md`

### 3. 配置管理系统

**状态**: ✅ 完成

**功能**:
- 配置文件读写
- 默认配置
- 配置验证
- 跨平台路径支持

**配置位置**:
- Windows: `%APPDATA%\VRC-GoTrans\config.json`
- macOS: `~/Library/Application Support/VRC-GoTrans/config.json`
- Linux: `~/.config/VRC-GoTrans/config.json`

### 4. UI 框架

**状态**: ✅ 完成

**组件库**: Radix UI Themes
**功能**:
- 标签页导航
- 响应式布局
- 国际化支持（i18next）
- 暗色主题支持

---

## 🚧 待实现功能

### 高优先级

#### 1. 翻译功能
- [ ] 在线翻译 API 集成
  - [ ] Google Translate
  - [ ] DeepL API
  - [ ] 百度翻译
- [ ] 本地翻译模型
  - [ ] 模型下载管理
  - [ ] 推理引擎集成

#### 2. 语音识别（STT）
- [ ] 在线 STT API 集成
  - [ ] Google Speech API
  - [ ] Azure Speech Services
- [ ] 本地 Whisper 集成
  - [ ] faster-whisper 集成
  - [ ] 模型下载管理
  - [ ] 音频捕获（麦克风）

#### 3. 主要功能界面
- [ ] 翻译主界面
  - [ ] 实时语音识别显示
  - [ ] 翻译结果显示
  - [ ] 发送到 VRChat 按钮
- [ ] 语言选择
  - [ ] 源语言
  - [ ] 目标语言
  - [ ] 多语言支持

### 中优先级

#### 4. 设置界面
- [ ] API Key 配置
- [ ] 模型管理
  - [ ] 下载模型
  - [ ] 删除模型
  - [ ] 查看已安装模型
- [ ] 音频设备选择
- [ ] 快捷键配置

#### 5. 高级功能
- [ ] 翻译历史记录
- [ ] 消息模板
- [ ] 自动翻译
- [ ] 日志查看

### 低优先级

#### 6. 扩展功能
- [ ] 插件系统
- [ ] 云端配置同步
- [ ] 统计数据
- [ ] 导出/导入配置

---

## 📦 打包策略

### 方案：渐进式下载

**基础安装包** (~30MB):
- 应用本体
- OSC 通信模块
- 在线 API 支持
- UI 界面

**可选组件** (按需下载):
- Whisper tiny 模型 (~39MB)
- Whisper base 模型 (~142MB)
- 翻译模型 (~500MB)

**优势**:
- 安装包小巧
- 快速部署
- 用户可选功能
- 节省磁盘空间

---

## 🏗️ 技术架构

```
┌─────────────────────────────────────┐
│          前端 (React + TS)          │
├─────────────────────────────────────┤
│  UI 组件          │  服务层         │
│  - FirstRunWizard │  - ConfigService│
│  - OscTestPanel   │  - OscService   │
│  - MainView       │  - SttService   │
│  - Settings       │  - TransService │
└─────────────────────────────────────┘
              ↕ Tauri IPC
┌─────────────────────────────────────┐
│          后端 (Rust)                │
├─────────────────────────────────────┤
│  模块                               │
│  - osc.rs         (OSC 通信)       │
│  - config.rs      (配置管理)       │
│  - stt.rs         (语音识别)       │
│  - translator.rs  (翻译引擎)       │
│  - audio.rs       (音频捕获)       │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│         外部服务/模型               │
├─────────────────────────────────────┤
│  - VRChat (OSC 9000)               │
│  - 在线 API (Google/DeepL/Azure)   │
│  - 本地模型 (Whisper/CTranslate2) │
└─────────────────────────────────────┘
```

---

## 🔧 开发环境

### 依赖版本
- Tauri: 2.x
- React: 19.1.0
- TypeScript: 5.8.3
- Rust: 2021 edition

### 关键依赖
**Rust**:
- `rosc` 0.10.1 - OSC 协议
- `tokio` 1.52 - 异步运行时
- `dirs` 5.0 - 跨平台路径

**TypeScript**:
- `@radix-ui/themes` 3.3.0 - UI 组件
- `i18next` 26.3.4 - 国际化
- `react-i18next` 17.0.8

---

## 📝 编译状态

### Rust 后端
```
✅ 编译成功
⚠️  1 个警告（未使用的方法 set_target）
```

### TypeScript 前端
```
⚠️  需要重新安装依赖（pnpm 遇到 TTY 问题）
```

---

## 🎯 下一步计划

### 立即行动
1. **选择并集成翻译引擎**
   - 建议：先实现 Google Translate（免费且易用）
   - 或：DeepL（质量更好，需要 API Key）

2. **集成 Whisper STT**
   - 使用 `whisper-rs` 或调用 Python faster-whisper
   - 实现音频捕获

3. **实现主翻译界面**
   - 语音输入 → STT → 翻译 → 显示 → 发送到 VRChat

### 本周目标
- [ ] 完成基础翻译功能
- [ ] 实现语音识别
- [ ] 测试端到端流程

### 本月目标
- [ ] 完善所有核心功能
- [ ] 添加设置界面
- [ ] 优化用户体验
- [ ] 准备 v0.1.0 发布

---

## 📚 文档

已创建的文档：
- ✅ `docs/OSC_INTEGRATION.md` - OSC 功能说明
- ✅ `docs/OSC_COMPLETION_SUMMARY.md` - OSC 完成总结
- ✅ `docs/FIRST_RUN_WIZARD.md` - 首次引导说明
- ✅ `README.md` - 项目介绍

---

## 🐛 已知问题

1. **前端依赖安装**
   - 问题：pnpm 在非 TTY 环境报错
   - 解决：手动运行 `pnpm install` 或设置 `CI=true`

2. **未使用的代码警告**
   - 位置：`osc.rs` 中的 `set_target` 方法
   - 影响：无（仅编译警告）
   - 说明：为未来自定义端口功能预留

---

## 💡 建议

### 对于用户
- 优先使用在线 API（更简单、更快）
- 如果重视隐私，使用本地模型
- 确保 VRChat 已启用 OSC

### 对于开发
- 优先实现核心翻译流程
- 模块化设计便于后续扩展
- 保持代码文档同步更新

---

**更新时间**: 2026-07-07  
**贡献者**: ChuranNeko  
**许可证**: MIT

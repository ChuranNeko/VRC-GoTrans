# 首次启动引导功能文档

## 功能概述

VRC-GoTrans 现在包含一个完整的首次启动引导流程，帮助用户在初次使用时完成必要的配置。

## 实现的功能

### 1. 多步骤引导向导

**5 个引导步骤**：

1. **欢迎页面** - 介绍应用
2. **翻译引擎选择** - 在线 API vs 本地模型
3. **语音识别选择** - 在线 API vs 本地 Whisper
4. **OSC 配置** - 设置 VRChat 连接参数
5. **完成页面** - 显示配置摘要

### 2. 配置持久化

**前端** (`src/services/config.ts`)：
- `ConfigService` 类管理配置
- 单例模式，全局访问
- 自动检测首次运行

**后端** (`src-tauri/src/config.rs`)：
- 配置文件保存在用户目录：
  - Windows: `%APPDATA%\VRC-GoTrans\config.json`
  - macOS: `~/Library/Application Support/VRC-GoTrans/config.json`
  - Linux: `~/.config/VRC-GoTrans/config.json`

### 3. 配置选项

```typescript
interface AppConfig {
  firstRunCompleted: boolean;
  translationEngine: 'online' | 'local';
  translationProvider?: 'google' | 'deepl' | 'baidu';
  sttEngine: 'online' | 'local';
  sttProvider?: 'google' | 'azure';
  oscEnabled: boolean;
  oscPort: number;
}
```

## 用户体验流程

```
启动应用
    ↓
检查是否首次运行
    ↓
[首次运行]
    ↓
显示引导向导（5步）
    ↓
用户完成配置
    ↓
保存配置（firstRunCompleted: true）
    ↓
进入主应用界面
```

## UI 特性

✅ **进度指示器** - 顶部显示当前步骤
✅ **双向导航** - 支持前进/后退
✅ **条件显示** - 根据选择显示不同选项
✅ **配置预览** - 完成页面显示所有设置
✅ **响应式设计** - 使用 Radix UI 组件
✅ **清晰的说明** - 每个选项都有详细描述

## 翻译引擎选项

### 在线翻译 API（推荐）
- ✓ 翻译质量高
- ✓ 无需下载模型
- ✓ 响应快速
- 支持：Google Translate、DeepL、百度翻译

### 本地翻译模型
- 完全离线
- 需要下载 ~500MB 模型
- 适合重视隐私的用户

## 语音识别选项

### 在线 STT API
- 识别准确
- 多语言支持
- 支持：Google Speech、Azure Speech

### 本地 Whisper 模型（推荐）
- ✓ 完全离线
- ✓ 隐私保护
- 需要下载 ~150MB 模型（base 模型）

## Tauri 命令

后端提供的配置相关命令：

```rust
// 加载配置
load_config() -> Result<String, String>

// 保存配置
save_config(config_json: String) -> Result<(), String>
```

## 使用示例

### 检查是否首次运行

```typescript
import { configService } from './services/config';

const isFirstRun = await configService.isFirstRun();
if (isFirstRun) {
  // 显示引导向导
}
```

### 保存用户配置

```typescript
await configService.completeFirstRun({
  translationEngine: 'online',
  translationProvider: 'google',
  sttEngine: 'local',
  oscEnabled: true,
  oscPort: 9000,
});
```

### 读取配置

```typescript
const config = configService.getConfig();
console.log(config.translationEngine); // 'online'
```

## 文件结构

```
src/
├── components/
│   └── FirstRunWizard.tsx      # 引导向导 UI 组件
├── services/
│   └── config.ts                # 配置管理服务
└── App.tsx                      # 集成引导逻辑

src-tauri/src/
├── config.rs                    # Rust 配置管理
└── lib.rs                       # Tauri 命令注册
```

## 下一步扩展

### 短期
- [ ] 添加 API Key 配置界面
- [ ] 实现模型下载进度提示
- [ ] 添加"跳过"选项（使用默认配置）

### 中期
- [ ] 本地模型管理（下载、更新、删除）
- [ ] 配置导入/导出功能
- [ ] 多语言支持（i18n）

### 长期
- [ ] 高级设置页面
- [ ] 配置模板/预设
- [ ] 云端配置同步

## 测试方法

### 测试首次运行
1. 删除配置文件：`%APPDATA%\VRC-GoTrans\config.json`
2. 重启应用
3. 应该看到引导向导

### 重置配置
```typescript
await configService.reset();
```

## 注意事项

- 配置文件是纯 JSON，可以手动编辑
- 删除配置文件会触发重新运行引导
- 首次运行标记 `firstRunCompleted` 防止重复显示
- 所有配置都有合理的默认值

---

**状态**: ✅ 已完成并通过编译测试  
**版本**: v0.1.0  
**日期**: 2026-07-07

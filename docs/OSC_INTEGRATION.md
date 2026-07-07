# VRChat OSC 集成文档

## 概述

本项目已集成 VRChat OSC (Open Sound Control) 功能，可以将翻译后的文本实时发送到 VRChat 游戏内的 chatbox。

## OSC 技术规格

### 端口配置
- **VRChat 接收端口**: `9000` (UDP)
- **VRChat 发送端口**: `9001` (UDP)
- **目标地址**: `127.0.0.1` (本地回环)

### OSC 地址

#### `/chatbox/input`
发送文本到 VRChat chatbox

**参数**:
- `string`: 消息内容（最多 144 字符）
- `bool`: 是否立即发送
  - `true`: 立即发送到聊天
  - `false`: 仅在 chatbox 中显示预览

#### `/chatbox/typing`
显示/隐藏打字指示器

**参数**:
- `bool`: 打字状态
  - `true`: 显示打字中
  - `false`: 隐藏指示器

## 实现架构

### 后端 (Rust)

**依赖库**:
- `rosc`: OSC 协议编码/解码
- `tokio`: 异步运行时

**核心模块**: `src-tauri/src/osc.rs`

```rust
// OSC 客户端
pub struct OscClient {
    socket: UdpSocket,
    target_addr: SocketAddr,
}

// OSC 管理器（全局单例）
pub struct OscManager {
    client: Mutex<Option<OscClient>>,
}
```

**Tauri 命令**:
- `init_osc()`: 初始化 OSC 客户端
- `send_chatbox(message, send_immediately)`: 发送消息
- `set_typing_indicator(typing)`: 设置打字状态

### 前端 (TypeScript)

**服务模块**: `src/services/osc.ts`

```typescript
export class OscService {
  async init(): Promise<void>
  async sendChatbox(message: string, sendImmediately: boolean): Promise<void>
  async setTypingIndicator(typing: boolean): Promise<void>
}

// 单例实例
export const oscService = new OscService();
```

**UI 组件**: `src/components/OscTestPanel.tsx`
- 提供可视化的 OSC 测试界面
- 支持消息发送和打字指示器控制

## 使用方法

### 在代码中使用

```typescript
import { oscService } from './services/osc';

// 初始化（只需调用一次）
await oscService.init();

// 发送消息到 VRChat chatbox
await oscService.sendChatbox('Hello VRChat!', true);

// 显示打字指示器
await oscService.setTypingIndicator(true);

// 隐藏打字指示器
await oscService.setTypingIndicator(false);
```

### 在 VRChat 中启用 OSC

1. 打开 VRChat
2. 按下 ESC 打开菜单
3. 进入 **Settings** → **OSC**
4. 确保 **Enable OSC** 已开启
5. 默认端口应为 `9000`

## 测试

运行应用后，切换到 **OSC 测试** 标签页：

1. 点击"初始化 OSC"建立连接
2. 输入测试消息
3. 点击"发送消息"
4. 在 VRChat 中查看 chatbox

## 注意事项

- 消息长度限制为 **144 字符**（VRChat 限制）
- 应用和 VRChat 必须在同一台机器上运行
- 确保 UDP 端口 9000 未被其他程序占用
- OSC 功能需要 VRChat 运行时才能正常工作

## 未来扩展

- [ ] 支持自定义 OSC 端口配置
- [ ] 支持接收 VRChat OSC 参数（如头像参数）
- [ ] 添加 OSC 连接状态检测
- [ ] 支持批量消息队列
- [ ] 添加消息发送历史记录

## 参考资料

- [VRChat OSC 官方文档](https://docs.vrchat.com/docs/osc-overview)
- [OSC 协议规范](http://opensoundcontrol.org/)
- [rosc Rust 库](https://crates.io/crates/rosc)

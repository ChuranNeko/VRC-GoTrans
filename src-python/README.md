# VRC-GoTrans Python Sidecar

AI 后端进程，由 Tauri(Rust) 壳在首次运行时通过 uv 自动引导启动。

## 架构

- **IPC**：localhost HTTP + SSE。绑 `127.0.0.1:0` 随机端口，首行 stdout 输出握手 `VRCGOTRANS {"ready":true,"port":N}`，之后 stdout 绝不再写（所有日志走 stderr）。
- **生命周期**：由 Rust 侧通过 `POST /shutdown` 优雅关闭，SIGTERM/SIGINT 兜底。
- **环境**：uv 管理，锁 Python 3.11（AI 库兼容性），依赖走可配置镜像源。

## 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |
| POST | `/translate` | 翻译 `{text, targetLang}` |
| POST | `/shutdown` | 优雅关闭 |

## 开发

```bash
cd src-python
uv sync                 # 装核心依赖
uv sync --extra local   # 追加本地翻译(llama-cpp-python)
uv sync --extra stt     # 追加语音识别(faster-whisper)
uv run python -m vrc_gotrans
```

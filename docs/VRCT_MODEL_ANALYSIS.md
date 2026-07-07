# VRCT STT 模型下载渠道分析

## VRCT 模型架构

根据对 VRCT 的分析，它使用以下模型结构：

### 1. 语音识别（STT）
- **引擎**: faster-whisper
- **位置**: `C:\Users\churanneko\AppData\Local\VRCT\_internal\faster_whisper`
- **模型类型**: Whisper (tiny/base/small/medium/large-v3)
- **当前配置**: `base` 模型

### 2. 翻译模型
- **引擎**: CTranslate2
- **模型类型**: m2m100 / NLLB-200
- **当前配置**: `m2m100_418M-ct2-int8`

## 模型下载方式

### faster-whisper 模型

faster-whisper 使用 **HuggingFace Hub** 自动下载模型：

**下载源**:
- 官方源: `https://huggingface.co/Systran/faster-whisper-{model_size}`
- 镜像源: `https://hf-mirror.com/Systran/faster-whisper-{model_size}`

**模型列表**:
| 模型 | 大小 | 描述 |
|------|------|------|
| tiny | ~39MB | 最小模型，速度最快 |
| base | ~142MB | 推荐平衡模型 |
| small | ~483MB | 较好质量 |
| medium | ~1.5GB | 高质量 |
| large-v2 | ~3GB | 最高质量 |
| large-v3 | ~3GB | 最新最高质量 |
| large-v3-turbo | ~1.6GB | 优化版本，推荐 |

**默认缓存位置**:
```
Windows: C:\Users\{username}\.cache\huggingface\hub\
Linux:   ~/.cache/huggingface/hub/
macOS:   ~/Library/Caches/huggingface/hub/
```

### 模型下载代码示例

```python
from faster_whisper import WhisperModel

# 自动下载并缓存模型
model = WhisperModel("base", device="cpu", compute_type="int8")

# 指定模型路径（如果已下载）
model = WhisperModel("base", device="cpu", compute_type="int8", 
                     download_root="/path/to/models")
```

## 对 VRC-GoTrans 的建议

### 方案 1：使用 HuggingFace 自动下载（推荐）

**优点**:
- 简单，首次运行自动下载
- 利用已有的 HuggingFace 基础设施
- 支持镜像源（中国大陆友好）

**实现**:
```rust
// 在 Rust 中调用 Python faster-whisper
// 或使用 whisper-rs（纯 Rust 实现）
```

### 方案 2：共享 VRCT 的模型缓存

**优点**:
- 不需要重复下载
- 节省磁盘空间

**缺点**:
- 依赖 VRCT 安装
- 路径耦合
- 用户可能卸载 VRCT

**不推荐此方案**，因为 VRC-GoTrans 应该独立运行。

### 方案 3：预打包模型

**优点**:
- 即装即用
- 不需要网络

**缺点**:
- 安装包巨大（base 模型 ~150MB）
- 模型更新困难

**适用场景**:
- 离线环境
- 企业部署

## 推荐实现方案

### 混合方案：按需下载 + 可选预打包

**首次启动流程**:

```
启动 VRC-GoTrans
    ↓
检查本地是否有 Whisper 模型
    ↓
[无模型]
    ↓
显示模型下载向导
    ├── 选择模型大小（tiny/base/small）
    ├── 选择下载源（官方/镜像）
    └── 下载进度条
    ↓
模型下载完成
    ↓
开始使用
```

### 技术实现选项

#### 选项 A：使用 whisper.cpp（推荐）✅

**库**: https://github.com/ggerganov/whisper.cpp

**优点**:
- C++ 实现，性能极好
- 有 Rust 绑定 `whisper-rs`
- 模型格式：GGML（比 PyTorch 小）
- 无需 Python 运行时

**模型下载**:
```
https://huggingface.co/ggerganov/whisper.cpp/tree/main
```

**示例**:
```rust
use whisper_rs::{WhisperContext, FullParams};

let ctx = WhisperContext::new("models/ggml-base.bin")?;
let mut params = FullParams::new();
let result = ctx.full(params, &audio_data)?;
```

#### 选项 B：调用 Python faster-whisper

**优点**:
- 与 VRCT 相同的技术栈
- 质量有保证

**缺点**:
- 需要打包 Python 运行时
- 包体积较大

**实现**:
```rust
use std::process::Command;

Command::new("python")
    .arg("stt_worker.py")
    .arg("--audio")
    .arg(audio_path)
    .output()?;
```

## 模型下载渠道对比

| 渠道 | 速度 | 稳定性 | 国内访问 |
|------|------|--------|---------|
| HuggingFace 官方 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ |
| HF-Mirror 镜像 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| GitHub Release | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| 自建 CDN | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 实际 Whisper 模型大小（GGML 格式）

```
ggml-tiny.bin      ~75MB
ggml-base.bin      ~142MB
ggml-small.bin     ~466MB
ggml-medium.bin    ~1.5GB
ggml-large-v3.bin  ~3.1GB
```

## 建议的模型选择策略

| 用户需求 | 推荐模型 | 理由 |
|---------|---------|------|
| 快速测试 | tiny | 小巧快速 |
| 日常使用 | base | 平衡性能和质量 |
| 高质量需求 | small | 更好的识别率 |
| 专业用途 | medium/large | 最佳质量 |

## 下载进度显示

使用 `reqwest` + `indicatif` 实现下载进度条：

```rust
use reqwest::Client;
use indicatif::{ProgressBar, ProgressStyle};

async fn download_model(url: &str, path: &str) -> Result<()> {
    let client = Client::new();
    let res = client.get(url).send().await?;
    let total_size = res.content_length().unwrap();

    let pb = ProgressBar::new(total_size);
    pb.set_style(ProgressStyle::default_bar()
        .template("{msg}\n{spinner:.green} [{elapsed_precise}] [{wide_bar:.cyan/blue}] {bytes}/{total_bytes} ({eta})")?
        .progress_chars("#>-"));

    // 下载逻辑...
    
    Ok(())
}
```

## 总结

**最佳实现方案**：

1. **使用 whisper.cpp + Rust 绑定**
2. **首次启动时从 HuggingFace 下载模型**
3. **提供国内镜像源选项**
4. **默认使用 base 模型**
5. **显示下载进度条**

这样可以保持应用独立性，同时提供良好的用户体验。

---

**参考资源**:
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
- whisper-rs: https://github.com/tazz4843/whisper-rs
- HF-Mirror: https://hf-mirror.com/

# HY-MT1.5 翻译模型集成指南

## 模型下载

### 使用 HF-Mirror 镜像（国内推荐）

```bash
# 创建模型目录
mkdir -p models

# 下载 Q4 量化版本（1.13GB）- 推荐
curl -L -o "models/HY-MT1.5-1.8B-Q4_K_M.gguf" \
  "https://hf-mirror.com/tencent/HY-MT1.5-1.8B-GGUF/resolve/main/HY-MT1.5-1.8B-Q4_K_M.gguf"

# 或下载 Q6 版本（1.47GB）- 更高质量
curl -L -o "models/HY-MT1.5-1.8B-Q6_K.gguf" \
  "https://hf-mirror.com/tencent/HY-MT1.5-1.8B-GGUF/resolve/main/HY-MT1.5-1.8B-Q6_K.gguf"
```

### 使用官方 HuggingFace（国际）

```bash
curl -L -o "models/HY-MT1.5-1.8B-Q4_K_M.gguf" \
  "https://huggingface.co/tencent/HY-MT1.5-1.8B-GGUF/resolve/main/HY-MT1.5-1.8B-Q4_K_M.gguf"
```

## Rust 集成方案

### 方案 1：使用 llama-cpp-2 crate

**Cargo.toml**:
```toml
[dependencies]
llama-cpp-2 = "0.1"
```

**使用示例**:
```rust
use llama_cpp_2::context::params::LlamaContextParams;
use llama_cpp_2::llama_backend::LlamaBackend;
use llama_cpp_2::model::{LlamaModel, params::LlamaModelParams};

// 初始化后端
let backend = LlamaBackend::init()?;

// 加载模型
let model_params = LlamaModelParams::default();
let model = LlamaModel::load_from_file(
    &backend, 
    "models/HY-MT1.5-1.8B-Q4_K_M.gguf",
    &model_params
)?;

// 创建上下文
let ctx_params = LlamaContextParams::default()
    .with_n_ctx(2048);
let mut ctx = model.new_context(&backend, ctx_params)?;

// 翻译提示词
let prompt = "Translate this text to English: こんにちは、世界！";

// 生成翻译
let result = ctx.complete(prompt)?;
```

### 方案 2：使用 llama-cpp-rs

**Cargo.toml**:
```toml
[dependencies]
llama-cpp-rs = "0.4"
```

**使用示例**:
```rust
use llama_cpp_rs::{LlamaModel, LlamaParams};

let params = LlamaParams::default();
let model = LlamaModel::load_from_file(
    "models/HY-MT1.5-1.8B-Q4_K_M.gguf",
    params
)?;

let prompt = "Translate to English: こんにちは";
let output = model.generate(prompt, None)?;
```

### 方案 3：调用 llama.cpp 可执行文件

如果 Rust 绑定有问题，可以直接调用 llama.cpp 的命令行：

```rust
use std::process::Command;

pub fn translate(text: &str, target_lang: &str) -> Result<String, String> {
    let prompt = format!(
        "Translate this text to {}: {}",
        target_lang, text
    );

    let output = Command::new("llama-cli")
        .arg("-m")
        .arg("models/HY-MT1.5-1.8B-Q4_K_M.gguf")
        .arg("-p")
        .arg(&prompt)
        .arg("-n")
        .arg("256")
        .output()
        .map_err(|e| format!("Failed to run llama-cli: ", e))?;

    let result = String::from_utf8_lossy(&output.stdout);
    Ok(result.to_string())
}
```

## HY-MT1.5 使用提示词格式

根据模型文档，推荐的提示词格式：

```
Source Text: {source_text}
Target Language: {target_language}
Translation:
```

或者更简单：

```
Translate to {target_language}: {source_text}
```

**支持的语言**:
- 中文 (Chinese)
- 英文 (English)  
- 日文 (Japanese)
- 韩文 (Korean)
- 法文 (French)
- 德文 (German)
- 西班牙文 (Spanish)
- 俄文 (Russian)
- 阿拉伯文 (Arabic)
- 葡萄牙文 (Portuguese)
- 等 33 种语言...

## 下载验证

下载完成后验证文件：

```bash
# 检查文件大小
ls -lh models/HY-MT1.5-1.8B-Q4_K_M.gguf

# 应该显示约 1.13GB
# -rw-r--r-- 1 user user 1.1G Jul  7 11:00 HY-MT1.5-1.8B-Q4_K_M.gguf
```

## 性能优化建议

1. **首次加载**: 模型加载需要 2-5 秒
2. **推理速度**: Q4 版本在 CPU 上约 20-50 tokens/s
3. **内存占用**: 约 1.5-2GB RAM
4. **GPU 加速**: 如果有 CUDA，可以显著提升速度

## 集成到 VRC-GoTrans

翻译模块架构：

```
src-tauri/src/
├── translator.rs          # 翻译模块主文件
│   ├── init_translator()  # 初始化模型
│   ├── translate()        # 翻译文本
│   └── cleanup()          # 清理资源
└── lib.rs                 # 注册 Tauri 命令
```

---

**下一步**: 模型下载完成后，我们可以开始集成测试！

# llama.cpp CLI 工具下载和配置

## 快速下载

### Windows 用户（推荐）

1. **下载预编译版本**：
   - 访问：https://github.com/ggerganov/llama.cpp/releases
   - 下载最新的 `llama-{version}-bin-win-{arch}.zip`
   - 例如：`llama-b4360-bin-win-avx2-x64.zip`

2. **解压并放置**：
   ```bash
   # 解压到项目根目录
   cd D:\Projects\ChuranNeko\VRC-GoTrans
   
   # 将 llama-cli.exe 或 main.exe 复制到项目根目录
   # 或者放到 PATH 中
   ```

3. **重命名（如果需要）**：
   ```bash
   # 如果下载的是 main.exe
   mv main.exe llama-cli.exe
   ```

## 测试 llama.cpp

测试模型是否能正常工作：

```bash
cd D:\Projects\ChuranNeko\VRC-GoTrans

# 测试翻译
llama-cli.exe -m models/HY-MT1.5-1.8B-Q4_K_M.gguf -p "Translate to English: こんにちは" -n 128 --temp 0.1
```

预期输出应该包含类似：
```
Hello
```

## 项目结构

```
VRC-GoTrans/
├── models/
│   └── HY-MT1.5-1.8B-Q4_K_M.gguf  (1.1GB) ✅ 已下载
├── llama-cli.exe                   (需要下载)
├── src-tauri/
└── src/
```

## 可选：使用 Ollama

如果你已经安装了 Ollama，也可以用它来跑模型：

```bash
# 导入模型到 Ollama
ollama create hy-mt1.5 -f Modelfile

# Modelfile 内容：
# FROM models/HY-MT1.5-1.8B-Q4_K_M.gguf

# 测试
ollama run hy-mt1.5 "Translate to English: こんにちは"
```

然后修改代码调用 `ollama run` 而不是 `llama-cli`。

## 性能说明

**Q4 模型性能**：
- 首次加载：1-2 秒
- 单次翻译：0.5-2 秒（取决于 CPU）
- 内存占用：约 1.5-2GB

**推荐硬件**：
- CPU: 4 核以上
- RAM: 8GB 以上
- 磁盘: 2GB 可用空间

## 下一步

下载 `llama-cli.exe` 后，我们可以：
1. 测试翻译功能
2. 创建前端翻译界面
3. 集成到完整流程

---

**快速下载链接**：
- GitHub Releases: https://github.com/ggerganov/llama.cpp/releases
- 选择最新版本的 Windows 预编译包

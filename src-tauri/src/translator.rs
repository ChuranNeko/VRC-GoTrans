use std::process::Command;
use std::path::PathBuf;

/// 翻译器（调用 llama.cpp CLI）
pub struct Translator {
    model_path: Option<PathBuf>,
    llama_cli_path: Option<PathBuf>,
}

impl Translator {
    pub fn new() -> Self {
        Translator {
            model_path: None,
            llama_cli_path: None,
        }
    }

    /// 初始化翻译器
    pub fn init(&mut self, model_path: &str, llama_cli_path: &str) -> Result<(), String> {
        let model = PathBuf::from(model_path);
        let cli = PathBuf::from(llama_cli_path);

        if !model.exists() {
            return Err(format!("Model not found: {:?}", model));
        }

        if !cli.exists() {
            return Err(format!("llama.cpp CLI not found: {:?}", cli));
        }

        self.model_path = Some(model);
        self.llama_cli_path = Some(cli);

        Ok(())
    }

    /// 翻译文本
    pub fn translate(&self, text: &str, target_lang: &str) -> Result<String, String> {
        let model_path = self.model_path.as_ref()
            .ok_or("Translator not initialized")?;
        let cli_path = self.llama_cli_path.as_ref()
            .ok_or("Translator not initialized")?;

        // 构建提示词
        let prompt = format!("Translate to {}: {}", target_lang, text);

        // 调用 llama.cpp
        let output = Command::new(cli_path)
            .arg("-m")
            .arg(model_path)
            .arg("-p")
            .arg(&prompt)
            .arg("-n")
            .arg("256")
            .arg("--temp")
            .arg("0.1")
            .arg("--log-disable")
            .output()
            .map_err(|e| format!("Failed to run llama.cpp: {}", e))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(format!("llama.cpp failed: {}", stderr));
        }

        // 解析输出
        let result = String::from_utf8_lossy(&output.stdout);

        // 提取翻译结果（去掉提示词部分）
        let translation = result
            .lines()
            .filter(|line| !line.is_empty() && !line.starts_with("llama"))
            .collect::<Vec<_>>()
            .join("\n")
            .trim()
            .to_string();

        Ok(translation)
    }

    /// 检查是否已初始化
    pub fn is_initialized(&self) -> bool {
        self.model_path.is_some() && self.llama_cli_path.is_some()
    }
}

const LLAMA_CLI_EXE: &str = "llama-cli.exe";

fn exe_dir() -> Option<PathBuf> {
    std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|d| d.to_path_buf()))
}

fn find_first_existing(candidates: &[PathBuf]) -> Option<PathBuf> {
    candidates.iter().find(|p| p.exists()).cloned()
}

/// 在单个目录里找 .gguf 文件（按文件名排序，返回第一个）。
fn first_gguf_in(dir: &PathBuf) -> Option<PathBuf> {
    let mut files: Vec<PathBuf> = std::fs::read_dir(dir)
        .ok()?
        .flatten()
        .filter_map(|e| {
            let p = e.path();
            if p.extension().and_then(|x| x.to_str()) == Some("gguf") {
                Some(p)
            } else {
                None
            }
        })
        .collect();
    files.sort();
    files.into_iter().next()
}

/// 解析模型路径：override 优先 → 否则扫描候选目录里任意 .gguf。
pub fn resolve_model_path(override_path: Option<&str>) -> Result<PathBuf, String> {
    if let Some(p) = override_path {
        let pb = PathBuf::from(p);
        if pb.exists() {
            return Ok(pb);
        }
        return Err(format!("Configured model path does not exist: {}", p));
    }

    let dirs = crate::downloader::candidate_models_dirs();
    for d in &dirs {
        if d.is_dir() {
            if let Some(found) = first_gguf_in(d) {
                return Ok(found);
            }
        }
    }
    let looked = dirs
        .iter()
        .map(|p| format!("  - {}", p.display()))
        .collect::<Vec<_>>()
        .join("\n");
    Err(format!("No .gguf model found. Looked in:\n{}", looked))
}

/// 解析 llama.cpp CLI：override 优先 → 候选目录 → 系统 PATH。
pub fn resolve_llama_cli_path(override_path: Option<&str>) -> Result<PathBuf, String> {
    if let Some(p) = override_path {
        let pb = PathBuf::from(p);
        if pb.exists() {
            return Ok(pb);
        }
        return Err(format!("Configured llama-cli path does not exist: {}", p));
    }

    let mut candidates: Vec<PathBuf> = vec![
        PathBuf::from(LLAMA_CLI_EXE),
        PathBuf::from("..").join(LLAMA_CLI_EXE),
    ];
    if let Some(exe) = exe_dir() {
        candidates.push(exe.join(LLAMA_CLI_EXE));
        if let Some(parent) = exe.parent() {
            candidates.push(parent.join(LLAMA_CLI_EXE));
        }
    }
    if let Some(found) = find_first_existing(&candidates) {
        return Ok(found);
    }
    if let Ok(path) = which::which("llama-cli") {
        return Ok(path);
    }
    if let Ok(path) = which::which(LLAMA_CLI_EXE) {
        return Ok(path);
    }
    let looked = candidates
        .iter()
        .map(|p| format!("  - {}", p.display()))
        .collect::<Vec<_>>()
        .join("\n");
    Err(format!(
        "llama.cpp CLI not found. Looked in:\n{}\nPlease download from https://github.com/ggerganov/llama.cpp/releases",
        looked
    ))
}


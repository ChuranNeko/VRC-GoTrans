use std::path::PathBuf;
use std::time::{Duration, Instant};

use futures_util::StreamExt;
use reqwest::header::RANGE;
use reqwest::Client;
use serde::Serialize;
use tokio::io::AsyncWriteExt;

/// 下载进度（通过 Tauri Channel 推送到前端）。
#[derive(Clone, Serialize)]
pub struct DownloadProgress {
    pub downloaded: u64,
    pub total: u64,
}

/// 测速结果。
#[derive(Serialize)]
pub struct SpeedProbe {
    pub url: String,
    /// 每秒字节数；探测失败为 0。
    pub bytes_per_sec: u64,
    pub ok: bool,
}

/// 竞速结果（镜像 vs 源站）。
#[derive(Serialize)]
pub struct RaceResult {
    pub mirror: SpeedProbe,
    pub source: SpeedProbe,
    /// 推荐使用的 URL（速度更快且成功的那一个）。
    pub recommended: String,
}

fn exe_dir() -> Option<PathBuf> {
    std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|d| d.to_path_buf()))
}

/// 候选 models 目录（dev 的 CWD/models、../models，prod 的 exe/models、exe/../models）。
pub fn candidate_models_dirs() -> Vec<PathBuf> {
    let mut v: Vec<PathBuf> = vec![
        PathBuf::from("models"),
        PathBuf::from("..").join("models"),
    ];
    if let Some(exe) = exe_dir() {
        v.push(exe.join("models"));
        if let Some(parent) = exe.parent() {
            v.push(parent.join("models"));
        }
    }
    v.dedup();
    v
}

/// 选定 models 目录：优先已存在的，否则创建第一个可创建的。
pub fn models_dir_ensure() -> Result<PathBuf, String> {
    let candidates = candidate_models_dirs();
    for c in &candidates {
        if c.is_dir() {
            return Ok(c.clone());
        }
    }
    for c in &candidates {
        if std::fs::create_dir_all(c).is_ok() {
            return Ok(c.clone());
        }
    }
    Err("Could not find or create a models directory".to_string())
}

/// 列举候选目录里所有 .gguf 文件（去重）。
pub fn list_local_models() -> Vec<String> {
    let mut found: Vec<String> = Vec::new();
    for dir in candidate_models_dirs() {
        if let Ok(entries) = std::fs::read_dir(&dir) {
            for entry in entries.flatten() {
                let p = entry.path();
                if p.extension().and_then(|e| e.to_str()) == Some("gguf") {
                    if let Some(name) = p.file_name().and_then(|n| n.to_str()) {
                        if !found.iter().any(|s: &String| s == name) {
                            found.push(name.to_string());
                        }
                    }
                }
            }
        }
    }
    found.sort();
    found
}

/// 探测某 URL 的下载速度（抓取前 ~2MB 计时）。失败返回 ok=false。
async fn probe_speed(client: &Client, url: &str) -> SpeedProbe {
    const PROBE_BYTES: u64 = 2 * 1024 * 1024;
    let start = Instant::now();
    let res = client
        .get(url)
        .header(RANGE, format!("bytes=0-{}", PROBE_BYTES - 1))
        .timeout(Duration::from_secs(20))
        .send()
        .await;
    let res = match res {
        Ok(r) => r,
        Err(_) => {
            return SpeedProbe {
                url: url.to_string(),
                bytes_per_sec: 0,
                ok: false,
            }
        }
    };
    if !res.status().is_success() {
        return SpeedProbe {
            url: url.to_string(),
            bytes_per_sec: 0,
            ok: false,
        };
    }
    let bytes = match res.bytes().await {
        Ok(b) => b,
        Err(_) => {
            return SpeedProbe {
                url: url.to_string(),
                bytes_per_sec: 0,
                ok: false,
            }
        }
    };
    let elapsed = start.elapsed().as_secs_f64();
    let bps = if elapsed > 0.0 {
        (bytes.len() as f64 / elapsed) as u64
    } else {
        bytes.len() as u64
    };
    SpeedProbe {
        url: url.to_string(),
        bytes_per_sec: bps,
        ok: true,
    }
}

/// 竞速：镜像 vs 源站，返回各自速度与推荐 URL。
pub async fn race_sources(repo: &str, filename: &str) -> Result<RaceResult, String> {
    let mirror_url = format!("https://hf-mirror.com/{}/resolve/main/{}", repo, filename);
    let source_url = format!("https://huggingface.co/{}/resolve/main/{}", repo, filename);
    let client = Client::builder()
        .user_agent("VRC-GoTrans")
        .build()
        .map_err(|e| format!("Failed to build HTTP client: {}", e))?;
    let (mirror, source) = tokio::join!(
        probe_speed(&client, &mirror_url),
        probe_speed(&client, &source_url),
    );
    let recommended = if mirror.ok && (!source.ok || mirror.bytes_per_sec >= source.bytes_per_sec) {
        mirror_url
    } else {
        source_url
    };
    Ok(RaceResult {
        mirror,
        source,
        recommended,
    })
}

/// 下载模型到 models 目录，通过 Channel 推送进度。
pub async fn download_model(
    url: &str,
    dest_filename: &str,
    on_progress: &tauri::ipc::Channel<DownloadProgress>,
) -> Result<PathBuf, String> {
    let client = Client::builder()
        .user_agent("VRC-GoTrans")
        .build()
        .map_err(|e| format!("Failed to build HTTP client: {}", e))?;

    let resp = client
        .get(url)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    if !resp.status().is_success() {
        return Err(format!("HTTP {}", resp.status()));
    }
    let total = resp.content_length().unwrap_or(0);

    let dir = models_dir_ensure()?;
    let dest = dir.join(dest_filename);
    let mut file = tokio::fs::File::create(&dest)
        .await
        .map_err(|e| format!("Failed to create file {:?}: {}", dest, e))?;

    let mut stream = resp.bytes_stream();
    let mut downloaded: u64 = 0;
    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| format!("Stream error: {}", e))?;
        file.write_all(&chunk)
            .await
            .map_err(|e| format!("Write error: {}", e))?;
        downloaded += chunk.len() as u64;
        let _ = on_progress.send(DownloadProgress { downloaded, total });
    }
    file.flush().await.map_err(|e| format!("Flush error: {}", e))?;

    Ok(dest)
}

use std::path::PathBuf;
use std::process::Stdio;
use std::time::{Duration, Instant};

use serde::Deserialize;
use tauri::{AppHandle, Emitter};
use thiserror::Error;
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::{Child, Command};

const READY_PREFIX: &str = "VRCGOTRANS";
const HANDSHAKE_DEADLINE: Duration = Duration::from_secs(60);
const HEALTH_DEADLINE: Duration = Duration::from_secs(15);
const SHUTDOWN_GRACE: Duration = Duration::from_secs(3);

#[derive(Error, Debug)]
pub enum SidecarError {
    #[error("uv not found on PATH; please install uv (https://docs.astral.sh/uv/)")]
    UvNotFound,
    #[error("uv sync failed (exit code {0})")]
    SyncFailed(i32),
    #[error("sidecar exited before handshake")]
    ExitedBeforeHandshake,
    #[error("handshake line malformed: {0}")]
    BadHandshake(String),
    #[error("sidecar did not become healthy within {0:?}")]
    HealthTimeout(Duration),
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
}

#[derive(Deserialize)]
struct Handshake {
    ready: bool,
    port: u16,
}

pub struct SidecarHandle {
    pub base_url: String,
    child: Child,
}

impl SidecarHandle {
    pub async fn shutdown(&mut self) {
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(2))
            .build();
        if let Ok(client) = client {
            let _ = client
                .post(format!("{}/shutdown", self.base_url))
                .send()
                .await;
        }
        if tokio::time::timeout(SHUTDOWN_GRACE, self.child.wait())
            .await
            .is_err()
        {
            let _ = self.child.start_kill();
            let _ = self.child.wait().await;
        }
    }
}

pub fn src_python_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("..")
        .join("src-python")
}

pub fn find_uv() -> Option<PathBuf> {
    which::which("uv").ok()
}

pub async fn bootstrap_and_start(app: &AppHandle) -> Result<SidecarHandle, SidecarError> {
    let src_python = src_python_dir();
    run_uv_sync(app, &src_python).await?;
    let model_path = crate::config::load_config()
        .ok()
        .and_then(|c| c.model_path)
        .or_else(|| {
            crate::paths::default_model_path()
                .ok()
                .map(|p| p.to_string_lossy().to_string())
        });
    start_sidecar(app, &src_python, model_path.as_deref()).await
}

async fn run_uv_sync(app: &AppHandle, src_python: &PathBuf) -> Result<(), SidecarError> {
    let uv = find_uv().ok_or(SidecarError::UvNotFound)?;
    emit(app, "syncing python dependencies");
    let output = Command::new(&uv)
        .arg("sync")
        .current_dir(src_python)
        .output()
        .await?;
    if !output.status.success() {
        return Err(SidecarError::SyncFailed(
            output.status.code().unwrap_or(-1),
        ));
    }
    emit(app, "dependencies ready");
    Ok(())
}

async fn start_sidecar(
    app: &AppHandle,
    src_python: &PathBuf,
    model_path: Option<&str>,
) -> Result<SidecarHandle, SidecarError> {
    let uv = find_uv().ok_or(SidecarError::UvNotFound)?;
    emit(app, "starting sidecar");

    let mut cmd = Command::new(&uv);
    cmd.arg("run")
        .arg("python")
        .arg("-m")
        .arg("vrc_gotrans")
        .current_dir(src_python)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    if let Some(p) = model_path {
        cmd.env("VRCGOTRANS_MODEL_PATH", p);
        emit(app, &format!("using model: {}", p));
    }
    let mut child = cmd.spawn()?;

    let stdout = child.stdout.take().expect("stdout piped");
    let stderr = child.stderr.take().expect("stderr piped");
    tokio::spawn(async move {
        let mut reader = BufReader::new(stderr).lines();
        while let Ok(Some(line)) = reader.next_line().await {
            eprintln!("[sidecar] {}", line);
        }
    });

    let mut reader = BufReader::new(stdout).lines();
    let line = match tokio::time::timeout(HANDSHAKE_DEADLINE, reader.next_line()).await {
        Ok(Ok(Some(line))) => line,
        Ok(Ok(None)) | Err(_) => return Err(SidecarError::ExitedBeforeHandshake),
        Ok(Err(e)) => return Err(SidecarError::Io(e)),
    };

    let json_part = line
        .strip_prefix(READY_PREFIX)
        .ok_or_else(|| SidecarError::BadHandshake(line.clone()))?
        .trim();
    let hs: Handshake = serde_json::from_str(json_part)
        .map_err(|_| SidecarError::BadHandshake(line.clone()))?;

    let base_url = format!("http://127.0.0.1:{}", hs.port);
    emit(app, &format!("sidecar on {}", base_url));

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(3))
        .build()
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;
    let deadline = Instant::now() + HEALTH_DEADLINE;
    loop {
        if Instant::now() > deadline {
            return Err(SidecarError::HealthTimeout(HEALTH_DEADLINE));
        }
        match client.get(format!("{}/health", base_url)).send().await {
            Ok(r) if r.status().is_success() => break,
            _ => tokio::time::sleep(Duration::from_millis(300)).await,
        }
    }
    emit(app, "sidecar healthy");

    Ok(SidecarHandle { base_url, child })
}

fn emit(app: &AppHandle, msg: &str) {
    let _ = app.emit("sidecar://progress", msg);
}

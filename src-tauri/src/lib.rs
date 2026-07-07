mod config;
mod downloader;
mod osc;
mod paths;
mod sidecar;
mod translator;

use std::sync::Mutex;

use osc::OscManager;
use sidecar::SidecarHandle;
use tauri::{AppHandle, Emitter, Manager, State};
use translator::Translator;

struct SidecarState(Mutex<Option<SidecarHandle>>);

#[tauri::command]
fn load_config() -> Result<String, String> {
    let config = config::load_config()?;
    serde_json::to_string(&config)
        .map_err(|e| format!("Failed to serialize config: {}", e))
}

#[tauri::command]
fn save_config(config_json: String) -> Result<(), String> {
    let config: config::AppConfig = serde_json::from_str(&config_json)
        .map_err(|e| format!("Failed to parse config: {}", e))?;
    config::save_config(&config)
}

#[tauri::command]
async fn bootstrap_sidecar(
    app: AppHandle,
    state: State<'_, SidecarState>,
) -> Result<String, String> {
    let handle = sidecar::bootstrap_and_start(&app)
        .await
        .map_err(|e| e.to_string())?;
    let base_url = handle.base_url.clone();
    *state.0.lock().unwrap() = Some(handle);
    let _ = app.emit("sidecar://ready", &base_url);
    Ok(base_url)
}

#[tauri::command]
async fn translate_via_sidecar(
    state: State<'_, SidecarState>,
    text: String,
    target_lang: String,
) -> Result<String, String> {
    let base_url = {
        let guard = state.0.lock().unwrap();
        guard
            .as_ref()
            .map(|h| h.base_url.clone())
            .ok_or_else(|| "sidecar not started".to_string())?
    };
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(60))
        .build()
        .map_err(|e| e.to_string())?;
    let resp: serde_json::Value = client
        .post(format!("{}/translate", base_url))
        .json(&serde_json::json!({"text": text, "targetLang": target_lang}))
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json()
        .await
        .map_err(|e| e.to_string())?;
    if let Some(err) = resp.get("error") {
        return Err(err.to_string());
    }
    resp.get("translation")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
        .ok_or_else(|| "no translation in response".to_string())
}

#[tauri::command]
fn move_model_to_data_dir(src: String) -> Result<String, String> {
    let dest = paths::move_into_models_dir(&std::path::PathBuf::from(src))
        .map_err(|e| e.to_string())?;
    Ok(dest.to_string_lossy().to_string())
}

// 以下为旧命令（前端仍依赖，待迁移到 sidecar 后清理）

#[tauri::command]
fn init_translator(translator: State<Mutex<Translator>>) -> Result<(), String> {
    let cfg = config::load_config()?;
    let model_path = translator::resolve_model_path(cfg.model_path.as_deref())?;
    let cli_path = translator::resolve_llama_cli_path(cfg.llama_cli_path.as_deref())?;
    let mut trans = translator.lock().unwrap();
    trans.init(
        model_path.to_str().ok_or("Invalid model path")?,
        cli_path.to_str().ok_or("Invalid CLI path")?,
    )
}

#[tauri::command]
fn translate_text(
    translator: State<Mutex<Translator>>,
    text: String,
    target_lang: String,
) -> Result<String, String> {
    let trans = translator.lock().unwrap();
    trans.translate(&text, &target_lang)
}

#[tauri::command]
fn init_osc(osc_manager: State<OscManager>) -> Result<(), String> {
    osc_manager.init()
}

#[tauri::command]
fn send_chatbox(
    osc_manager: State<OscManager>,
    message: String,
    send_immediately: bool,
) -> Result<(), String> {
    osc_manager.send_message(&message, send_immediately)
}

#[tauri::command]
fn set_typing_indicator(osc_manager: State<OscManager>, typing: bool) -> Result<(), String> {
    osc_manager.set_typing(typing)
}

#[tauri::command]
fn list_local_models() -> Vec<String> {
    downloader::list_local_models()
}

#[tauri::command]
async fn race_model_sources(
    repo: String,
    filename: String,
) -> Result<downloader::RaceResult, String> {
    downloader::race_sources(&repo, &filename).await
}

#[tauri::command]
async fn download_model(
    url: String,
    filename: String,
    on_progress: tauri::ipc::Channel<downloader::DownloadProgress>,
) -> Result<String, String> {
    let path = downloader::download_model(&url, &filename, &on_progress).await?;
    Ok(path.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(OscManager::new())
        .manage(Mutex::new(Translator::new()))
        .manage(SidecarState(Mutex::new(None)))
        .setup(|app| {
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let state = app_handle.state::<SidecarState>();
                match sidecar::bootstrap_and_start(&app_handle).await {
                    Ok(handle) => {
                        let base = handle.base_url.clone();
                        *state.0.lock().unwrap() = Some(handle);
                        let _ = app_handle.emit("sidecar://ready", base);
                    }
                    Err(e) => {
                        eprintln!("[sidecar] bootstrap failed: {}", e);
                        let _ = app_handle.emit("sidecar://error", e.to_string());
                    }
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            load_config,
            save_config,
            bootstrap_sidecar,
            translate_via_sidecar,
            move_model_to_data_dir,
            init_translator,
            translate_text,
            init_osc,
            send_chatbox,
            set_typing_indicator,
            list_local_models,
            race_model_sources,
            download_model
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

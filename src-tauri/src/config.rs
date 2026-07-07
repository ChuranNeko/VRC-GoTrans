use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

/// 第三方翻译/语音服务的 API 密钥。全部可选，仅保存在本机配置文件中。
#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct ApiKeys {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub deepl: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub google: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub azure: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub baidu: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AppConfig {
    pub first_run_completed: bool,
    pub ui_language: String,
    pub translation_engine: String,
    pub translation_provider: Option<String>,
    pub stt_engine: String,
    pub stt_provider: Option<String>,
    pub osc_enabled: bool,
    pub osc_port: u16,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub api_keys: Option<ApiKeys>,
    /// 显式模型路径（覆盖自动扫描结果）。
    #[serde(skip_serializing_if = "Option::is_none")]
    pub model_path: Option<String>,
    /// 显式 llama.cpp CLI 路径（覆盖自动扫描结果）。
    #[serde(skip_serializing_if = "Option::is_none")]
    pub llama_cli_path: Option<String>,
}

impl Default for AppConfig {
    fn default() -> Self {
        AppConfig {
            first_run_completed: false,
            ui_language: "zh-Hans".to_string(),
            translation_engine: "online".to_string(),
            translation_provider: Some("google".to_string()),
            stt_engine: "local".to_string(),
            stt_provider: None,
            osc_enabled: true,
            osc_port: 9000,
            api_keys: None,
            model_path: None,
            llama_cli_path: None,
        }
    }
}

/// 获取配置文件路径（~/.vrc-gotrans/config.json）
pub fn get_config_path() -> Result<PathBuf, String> {
    crate::paths::config_path().map_err(|e| e.to_string())
}

/// 加载配置
pub fn load_config() -> Result<AppConfig, String> {
    let config_path = get_config_path()?;

    if !config_path.exists() {
        // 如果配置文件不存在，返回默认配置
        return Ok(AppConfig::default());
    }

    let content = fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read config file: {}", e))?;

    let config: AppConfig = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse config: {}", e))?;

    Ok(config)
}

/// 保存配置
pub fn save_config(config: &AppConfig) -> Result<(), String> {
    let config_path = get_config_path()?;

    let json = serde_json::to_string_pretty(config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;

    fs::write(&config_path, json)
        .map_err(|e| format!("Failed to write config file: {}", e))?;

    Ok(())
}

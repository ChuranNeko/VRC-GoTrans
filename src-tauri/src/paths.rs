use std::fs;
use std::path::PathBuf;

use thiserror::Error;

const DATA_DIR_NAME: &str = ".vrc-gotrans";
const DEFAULT_MODEL_FILE: &str = "HY-MT1.5-1.8B-Q4_K_M.gguf";

#[derive(Error, Debug)]
pub enum PathError {
    #[error("cannot determine home directory")]
    NoHome,
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
}

fn home() -> Result<PathBuf, PathError> {
    dirs::home_dir().ok_or(PathError::NoHome)
}

pub fn data_dir() -> Result<PathBuf, PathError> {
    let dir = home()?.join(DATA_DIR_NAME);
    fs::create_dir_all(&dir)?;
    Ok(dir)
}

pub fn config_path() -> Result<PathBuf, PathError> {
    Ok(data_dir()?.join("config.json"))
}

pub fn models_dir() -> Result<PathBuf, PathError> {
    let dir = data_dir()?.join("models");
    fs::create_dir_all(&dir)?;
    Ok(dir)
}

pub fn logs_dir() -> Result<PathBuf, PathError> {
    let dir = data_dir()?.join("logs");
    fs::create_dir_all(&dir)?;
    Ok(dir)
}

pub fn cache_dir() -> Result<PathBuf, PathError> {
    let dir = data_dir()?.join("cache");
    fs::create_dir_all(&dir)?;
    Ok(dir)
}

pub fn default_model_path() -> Result<PathBuf, PathError> {
    Ok(models_dir()?.join(DEFAULT_MODEL_FILE))
}

pub fn move_into_models_dir(src: &PathBuf) -> Result<PathBuf, PathError> {
    if !src.is_file() {
        return Err(PathError::Io(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            format!("source is not a file: {}", src.display()),
        )));
    }
    let filename = src.file_name().ok_or_else(|| {
        PathError::Io(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "invalid filename",
        ))
    })?;
    let dest_dir = models_dir()?;
    let dest = dest_dir.join(filename);
    if dest.exists() {
        fs::remove_file(&dest)?;
    }
    match fs::rename(src, &dest) {
        Ok(()) => Ok(dest),
        Err(_) => {
            fs::copy(src, &dest)?;
            fs::remove_file(src)?;
            Ok(dest)
        }
    }
}

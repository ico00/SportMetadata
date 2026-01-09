// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::PathBuf;
use tauri::{Manager, State};

struct AppState {
    data_dir: PathBuf,
}

fn get_data_dir(app: &tauri::AppHandle) -> PathBuf {
    app.path_resolver()
        .app_data_dir()
        .expect("Failed to get app data directory")
}

#[tauri::command]
fn read_file(path: String, state: State<AppState>) -> Result<String, String> {
    let file_path = state.data_dir.join(&path);
    if !file_path.exists() {
        return Ok("[]".to_string());
    }
    
    fs::read_to_string(&file_path)
        .map_err(|e| format!("Greška pri čitanju fajla: {}", e))
}

#[tauri::command]
fn write_file(path: String, contents: String, state: State<AppState>) -> Result<(), String> {
    let file_path = state.data_dir.join(&path);
    fs::write(&file_path, contents)
        .map_err(|e| format!("Greška pri pisanju fajla: {}", e))
}

#[tauri::command]
fn delete_file(path: String, state: State<AppState>) -> Result<(), String> {
    let file_path = state.data_dir.join(&path);
    if file_path.exists() {
        fs::remove_file(&file_path)
            .map_err(|e| format!("Greška pri brisanju fajla: {}", e))?;
    }
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let data_dir = get_data_dir(&app.handle());
            fs::create_dir_all(&data_dir).expect("Failed to create data directory");
            
            app.manage(AppState {
                data_dir,
            });
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![read_file, write_file, delete_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

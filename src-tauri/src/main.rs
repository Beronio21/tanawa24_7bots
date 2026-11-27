#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod lifeos;
mod tray;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            lifeos::load_lifeos_profile,
            lifeos::save_lifeos_profile,
            lifeos::get_lifeos_prompt_context,
        ])
        .setup(|app| {
            tray::setup(app.handle())?;
            if let Err(error) = lifeos::initialize(app.handle()) {
                eprintln!("Could not initialize Brand TELOS profile: {error}");
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                if let Err(error) = window.hide() {
                    eprintln!("Could not hide the main window to the system tray: {error}");
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running Tanawa 24/7 Bot");
}

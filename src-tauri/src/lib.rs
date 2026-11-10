//! X30 Live View as a desktop app: one window with the dashboard's static
//! build (`next build` exports to ../out when Tauri runs it). The streams
//! come straight from go2rtc over the network, so there is no Rust side to
//! speak of beyond the window.

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running X30 Live View");
}

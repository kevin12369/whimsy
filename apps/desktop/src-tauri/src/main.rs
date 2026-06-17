#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::net::SocketAddr;
use tauri::Manager;

mod api;
mod sandbox;
mod llm;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Spawn the axum HTTP server inside Tauri's async runtime (NOT tokio::spawn —
            // mixing runtimes is a Tauri 2.x anti-pattern).
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let app = axum::Router::new()
                    .route("/api/generate", axum::routing::post(api::generate))
                    .route("/api/status", axum::routing::get(api::status))
                    .route("/api/health", axum::routing::get(|| async { "ok" }));
                let addr = SocketAddr::from(([127, 0, 0, 1], 1421));
                let listener = match tokio::net::TcpListener::bind(addr).await {
                    Ok(l) => l,
                    Err(e) => {
                        eprintln!("[whimsy] failed to bind 127.0.0.1:1421: {e}");
                        return;
                    }
                };
                eprintln!("[whimsy] HTTP API on http://{addr}");
                let _ = handle; // keep alive; if needed for state later
                axum::serve(listener, app).await.ok();
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}

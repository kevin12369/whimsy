use axum::{extract::Json, http::StatusCode, response::IntoResponse};
use serde::{Deserialize, Serialize};
use crate::{llm, sandbox};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct GenerateReq {
    pub text: String,
    pub provider: Option<String>,
    pub base_url: Option<String>,
    pub model: Option<String>,
    pub api_key: Option<String>,
    pub timeout_ms: Option<u32>,
}

#[derive(Debug, Serialize)]
pub struct GenerateResp {
    pub config: serde_json::Value,
    pub raw: String,
}

#[derive(Debug, Serialize)]
pub struct ApiError { pub error: String }

impl IntoResponse for ApiError {
    fn into_response(self) -> axum::response::Response {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(self)).into_response()
    }
}

pub async fn generate(Json(req): Json<GenerateReq>) -> Result<Json<GenerateResp>, ApiError> {
    let provider = parse_provider(req.provider.as_deref().unwrap_or("ollama"))
        .map_err(|e| ApiError { error: e.to_string() })?;
    let base_url = req.base_url.clone().unwrap_or_else(|| default_base_url(&provider));
    let model = req.model.clone().unwrap_or_else(|| default_model(&provider));
    let timeout = req.timeout_ms.unwrap_or(120_000);

    let raw = match provider.as_str() {
        "ollama" => {
            let body = llm::build_ollama_body(&req.text, &model, timeout);
            llm::call_ollama(&base_url, &body, timeout).await
        }
        "openai-compatible" => {
            let body = llm::build_openai_body(&req.text, &model, req.api_key.as_deref(), timeout);
            llm::call_openai_compat(&base_url, &body, req.api_key.as_deref(), timeout).await
        }
        _ => unreachable!(),
    }.map_err(|e| ApiError { error: format!("LLM call failed: {}", e) })?;

    sandbox::validate(&raw, 200_000).map_err(|e| ApiError { error: format!("sandbox: {}", e) })?;
    let config = build_game_config(&raw).map_err(|e| ApiError { error: format!("parse: {}", e) })?;
    Ok(Json(GenerateResp { config, raw }))
}

#[derive(Debug, Serialize)]
pub struct StatusResp { pub ollama: bool, pub lm_studio: bool }

pub async fn status() -> Json<StatusResp> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(3))
        .build().unwrap();
    let ollama = client.get("http://localhost:11434/api/tags").send().await
        .map(|r| r.status().is_success()).unwrap_or(false);
    let lm_studio = client.get("http://localhost:1234/v1/models").send().await
        .map(|r| r.status().is_success()).unwrap_or(false);
    Json(StatusResp { ollama, lm_studio })
}

pub fn parse_provider(s: &str) -> anyhow::Result<String> {
    match s {
        "ollama" | "openai-compatible" => Ok(s.to_string()),
        other => anyhow::bail!("unknown provider: {}", other),
    }
}

pub fn default_base_url(provider: &str) -> String {
    match provider {
        "ollama" => "http://localhost:11434".to_string(),
        _ => "http://localhost:1234/v1".to_string(),
    }
}

pub fn default_model(provider: &str) -> String {
    match provider { "ollama" => "qwen2.5-coder:7b".to_string(), _ => "qwen2.5-coder-7b-instruct".to_string() }
}

pub fn clamp_num(min: f64, max: f64, fallback: f64, raw: f64) -> f64 {
    if !raw.is_finite() { return fallback; }
    raw.max(min).min(max)
}

pub fn build_game_config(raw: &str) -> anyhow::Result<serde_json::Value> {
    let parsed = sandbox::parse_json_config(raw)?;
    let valid = ["sideScroller","verticalShmup","twinStickBattler","tileMatch","sokoban"];
    let mut obj = parsed.as_object().cloned().unwrap_or_default();
    let t = obj.get("type").and_then(|v| v.as_str()).unwrap_or("");
    if !valid.contains(&t) {
        let i = (raw.len() % valid.len()) as usize;
        obj.insert("type".to_string(), serde_json::Value::String(valid[i].to_string()));
    }
    let m: std::collections::HashMap<&str, (f64, f64, f64)> = [
        ("playerSpeed", (50.0, 400.0, 220.0)),
        ("jumpVelocity", (200.0, 600.0, 460.0)),
        ("gravity", (400.0, 1200.0, 900.0)),
        ("enemyCount", (1.0, 15.0, 5.0)),
        ("enemySpeed", (50.0, 300.0, 200.0)),
        ("spawnIntervalMs", (500.0, 3000.0, 1400.0)),
        ("scrollSpeed", (1.0, 3.0, 1.5)),
        ("enemyFireRateMs", (0.0, 3000.0, 1500.0)),
        ("enemyRows", (1.0, 5.0, 3.0)),
        ("roomCount", (1.0, 8.0, 4.0)),
        ("enemiesPerRoom", (2.0, 10.0, 5.0)),
        ("enemyFireMs", (0.0, 3000.0, 1500.0)),
        ("boardSize", (6.0, 10.0, 8.0)),
        ("moves", (10.0, 50.0, 20.0)),
        ("targetScore", (500.0, 5000.0, 1500.0)),
        ("iceBlocks", (0.0, 10.0, 0.0)),
        ("gridSize", (5.0, 8.0, 6.0)),
        ("boxCount", (1.0, 8.0, 3.0)),
        ("lives", (1.0, 9.0, 3.0)),
    ].iter().copied().collect();
    for (k, (lo, hi, fb)) in &m {
        if let Some(v) = obj.get(*k).and_then(|x| x.as_f64()) {
            obj.insert(k.to_string(), serde_json::json!(clamp_num(*lo, *hi, *fb, v)));
        }
    }
    Ok(serde_json::Value::Object(obj))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_provider_ollama() {
        assert_eq!(parse_provider("ollama").unwrap(), "ollama");
    }
    #[test]
    fn parse_provider_rejects_unknown() {
        assert!(parse_provider("weird").is_err());
    }
    #[test]
    fn clamp_within_range() {
        assert_eq!(clamp_num(50.0, 200.0, 100.0, 150.0), 150.0);
    }
    #[test]
    fn clamp_below_min() { assert_eq!(clamp_num(50.0, 200.0, 100.0, 10.0), 50.0); }
    #[test]
    fn clamp_above_max() { assert_eq!(clamp_num(50.0, 200.0, 100.0, 999.0), 200.0); }
    #[test]
    fn roundtrip_deserialize_apps_shape() {
        // Match what the React frontend (App.tsx generateFromRust) actually sends.
        let body = serde_json::json!({
            "text": "space mario",
            "provider": "openai-compatible",
            "base_url": "http://localhost:1234/v1",
            "model": "qwen2.5-coder-7b-instruct",
            "api_key": null,
            "timeout_ms": 120000
        });
        let parsed: GenerateReq = serde_json::from_value(body.clone()).unwrap();
        assert_eq!(parsed.text, "space mario");
        assert_eq!(parsed.provider.as_deref(), Some("openai-compatible"));
    }
    #[test]
    fn build_game_config_falls_back_to_random_type() {
        let bad = serde_json::json!({"weird": 1});
        let cfg = build_game_config(&bad.to_string()).unwrap();
        let valid = ["sideScroller","verticalShmup","twinStickBattler","tileMatch","sokoban"];
        assert!(valid.contains(&cfg["type"].as_str().unwrap()));
    }
}

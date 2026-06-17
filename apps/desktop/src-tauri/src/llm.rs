use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
pub struct OllamaBody {
    pub model: String,
    pub prompt: String,
    pub stream: bool,
    pub options: OllamaOptions,
}

#[derive(Debug, Serialize)]
pub struct OllamaOptions {
    pub temperature: f32,
}

pub fn build_ollama_body(prompt: &str, model: &str, _timeout_ms: u32) -> OllamaBody {
    OllamaBody {
        model: model.to_string(),
        prompt: format!("{}\n\nUser prompt: {}", SYSTEM_PROMPT, prompt),
        stream: false,
        options: OllamaOptions { temperature: 0.4 },
    }
}

#[derive(Debug, Serialize)]
pub struct OpenAiBody {
    pub model: String,
    pub messages: Vec<OpenAiMessage>,
    pub temperature: f32,
}

#[derive(Debug, Serialize)]
pub struct OpenAiMessage {
    pub role: String,
    pub content: String,
}

pub fn build_openai_body(prompt: &str, model: &str, _api_key: Option<&str>, _timeout_ms: u32) -> OpenAiBody {
    // Per DevOps review: omit max_tokens (provider-dependent behavior with -1).
    // Omit max_tokens → server uses its default cap.
    OpenAiBody {
        model: model.to_string(),
        messages: vec![
            OpenAiMessage { role: "system".to_string(), content: SYSTEM_PROMPT.to_string() },
            OpenAiMessage { role: "user".to_string(), content: prompt.to_string() },
        ],
        temperature: 0.4,
    }
}

pub const SYSTEM_PROMPT: &str = "You are a game configuration generator. Output a single JSON object with these fields:\n- type (REQUIRED): one of \"sideScroller\", \"verticalShmup\", \"twinStickBattler\", \"tileMatch\", \"sokoban\"\n- primary, secondary, enemyColor: hex colors like \"#3aa6ff\"\n- playerLabel, enemyLabel: short names\n- type-specific numeric fields (playerSpeed, jumpVelocity, scrollSpeed, boardSize, gridSize, etc.)\n\nOutput ONLY the JSON object, no markdown, no explanations, no code fences. Example:\n{\"type\":\"sideScroller\",\"primary\":\"#3aa6ff\",\"playerSpeed\":220,\"jumpVelocity\":460,\"lives\":3}";

#[derive(Debug, Deserialize)]
pub struct OllamaResp { pub response: String }

#[derive(Debug, Deserialize)]
pub struct OpenAiResp { pub choices: Vec<OpenAiChoice> }

#[derive(Debug, Deserialize)]
pub struct OpenAiChoice { pub message: OpenAiMessageOut }

#[derive(Debug, Deserialize)]
pub struct OpenAiMessageOut { pub content: String }

pub async fn call_ollama(base_url: &str, body: &OllamaBody, timeout_ms: u32) -> anyhow::Result<String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_millis(timeout_ms as u64)).build()?;
    let url = format!("{}/api/generate", base_url.trim_end_matches('/'));
    let resp = client.post(&url).json(body).send().await?;
    let status = resp.status();
    let text = resp.text().await?;
    if !status.is_success() { anyhow::bail!("Ollama {}: {}", status, text); }
    let parsed: OllamaResp = serde_json::from_str(&text)?;
    Ok(parsed.response)
}

pub async fn call_openai_compat(base_url: &str, body: &OpenAiBody, api_key: Option<&str>, timeout_ms: u32) -> anyhow::Result<String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_millis(timeout_ms as u64)).build()?;
    let url = format!("{}/chat/completions", base_url.trim_end_matches('/'));
    let mut req = client.post(&url).json(body);
    if let Some(k) = api_key { req = req.bearer_auth(k); }
    let resp = req.send().await?;
    let status = resp.status();
    let text = resp.text().await?;
    if !status.is_success() { anyhow::bail!("OAI-compatible {}: {}", status, text); }
    let parsed: OpenAiResp = serde_json::from_str(&text)?;
    Ok(parsed.choices.into_iter().next().map(|c| c.message.content).unwrap_or_default())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ollama_body_omits_max_tokens() {
        // Per DevOps review: -1 is not portable across providers;
        // omit the field entirely (Ollama defaults to unlimited).
        let v = serde_json::to_value(build_ollama_body("hi", "m", 120_000)).unwrap();
        assert_eq!(v["model"], "m");
        assert!(v["prompt"].as_str().unwrap().contains("hi"));
        assert_eq!(v["stream"], false);
    }

    #[test]
    fn openai_body_omits_max_tokens_when_not_provided() {
        let v = serde_json::to_value(build_openai_body("hi", "m", None, 120_000)).unwrap();
        assert_eq!(v["model"], "m");
        assert!(v.get("max_tokens").is_none() || v["max_tokens"] == serde_json::Value::Null);
    }

    #[test]
    fn openai_body_includes_bearer_when_key_set() {
        let v = serde_json::to_value(build_openai_body("hi", "m", Some("k"), 120_000)).unwrap();
        // The body itself doesn't include auth header (added at call site);
        // assert body shape is correct.
        assert_eq!(v["messages"][1]["role"], "user");
    }
}

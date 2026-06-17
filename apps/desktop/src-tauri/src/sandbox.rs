use anyhow::{anyhow, Result};

const FORBIDDEN: &[&str] = &[
    "eval(", "new Function(", "document.cookie", "window.parent",
    "localStorage", "sessionStorage", "indexedDB",
    "fetch(", "XMLHttpRequest", "importScripts(",
    "navigator.serviceWorker", "postMessage(",
    "WebSocket(", "EventSource(", "new Worker(",
    "SharedWorker", "BroadcastChannel",
    "RTCPeerConnection", "RTCDataChannel", "getUserMedia",
    "sendBeacon", "navigator.clipboard", "window.open",
    "document.domain", "document.write", "top.location", "location.href",
    "Atomics.waitAsync", "OffscreenCanvas",
];

const ZW: &[char] = &['\u{200B}', '\u{200C}', '\u{200D}', '\u{FEFF}'];

fn normalized(s: &str) -> String {
    // NFKC then strip zero-width then decode simple \uXXXX and \xXX escapes.
    // Use plain str::replace (no regex) — these are literal substrings.
    let nfkc: String = s.nfkc().collect();
    let no_zw: String = nfkc.chars().filter(|c| !ZW.contains(c)).collect();
    let mut out = no_zw;
    // Decode \uXXXX (4 hex digits) — simple linear scan, no regex.
    loop {
        let Some(start) = out.find("\\u") else { break };
        if start + 6 > out.len() { break; }
        let hex = &out[start + 2..start + 6];
        if let Ok(cp) = u32::from_str_radix(hex, 16) {
            if let Some(ch) = char::from_u32(cp) {
                out = format!("{}{}{}", &out[..start], ch, &out[start + 6..]);
                continue;
            }
        }
        out = format!("{}{}", &out[..start + 2], &out[start + 2..]);
    }
    out
}

pub fn validate(code: &str, max_bytes: usize) -> Result<()> {
    if code.len() > max_bytes {
        return Err(anyhow!("output exceeds {} bytes (was {})", max_bytes, code.len()));
    }
    let norm = normalized(code);
    for pat in FORBIDDEN {
        if norm.contains(pat) {
            return Err(anyhow!("forbidden API in LLM output: {}", pat));
        }
    }
    Ok(())
}

pub fn parse_json_config(raw: &str) -> Result<serde_json::Value> {
    let m_start = raw.find('{');
    let m_end = raw.rfind('}');
    let body = match (m_start, m_end) {
        (Some(s), Some(e)) if e > s => &raw[s..=e],
        _ => return Err(anyhow!("no JSON object in LLM output")),
    };
    let parsed: serde_json::Value = serde_json::from_str(body)?;
    Ok(parsed)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn deny_eval() { assert!(validate("function x() { eval('1+1'); }", 1000).is_err()); }
    #[test]
    fn deny_new_function() { assert!(validate("new Function('return 1')", 1000).is_err()); }
    #[test]
    fn deny_fetch() { assert!(validate("fetch('http://x')", 1000).is_err()); }
    #[test]
    fn deny_websocket() { assert!(validate("new WebSocket('ws://x')", 1000).is_err()); }
    #[test]
    fn deny_localstorage() { assert!(validate("localStorage.setItem('k','v')", 1000).is_err()); }
    #[test]
    fn deny_postmessage() { assert!(validate("window.parent.postMessage('x', '*')", 1000).is_err()); }
    #[test]
    fn deny_window_open() { assert!(validate("window.open('http://x')", 1000).is_err()); }
    #[test]
    fn deny_atomics_waitasync() { assert!(validate("Atomics.waitAsync(ia, 0)", 1000).is_err()); }
    #[test]
    fn allow_safe_phaser() {
        assert!(validate("new Phaser.Game({parent: g, scene: {create() { this.add.rectangle(0,0,100,100) }}})", 1000).is_ok());
    }
    #[test]
    fn reject_over_200kb() {
        let big = "x".repeat(201_000);
        assert!(validate(&big, 200_000).is_err());
    }
    #[test]
    fn normalize_unicode_evasion() {
        let s = "\u{FF45}\u{FF56}\u{FF41}\u{FF4C}('x')";  // ｅｖａｌ('x')
        assert!(validate(s, 1000).is_err());
    }
    #[test]
    fn parse_json_strips_markdown_fence() {
        let raw = "```json\n{\"type\":\"sideScroller\"}\n```";
        let v = parse_json_config(raw).unwrap();
        assert_eq!(v["type"], "sideScroller");
    }
}

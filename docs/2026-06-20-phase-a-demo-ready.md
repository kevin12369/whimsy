# 2026-06-20: Phase A — Demo-Ready

## 6/6 gaps closed

| Gap | Files | Commit |
|---|---|---|
| P2-2 SettingsModal tsc | `apps/desktop/src/components/SettingsModal.tsx` | `5a49b24` |
| P1-6 friendly error UX | `apps/desktop/src/components/AIStudioPanel.tsx` | `7caf6fa` + `c1c9012` |
| P3-1 disabled Generate tooltip | `apps/desktop/src/components/InputForm.tsx` | `d1dcd59` |
| P3-2 stale "checking" escalation | `apps/desktop/src/components/LocalProviderCard.tsx` | `7ada85a` |
| P3-3 candidate card min-h | `apps/desktop/src/components/AIStudioPanel.tsx` | `49b3654` |
| P3-5 CJK fallback (Noto Sans CJK SC) | `apps/desktop/tailwind.config.js` + `apps/desktop/src/index.css` | `f9b40d2` + `a781263` |

## Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` (apps/desktop) | 0 errors |
| `npx vite build` | success, +2.17 KB JS / +0.22 KB CSS vs Linear-reshape baseline (290.17 KB / 21.68 KB) |
| Manual: hover disabled Generate in no-LLM state | tooltip explains Ollama + LM Studio |
| Manual: stop Rust backend (`taskkill /F /IM whimsy-desktop.exe` on Windows, `pkill -f whimsy-desktop` on Unix), wait 10s | "no response" warn appears |
| Manual: trigger 3-attempt LLM failure | Retry button appears (warn styling); permanent errors get danger styling + no retry |
| Manual: candidate cards uniform height | min-h-[88px] holds across varying description lengths |
| Linux machine with Noto CJK installed (Debian/Ubuntu `fonts-noto-cjk`, Fedora `google-noto-sans-cjk-fonts`, Arch `noto-fonts-cjk`) | CJK glyphs render via Noto Sans CJK SC |

## What is NOT covered (deferred to Phase B/C)

- P0-1 Ollama origin whitelist — security, production blocker.
- P0-2 token budget cap — DoS guard.
- P0-3 iframe sandbox — reviewed out of Phase A: `sandbox` attribute only valid on `<iframe>`, mount is `<div>`. Full fix would require refactoring GamePreview.tsx to mount inside an iframe (separate refactor, 1.5-2h).
- P1-1 delete v4 dead code — tech debt.
- P1-4 About-modal marketing sections still pre-Linear — visual debt.
- P1-5 save-as-template — product gap.
- P1-7 undo/redo — product gap.
- P3-4 aria-live on Linear-ified errors — already addressed in P1-6 (role=alert/status by kind).

## Next step

Run `pnpm tauri dev` and do the 5 manual checks above. If all 5 pass,
demo is shippable to 3-5 friends.

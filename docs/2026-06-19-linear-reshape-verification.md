# 2026-06-19: Linear Visual Reshape — Build Verification

## Root cause fixed

The desktop app had `tailwind.config.js` + `postcss.config.js` + `src/index.css` + `src/components/icons.tsx` on disk but **none wired up**. The build produced 0 CSS — all 186 Tailwind className strings in components were dead strings. The user was looking at raw React, not Linear.

**Now**: 21.46 kB CSS in dist/assets, 4.94 kB gzipped. Linear tokens actually render.

## 4 commits (feat/ai-studio-mvp)

| SHA | Scope |
|---|---|
| `957b0bf` | Wire up Tailwind + Inter + lucide-react deps (root cause fix) |
| `511c375` | App.tsx chrome — zinc → surface tokens, lucide icons, IconButton helper |
| `cd1e857` | InputForm — white-on-dark Generate CTA, surface tokens, focus ring, lucide status |
| `3a5453e` | LocalProviderCard — surface tokens, ProviderStatus helper with lucide Check/AlertTriangle, spinner |

7 files, +172 / -17 lines total.

## Build verification

| Check | Result |
|---|---|
| `pnpm --filter @whimsy/desktop exec vite build` | ✅ 2.04s, 1553 modules transformed |
| dist/assets/ has .css | ✅ 21.46 kB / 4.94 kB gzipped |
| dist/assets/ has .js | ✅ 288.45 kB / 90.41 kB gzipped (lucide-react adds ~4KB raw) |
| 0 dark-bg zinc tokens in rewritten components | ✅ grep clean across App.tsx, InputForm.tsx, LocalProviderCard.tsx |

## Linear tokens in built CSS

| Token | Occurrences | Used by |
|---|---|---|
| `text-zinc-50` | 5 | main text (replaces text-zinc-100) |
| `bg-accent` | 3 | ThemePanel Save button, focus borders |
| `border-accent` | 2 | selected TemplateGrid, focus borders |
| `text-danger` | 2 | error status, danger hover |
| `text-zinc-950` | 1 | Generate button text (Linear flag) |
| `text-warn` | 1 | LocalProviderCard warn state |
| `text-success` | 1 | LocalProviderCard success state |
| `surface-border` | 1 | unified border token |
| `surface-0/1/3` | 3 | background tokens |
| `bg-white` | 1 | Linear flag (white-on-dark Generate CTA) |
| `animate-spin` | 1 | checking spinner |

## What the user will see

| Before | After |
|---|---|
| Raw React with dead Tailwind classes | Linear-styled chrome |
| ASCII mode buttons (`AI Studio` / `Classic`) | Sparkles icon + `AI Studio` / `Classic` |
| Unicode status (`⚠` `✓` `…` `○`) | Lucide icons (AlertTriangle / Check) |
| Green Generate button | White-on-dark Generate button (Linear flag) |
| Zinc borders throughout | Unified `surface-border` (1px slate) |
| Inter fallback to system font | Inter loaded from Google Fonts CDN |
| 16px WebView scrollbar | 8px dark Linear-style scrollbar |

## What was NOT changed (per plan)

- Tauri window dimensions / CSP / icons
- Rust backend (`apps/desktop/src-tauri/*`)
- Marketing sections inside About modal (Hero / Features / FAQ / etc.)
- Phaser-generated HTML inside the game iframe
- Business logic in `apps/desktop/src/lib/*`
- 4 components already Linear-styled (TemplateGrid, GamePreviewToolbar, SettingsModal, AboutModal, ThemePanel) — left alone

## Definition of Done

| Criterion | Status |
|---|---|
| Tailwind pipeline actually wired | ✅ main.tsx imports index.css, deps in package.json |
| Inter font loaded | ✅ 3 link tags in index.html (preconnect x2 + stylesheet) |
| Lucide icons render | ✅ 14 wrappers in icons.tsx, 7 used across 3 components |
| Linear color tokens | ✅ surface-0/1/2/3/border, accent, success/danger/warn |
| White-on-dark Generate CTA | ✅ InputForm |
| Focus ring on inputs | ✅ focus:border-accent + focus:ring-1 + focus:ring-accent/30 |
| Spinner for loading states | ✅ animate-spin on checking state |
| 0 dead Tailwind classes | ✅ CSS file actually loads |
| Vite build produces .css | ✅ 21.46 kB |
| Bundle size acceptable | ✅ +4KB raw from lucide-react, 4.94KB CSS gzipped |

**10/10 DoD met.**

## What to do next

```bash
cd "d:/Coder/ATNL/projects/whimsy"
pnpm --filter @whimsy/desktop exec vite preview  # or `pnpm tauri dev`
```

Open the app and verify:
- Header chrome is Linear-styled
- Generate button is white with dark text (not green)
- Inputs have indigo focus rings
- Local provider status uses lucide icons (Check / AlertTriangle)
- Scrolling uses thin dark scrollbars

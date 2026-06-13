# 一念成游 · Whimsy

> **一句话生成一个可玩的、可分享的 2D 小游戏。/ One sentence to a playable 2D game.**

[![CI](https://github.com/kevin12369/whimsy/actions/workflows/ci.yml/badge.svg)](https://github.com/kevin12369/whimsy/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-164_passing-brightgreen)](#)
[![Deploy](https://img.shields.io/badge/deploy-live-brightgreen)](https://kevin12369.github.io/whimsy/)

---

## About this project

一念成游 · Whimsy 让你用一句中文描述脑海里的游戏画面,在 15 秒内拿到一个真的能玩的 Phaser 3 小游戏 HTML。15 套预制模板 0 成本兜底,LLM 输出经纵深防御沙盒校验后丢进 iframe。

See the **[portfolio page](https://kevin12369.github.io/whimsy/portfolio)** for screenshots, what it does, and how to run it locally.

- **Live demo**: [https://kevin12369.github.io/whimsy/](https://kevin12369.github.io/whimsy/) (preview only — needs your local LLM to actually run generation)
- **Source code**: [github.com/kevin12369/whimsy](https://github.com/kevin12369/whimsy)
- **Run locally**: [RUN-LOCALLY.md](https://github.com/kevin12369/whimsy/blob/main/docs/RUN-LOCALLY.md) — 5 steps, ~10 min

---

## 这个想法

你脑子里闪过一个游戏画面:"像超级马里奥那样,但主角是颗彗星,在太空里躲小行星"。**可惜你不会写代码,也没时间学 Phaser**——这个想法三分钟后就被忘了。

**让 AI 在 15 秒内给你一个真的能玩的小游戏**。你描述玩法,Whimsy 调 LLM 生成 HTML + Phaser 3 代码,经静态分析 + 沙盒校验后丢进 iframe,URL 一复制就能发给朋友。

> 不替你做游戏设计——**只帮你把脑子里的画面变成可玩的 demo,设计师/学习/分享的事还是你来做**。

---

## 这件事有意思在哪

**LLM 写完整可玩游戏是个硬需求,但 AI 之前没人认真做过**。市面上有"AI 代码助手"但都是通用补全——没人**专门**研究"怎么把 LLM 输出限制在一个能跑、安全、不超 200KB 的 HTML iframe 里"。

更细的:**纵深防御**让生成的内容既能跑又跑不坏用户——服务端做静态黑名单(拦截 `eval`/`fetch`/`localStorage` 等),Worker 设 CSP,iframe 用 `sandbox="allow-scripts"`(没有 `allow-same-origin`)。LLM 输出先在 Worker 端校验再下发,**永不直发**。

**自迭代状态机**让"生成的代码不工作"也能在 15 秒内自动修好——最多 2 轮重试,每轮把"哪里出错"塞回 prompt 让 LLM 改。如果还是不行,**模板兜底**直接给一份预制的同类游戏。

---

## 想要实现的样子

- 用户在表单填"我想玩什么游戏" → 15 秒后右侧 iframe 真在跑 Phaser 3
- 主题色/玩家/敌人标签可在生成前调整 → LLM prompt 跟着变
- 15 套预制模板(5 平台跳跃 + 5 射击 + 5 解谜),无 LLM 调用 0 成本兜底
- 一键分享:游戏 HTML 存 R2,给你一个 `/g/<id>` 短链
- 历史侧边栏:你生成过的所有游戏都在
- BYOK(自带 API 钥):Workers AI 免费额度用完了,接 DeepSeek/Gemini/Anthropic 自己的 key
- 伦理/成本护栏常驻顶部:"不替你做游戏设计,只帮你起 demo"

---

## 未来可能拓展成什么

- 多人协作:同一个游戏 id 可以多人玩(打分/排行)
- 多语言 prompt:中文 / 英文 / 日文 prompt 模板
- 移动端触屏支持:Phaser 触屏输入 + 摇杆
- 排行榜:R2 + D1 存每局最高分
- AI 教学模式:告诉用户"为什么这版比上一版好",加教育价值

---

## 技术栈

| 层级 | 选型 |
|------|------|
| 前端 | Next.js 14 (Pages Router, `output: 'export'`) |
| LLM(API) | Cloudflare Workers AI Llama 3.1 8B(默认,免费)/ DeepSeek / Gemini / Anthropic(BYOK) |
| LLM(本地) | Ollama 原生协议 + OpenAI 兼容协议(LM Studio / vLLM / llama.cpp) |
| 部署 | GitHub Pages(静态导出,`basePath: '/whimsy'`)|
| Prompt 模板 | 纯 TS 构建器(无 LLM 依赖),`buildPrompt` + 5 风格子 prompt |
| 沙盒 | 静态黑名单(11 个危险 API) + 体积校验(≤200 KB) + 提取 HTML + CSP |
| 重试 | 自迭代状态机,最多 2 轮,失败用模板兜底 |
| 模板 | 15 套预制 HTML 游戏,主题色注入 |

---

## To-do

- [x] 写 `packages/prompt`(纯 TS prompt 构建器)
- [x] 写 `packages/sandbox`(提取 HTML + 黑名单 + 体积校验 + iframe 协议)
- [x] 写 `packages/llm`(4 个 provider + 模型路由 + 错误分类)
- [x] 写 `packages/retry`(自迭代状态机,最多 2 轮)
- [x] 写 `packages/templates`(15 套预制游戏 + 主题注入 + cache key)
- [x] 写 `apps/web`(Next.js 14 + 表单 + iframe + 历史侧边栏 + 设置抽屉)
- [x] 写 GitHub Pages 部署工作流(`.github/workflows/pages.yml`)
- [x] 写 LLM_KILL_SWITCH 模板兜底
- [x] 写 README polish

---

## 欢迎词

开源 + 公开 portfolio。

如果你:

- 试用了,生成出来的游戏根本不能玩 → 提 issue,贴 prompt + 输出片段,我重写 sandbox 规则
- 5 套模板区分度不够(平台跳跃看着像射击) → 提 issue,带 "template" 标签,**重点讨论**
- 发现了沙盒漏过的危险 API → 提 issue,标 "sandbox",**优先修**
- 想加新模板(赛车 / 卡牌 / Roguelike)→ 提 PR,附 `Template` 实现
- 想加新 LLM provider(OpenAI / Mistral / Ollama)→ 提 PR
- 想加新 genre → 提 PR,附 genre 子 prompt
- 真人,想给作者说"加油" → 提 issue 带 "encouragement" 标签,我收

提交 issue:[github.com/kevin12369/whimsy/issues](https://github.com/kevin12369/whimsy/issues)
发邮件:491750329@qq.com

### 特别欢迎

- LLM 安全研究者(帮我看 11 个 API 黑名单够不够)
- 游戏设计师(帮我看 15 套模板的可玩性)
- TypeScript 包架构师(帮我看 pnpm workspace 拆分)
- 中文 NLP 研究者(中文游戏描述的 prompt 表达)

---

## 本地 LLM (Local LLM)

默认走 Cloudflare Workers AI 免费额度,但**Whimsy 也支持把生成路由到本机 LLM 服务**。这种用法下,prompt 不会离开你的机器,也不会消耗 Cloudflare 配额。适合:

- **零配额消耗** — 不吃 Workers AI 每天的免费 neuron 额度
- **隐私** — prompt 和游戏代码都只在本地流转
- **自定义模型** — 用你 fine-tune 过的 LoRA / 量化模型
- **重度/自动化** — 跑批、做 benchmark、自建 demo 站

> Web 部署在 GitHub Pages 上,LLM 调用直接走浏览器到本地 LLM 服务,不需要后端中转。

### 支持的本地 backend

| Backend | 默认 baseUrl | 协议 |
|---------|--------------|------|
| [Ollama](https://ollama.com) | `http://localhost:11434` | Ollama 原生 (`/api/generate`) |
| [LM Studio](https://lmstudio.ai) | `http://localhost:1234/v1` | OpenAI 兼容 |
| [vLLM](https://docs.vllm.ai) | `http://localhost:8000/v1` | OpenAI 兼容 |
| [llama.cpp server](https://github.com/ggerganov/llama.cpp) | `http://localhost:8080/v1` | OpenAI 兼容 |

### 快速启动

1. 装好本机 LLM 服务,任选其一:

   ```bash
   # Ollama
   curl -fsSL https://ollama.com/install.sh | sh
   ollama pull llama3.1:8b
   ollama serve    # 监听 http://localhost:11434

   # LM Studio
   # 从 lmstudio.ai 下载,搜索并下载模型,在 Developer 标签点 "Start Server"
   # (默认端口 1234)

   # vLLM
   pip install vllm
   python -m vllm.entrypoints.openai.api_server --model Qwen/Qwen2.5-Coder-7B-Instruct

   # llama.cpp
   ./server -m model.gguf --host 0.0.0.0 --port 8080
   ```

2. 打开 Whimsy Web → **Settings** → **Local LLM** 卡片:
   - 选 Provider(Ollama / OpenAI Compatible)
   - 选/填 Base URL(下拉里给了 4 个常用 preset,不够可以手填)
   - 填 Model 名(你本机装的模型,例如 `llama3.1:8b`)
   - 可选 API Key / Timeout(默认 30s,大型模型可调到 120s)
   - 点 **Test connection**,看到 "Connected" 即通

3. 主页右上角 toggle 切到 **Local**(按钮变绿),再点 Generate 就走本地 LLM。

### 推荐模型

这些 Whimsy 实际试过、生成 Phaser 3 游戏代码比较稳的:

- **`llama3.1:8b`** (Ollama) — 通用不错,约 5GB 内存
- **`qwen2.5-coder:7b`** (Ollama) — 代码生成最强,约 5GB 内存
- **`deepseek-coder-v2:16b`** (Ollama) — 最强但吃资源,约 10GB 内存
- **`qwen2.5-coder-7b-instruct`** (vLLM / LM Studio) — Ollama 之外的等价选择

不是硬性推荐 — Settings 里 Model 字段是自由文本,你装啥就用啥。

### 注意事项

- **本地不是免费** — 你烧的是 CPU/GPU 时间和电费,不是美元;但 Cloudflare 配额记 0
- **不走 Cloudflare neuron 计数** — KV quota 只增 `local: 1`,不消耗 4 个云端 provider 的额度
- **默认 30s 超时** — 小模型够,大模型(16B+) 建议调到 60-120s(Settings 里改)
- **沙盒照常生效** — 本地 LLM 生成的代码一样过 denylist + 200KB 体积 + iframe `sandbox="allow-scripts"`,**不会**因为"信任本地"就放行
- **baseUrl 仅限 http(s)** — `file://` / `ftp://` 会被 400 挡掉(SSRF 防护)

---

## 项目亮点

**做了什么**

- 5 个 pure-TS package(prompt/sandbox/llm/retry/templates)+ 1 个 app(web),pnpm workspace 管理
- 15 套预制 HTML 游戏模板(5 平台跳跃 + 5 射击 + 5 解谜),Phaser 3.70.0 CDN 固定,主题色注入
- 纵深防御沙盒:11 个危险 API 静态黑名单(`eval`/`fetch`/`localStorage`/`XMLHttpRequest`/`importScripts`/`window.parent`/`document.cookie` 等) + 200 KB 体积上限 + iframe `sandbox="allow-scripts"`(无 `allow-same-origin`)
- 自迭代状态机:LLM 输出失败 → 把错误塞回 prompt 让 LLM 改 → 最多 2 轮 → 失败用模板兜底
- LLM_KILL_SWITCH:env var `LLM_KILL_SWITCH=true` 跳过所有 LLM 调用,直接给模板,用于成本应急
- 4 个 LLM provider 抽象:Workers AI(默认,免费)/ DeepSeek / Gemini / Anthropic(BYOK)
- 2 个本地 LLM provider 抽象:Ollama 原生协议 + OpenAI 兼容协议(覆盖 LM Studio / vLLM / llama.cpp / LocalAI),配 baseUrl SSRF 防护 + 30s 可调超时
- GitHub Pages 静态部署:`next build` → `apps/web/out/` → 工作流自动发布

**怎么做到的**

- `packages/prompt` — 纯 TS prompt 构建器,`buildPrompt(input)` 输出 system + user prompt,无外部依赖
- `packages/llm` — `Provider` interface + 6 个实现(workers-ai/deepseek/gemini/anthropic + ollama + openai-compatible),`pickProvider(model, env, local?)` 路由
- `packages/sandbox` — `extractHtml`(剥离 markdown 围栏) + `staticAnalysis`(denylist) + `sizeCheck`(≤200 KB)
- `packages/retry` — `runWithRetry(stateMachine, maxRetries=2)`,失败时 `buildFixPrompt(error)` 塞回上游
- `packages/templates` — 5 平台跳跃 + 5 射击 + 5 解谜,`Template.render(theme)` 输出完整 HTML
- `apps/web` — Next.js 14(Pages Router, `output: 'export'`, `basePath: '/whimsy'`)→ GitHub Pages

**跑起来的数字**

- 164 测试通过(prompt 21 + sandbox 32 + llm 40 + retry 14 + templates 17 + web 30 + ...)
- TypeScript strict 干净,First Load JS ≤130 kB
- 5 风格 prompt 模板 × 15 预制游戏模板 × 6 LLM provider × 6 packages/apps

**本地开发**

```bash
pnpm install
pnpm dev            # = pnpm --filter @whimsy/web dev, http://localhost:3000
```

**测试**

```bash
pnpm test          # 164 tests across 6 packages
```

**部署(GitHub Pages)**

- 推送到 `main` 即自动部署,工作流在 `.github/workflows/pages.yml`
- 站点 URL:https://kevin12369.github.io/whimsy/
- 一次性配置:GitHub 仓库 Settings → Pages → Source = **GitHub Actions**
- 手动部署:`pnpm --filter @whimsy/web build` → 把 `apps/web/out/` 上传到任意静态主机

---

> 这项目代码已经写完 100%,60 个 task 全部 commit。是 5 个项目里第二个完整跑通到 deploy 的(第一个是嘴笨助手 Sry)。
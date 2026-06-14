# Whimsy · 一念成游

> 一句话描述,30 秒拿到 5 个能玩的 Phaser 3 变体,挑一个导出源码接着改。

English | **[简体中文](./README.zh-CN.md)**

[![CI](https://github.com/kevin12369/whimsy/actions/workflows/ci.yml/badge.svg)](https://github.com/kevin12369/whimsy/actions/workflows/ci.yml)
[![e2e](https://img.shields.io/badge/e2e-passing-brightgreen)](#嵌入到任何页面)
[![CodeQL](https://github.com/kevin12369/whimsy/actions/workflows/codeql.yml/badge.svg)](https://github.com/kevin12369/whimsy/actions/workflows/codeql.yml)
[![Tests](https://img.shields.io/badge/tests-X_passing-brightgreen)](#)
[![Deploy](https://img.shields.io/badge/deploy-live-brightgreen)](https://kevin12369.github.io/whimsy/)

<p align="center">
  <a href="https://kevin12369.github.io/whimsy/portfolio"><img src="docs/img/main.png" alt="Whimsy 演示截图" width="720"/></a>
</p>

30 秒演示在 [portfolio 页](https://kevin12369.github.io/whimsy/portfolio)。

---

## 这是什么

Whimsy 是给 Game Jam 用的起步工具。用一句话(中文或英文都行)描述你脑子里那个游戏画面,它给你 5 个能开能玩的 Phaser 3 变体,挑一个最像的,把 HTML 或源码导出去,自己接着改。

它不替你做游戏设计,不会帮你想机制、不会帮你调数值、也不会教你 Phaser。它只负责一件事:把那个画面在 30 秒内变成你能玩的 demo。

## 怎么用

到能玩的游戏,有两条路:

1. **用模板(不调 LLM,免费)**。15 套写好的 Phaser 3 游戏,5 个平台跳跃、5 个射击、5 个解谜。它们机制上不一样,`diversity.test.ts` 拿每套模板的 `render()` 输出算 hash 强制校验,所以不会出现"5 个平台跳跃都长得像马里奥"的情况。点哪套就跑哪套。
2. **生成(调 LLM,可选)**。描述一个游戏,Whimsy 调 LLM 出 Phaser 3 代码,输出过三道关:静态黑名单(11 个危险 API)、200 KB 体积上限、iframe `sandbox="allow-scripts"`(没有 `allow-same-origin`)。LLM 出的代码坏了,重试循环把错误塞回 prompt 让它改,最多改两轮;还是坏的就用模板兜底。最后你总能拿到一个能跑的。

LLM 可配。Cloudflare Workers AI(Llama 3.1 8B)是默认,有免费额度。也可以指到 DeepSeek / Gemini / Anthropic(BYOK),或本机启的服务(Ollama / LM Studio / vLLM / llama.cpp)。

## 跑起来看看

线上 demo 只是预览,真要从 prompt 生成游戏,得有个 LLM 在浏览器能访问到的地方,一般是你本机。

```bash
git clone https://github.com/kevin12369/whimsy
cd whimsy
pnpm install
pnpm dev          # http://localhost:3000
```

更详细的带截图说明在 [docs/RUN-LOCALLY.md](https://github.com/kevin12369/whimsy/blob/main/docs/RUN-LOCALLY.md),5 步,大约 10 分钟。

## 沙盒

LLM 的输出不会直接进你的页面,流程是这样:

| 层级 | 做什么 | 在哪 |
|---|---|---|
| 静态黑名单 | 11 个危险 API(`eval` / `Function` / `fetch` / `XMLHttpRequest` / `localStorage` / `sessionStorage` / `WebSocket` / `EventSource` / `importScripts` / `window.parent` / `document.cookie`),HTML 里出现任何一个就拒掉 | `packages/sandbox/` |
| 体积上限 | 超过 200 KB 就拒。控制 iframe 加载开销,也限制基于 payload 的滥用 | `packages/sandbox/` |
| `sandbox="allow-scripts"` | iframe 能跑脚本,但没有同源访问能力,宿主页面从 iframe 内够不到 | 嵌入脚本 + `/g/[id]` 页面 |
| CSP meta | `default-src 'none'`,白名单里只放 Phaser CDN,挡掉 LLM 想偷发的网络请求 | 嵌入脚本 + `/g/[id]` 页面 |

如果发现绕过的办法,提 `sandbox` 标签的 issue,这类最高优先级。修的时候会一起带上回归测试。

## 15 套模板

| 类型 | ID | 机制 |
|---|---|---|
| 平台跳跃 | `platformer-side-scroller-comet` | 横版滚屏 + 跳 + 3 条命 |
| 平台跳跃 | `platformer-vertical-climber` | 垂直向上 + 平台跳 + 掉下 GG |
| 平台跳跃 | `platformer-auto-runner` | 自动向右 + 点跳躲仙人掌 |
| 平台跳跃 | `platformer-single-screen-puzzle` | 单屏解谜平台 + 顶到门算赢 |
| 平台跳跃 | `platformer-double-jump-precision` | 双跳精度 + 20 秒 8 浮岛 |
| 射击 | `shooter-twin-stick-battler` | WASD 移 + 鼠标瞄 |
| 射击 | `shooter-vertical-shmup` | 纵向弹幕 + 自动射击 |
| 射击 | `shooter-bullet-hell` | 固定机位 + 放射子弹 |
| 射击 | `shooter-tower-defense` | 底部放塔 + 上方刷怪 |
| 射击 | `shooter-target-shooting-gallery` | 固定机位 + 30 秒 30 靶 |
| 解谜 | `puzzle-tile-match` | 同色连线消除 4x4 |
| 解谜 | `puzzle-sokoban` | 推箱子到目标点 |
| 解谜 | `puzzle-lights-out` | 点格翻转邻接 + 全灭赢 |
| 解谜 | `puzzle-number-link` | 同数字首尾连不交叉 |
| 解谜 | `puzzle-sliding-15` | 15 数字华容道 |

要加第 16 套,看 [CONTRIBUTING.md](./CONTRIBUTING.md)。契约就是一个 `Template` 对象;`diversity.test.ts` 会拒掉任何和已有模板字节级重复的 PR。

## 本地 LLM

把 LLM 指向本机服务,prompt 和生成的代码都不出你的机器。这是默认推荐的方式,Cloudflare 免费额度虽然够大但不是无限的,本机一个 7B 的代码模型跑 Game Jam 起步工具,完全够用。

| 后端 | 默认 baseUrl | 协议 |
|---|---|---|
| [Ollama](https://ollama.com) | `http://localhost:11434` | Ollama 原生 |
| [LM Studio](https://lmstudio.ai) | `http://localhost:1234/v1` | OpenAI 兼容 |
| [vLLM](https://docs.vllm.ai) | `http://localhost:8000/v1` | OpenAI 兼容 |
| [llama.cpp](https://github.com/ggerganov/llama.cpp) | `http://localhost:8080/v1` | OpenAI 兼容 |

启动步骤:

1. 启一个上面的服务。Ollama 的例子:
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ollama pull llama3.1:8b
   ollama serve
   ```
2. Whimsy 打开 Settings,选 Local LLM 卡片,选 provider、填 baseUrl、填模型名,点 Test connection。
3. 主页右上角 toggle 切到 Local,再点 Generate。

我自己试过、能稳定出 Phaser 3 的模型:

- `llama3.1:8b`(Ollama),约 5GB 内存,通用
- `qwen2.5-coder:7b`(Ollama),约 5GB 内存,这个尺寸下代码生成最强
- `deepseek-coder-v2:16b`(Ollama),约 10GB 内存,综合最强,得有硬件

Model 字段是自由文本,有自己 fine-tune 的或量化的模型直接填。

注意:

- "本地"不是免费,烧 CPU/GPU 时间和电。只是 Cloudflare 那边记 0。
- 默认 30 秒超时。16B+ 的模型在 Settings 里调到 60-120 秒。
- 本地 LLM 出的代码,沙盒照常走。"因为是我自己的就信"这种话代码不认识。
- `baseUrl` 只允许 `http://` 和 `https://`,`file://` 和 `ftp://` 直接 400(SSRF 防护)。

## 嵌入到任何页面

把任意模板嵌到博客、Notion 页、个人主页、或者另一个 README 里,两行:

```html
<script src="https://kevin12369.github.io/whimsy/whimsy-embed.js"
        integrity="sha384-kqeOzlUXu5dbiku5kz1cVUcZ9LU1CWy2W+tE4+AgnpWhZ3R29c6ravr8xDsQgf8k"
        crossorigin="anonymous"
        defer></script>
<div data-whimsy-template="platformer-side-scroller-comet"
     data-whimsy-theme="#22d3ee"
     data-whimsy-height="600"
     style="width:100%"></div>
```

| 属性 | 必填 | 说明 |
|---|---|---|
| `data-whimsy-template` | 是 | 模板 id,小写连字符 |
| `data-whimsy-theme` | 否 | 16 进制主题色,覆盖模板默认色 |
| `data-whimsy-height` | 否 | iframe 高度 px,默认 600,范围 120-1600 |

脚本会把每个 `<div data-whimsy-template="...">` 替换成指向 `/embed/<id>/` 的 `<iframe>`。iframe 是 `sandbox="allow-scripts"`,输出的 HTML 走和主应用一样的黑名单、体积上限、CSP。脚本本身不用 `eval` / `new Function`,也不加载远程脚本。

P2 状态(2026-06-14):嵌入脚本、README 段、以及一个 4 用例的 vitest(`apps/web/tests/embed.test.tsx`,覆盖页面 shape / CSP 包装 / XSS 逃逸 / 脚本安全性)已交付。`/embed/<id>` 路由现在跑一个 CSP 强化的占位 Phaser 页面。完整的 server-side fetch(根据 id 找模板、套主题色、复用沙盒管道)留到 P3。

## 技术栈

| 层级 | 选型 |
|---|---|
| 前端 | Next.js 14 Pages Router,`output: 'export'`,basePath `/whimsy` |
| 云 LLM | Cloudflare Workers AI Llama 3.1 8B(默认,免费)/ DeepSeek / Gemini / Anthropic(BYOK) |
| 本地 LLM | Ollama 原生 + OpenAI 兼容(LM Studio / vLLM / llama.cpp) |
| 沙盒 | 11 API 静态黑名单 + 200 KB 体积上限 + CSP meta + iframe `sandbox="allow-scripts"` |
| 重试 | 自迭代状态机,最多 2 轮,最后失败用模板兜底 |
| 部署 | GitHub Pages 静态导出,工作流在 `.github/workflows/pages.yml` |
| 测试 | vitest(6 包共 222 用例)+ Playwright e2e(只在 CI 跑)+ CodeQL |

5 个纯 TS 包(`prompt` / `sandbox` / `llm` / `retry` / `templates`)+ 1 个 app(`web`),pnpm workspace。

## 本地开发

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm test           # 222 tests
pnpm --filter @whimsy/web build
```

部署:推 `main` 就自动发到 GitHub Pages,站点 `https://kevin12369.github.io/whimsy/`。要发到别的地方,`pnpm --filter @whimsy/web build` 之后把 `apps/web/out/` 上传到任意静态主机就行。

## 提 issue 的时候,这些最有用

- **生成的游戏跑不起来 / 操作坏了 / 崩溃了**:开 bug,贴 prompt 和输出前 30 行。这种最具体最好修。
- **几套模板玩起来太像**:`template` 标签,带上模板 id。多样性测试是底线不是天花板。
- **沙盒被绕过**:`sandbox` 标签,给最小复现。这种最先修。
- **想加模板 / provider / 流派**:看 [CONTRIBUTING.md](./CONTRIBUTING.md),欢迎 PR。
- **想给作者说"加油"**:`encouragement` 标签就是为了这个设的,每个 sprint 末尾会读。

仓库:github.com/kevin12369/whimsy
邮箱:491750329@qq.com

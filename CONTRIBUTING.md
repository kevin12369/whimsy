# Contributing to Whimsy — 一念成游

Thanks for opening this file. Whimsy is intentionally small: 5 packages, 1 web app, 15 pre-baked Phaser 3 templates. The fastest way to land a change is to fit it inside one of the patterns below.

> 第一次贡献?挑一个标 `good first issue` 的 issue,先在评论区认领,再开工。

## 仓库布局

```
.
├── apps/web            Next.js 14 (Pages Router, output: 'export', basePath: '/whimsy')
│   ├── pages/          /, /g/[id], /portfolio, /embed/[id]
│   ├── components/     GamePreview, TemplateGrid, InputForm, ...
│   ├── lib/            theme, share, export, llm-direct
│   ├── data/           sample prompts
│   ├── tests/          vitest, jsdom
│   └── e2e/            Playwright (runs in CI only)
├── packages
│   ├── prompt          pure-TS prompt builder
│   ├── sandbox         extractHtml + denylist + size cap
│   ├── llm             4 cloud + 2 local providers
│   ├── retry           self-iterating state machine
│   └── templates       15 HTML games, theme injection
└── .github/workflows   ci, pages, codeql
```

## 怎么提 issue

- 沙盒漏过危险 API → 用 `sandbox.yml`,标 `security / priority`,**优先修**
- 5 套模板区分度不够 → 用 `template.yml`,**重点讨论**
- 试用后不能玩 → 用 `bug.yml`,附 prompt + 输出片段
- 想加新风格 / 新 provider / 新场景 → 用 `feature.yml`
- 真人想给作者说"加油" → 用 `encouragement.yml`

## 怎么加新模板(15 → 16)

模板是 Whimsy 的核心。每套模板是一个**完整的 HTML 字符串**,由 `Template.render(theme)` 产出,在 `apps/web` 的 iframe 里直接运行。

1. 在 `packages/templates/src/<genre>/<kit>.ts` 新建文件,导出 `Template` 对象:

   ```ts
   import type { Template } from '../types';

   export const myKit: Template = {
     id: 'genre-my-kit',                  // 全局唯一,小写连字符
     name: 'My Kit',
     genre: 'platformer',                 // 'platformer' | 'shooter' | 'puzzle' (新 genre 先提 issue)
     defaultTheme: {
       primary: '#22d3ee',
       secondary: '#0ea5e9',
       flavorText: '一句话描述这个 kit 怎么玩',
     },
     render(theme) {
       // 返回完整 HTML 字符串,主题色通过占位符注入
       return `<!DOCTYPE html><html>...<style>:root{--primary:${theme.primary}}</style>...`;
     },
   };
   ```

2. 在 `packages/templates/src/<genre>/index.ts` 注册:

   ```ts
   import { myKit } from './my-kit';
   export const PLATFORMERS = [sideScrollerComet, /* ... */, myKit];
   ```

3. 跑 `pnpm --filter @whimsy/templates test` 确认 `diversity.test.ts` 仍然能区分 16 套模板(每套 `render()` 输出 hash 必须两两不同)。

4. 跑 `pnpm -r test`,确认没有破坏 `TemplateGrid`、`InputForm`、`sample-prompts` 现有断言。

5. 在 `README.md` 的"15 套预制模板"表格追加一行;在 `apps/web/data/sample-prompts.ts` 加 1 条 sample prompt。

**注意**:
- 不要修改 `packages/sandbox/src/static-analysis.ts` 的 denylist(那属于 sandbox 修复,独立 PR)
- 不要修改 `id` 字段(链接里出现的 id 一旦发布就不能再改,只能新增)
- Phaser 3 版本锁死 3.70.0 CDN:`https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js`

## 怎么加新 LLM provider

所有 provider 实现 `Provider` interface,定义在 `packages/llm/src/types.ts`。

1. 在 `packages/llm/src/<your-provider>.ts` 实现 4 个方法:`generate(prompt, opts)`, `modelId()`, `costClass()`, `description()`。
2. 在 `packages/llm/src/index.ts` 的 `PROVIDERS` 数组注册。
3. 在 `apps/web/components/SettingsModal.tsx` 的 provider 下拉加一项。
4. 单元测试在 `packages/llm/tests/<your-provider>.test.ts`,至少 4 个 case:成功 / 401 / 429 / network timeout。
5. 跑 `pnpm -r test` + `pnpm -r exec tsc --noEmit`。

## 怎么提 PR

1. Fork → 新分支(从 `main` 切)
2. 小步提交,每条 commit 一件事
3. **先跑** `pnpm -r test && pnpm -r exec tsc --noEmit && pnpm --filter @whimsy/web build`,全绿再推
4. 推上去后,GitHub Actions 会自动跑 ci(lockfile + typecheck + vitest)+ codeql + e2e (Playwright)
5. 用 PR 模板,勾选 checklist
6. **不要** force-push 已被 review 的分支

## 编码约定

- TypeScript strict(见 `tsconfig.base.json`)
- 不引入新依赖除非必要(Dependabot 周更)
- 测试用 vitest + jsdom,e2e 用 Playwright(只在 CI 跑)
- 字符串保持 JSON-safe(无 smart quotes / em dash / ellipsis)
- 公共 API 必须有单元测试
- 不写 `any`,优先用 `unknown` + type guard

## 不接受

- 改写沙盒 denylist 的"放松" PR(那是 attack surface)
- 改 `Template.id`(破坏分享链接)
- 在 `apps/web` 加 Tailwind 之外的 CSS 方案
- 改 `output: 'export'` 为 SSR(部署靠静态导出,部署到 GitHub Pages)
- 在 README 加 emoji

## 安全

发现 sandbox 漏过 → `sandbox` label,**优先修**,会公开致谢。

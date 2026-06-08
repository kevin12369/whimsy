# 一念成游 · Whimsy

> **一句话出 2D 小游戏 / One sentence → a playable 2D game**

*🚧 这是一个简历 demo 项目,代码待写 — 等我下次有空慢慢干。This is a resume demo, code TBD.*

---

## 我为什么做这个 / Why this exists

中文(我自己说的):

说出来挺不好意思的——我做这个是因为我**想玩"超级马里奥但是太空版"**,但没人给我做。我甚至不会用 Unity。

所以我想:要是 AI 听到"超级马里奥但是太空版"这句废话,能直接给我一个能玩的版本,那多爽。

不是研究,不是炫技。就是**一个普通人想玩游戏**。这个项目就是这样诞生的。

English (the same thing in fewer words):

Sometimes you just want to play "Mario but in space" and nobody will make it for you.
This project makes the LLM do it for you. That's the whole pitch.

---

## 它应该长什么样 / What it should do

你打开网页,输入:

> "超级马里奥但是太空版"

15 秒后,你在浏览器里玩到一关太空平台跳跃。

不用安装,不用账号,不用等审核。点开就跑。

---

## 技术上会怎么搞 / How it works (planned)

- **前端**: Next.js 14 + Phaser.js(游戏引擎)
- **后端**: Cloudflare Workers(LLM 编排)
- **LLM**: 默认 Workers AI(免费),推荐 DeepSeek-Coder V2(便宜又聪明)
- **沙箱**: iframe `sandbox="allow-scripts"`(不允许同源,防止逃逸)
- **模板库**: 5 套预生成 Phaser 模板(平台跳跃/射击/拼图/Snake/2048),命中就省一次 LLM 调用
- **自迭代**: 生成代码 → 沙箱跑 → 报错?→ 喂给 LLM 重试(最多 2 次)
- **历史**: 每次生成存 R2,有个 `/g/<id>` 短链分享

---

## 有什么挑战 / What'll be hard

老实说:

1. **LLM 生成的代码经常跑不通**。 "几乎对" 是最大的敌人。Plan 里的思路是沙箱里跑,挂了报错喂回去重写。我赌 RHF + 自迭代能把首跑成功率拉到 80%+。
2. **沙箱逃逸是真实的威胁**。`eval`、`Function()` 都能搞事。Plan 里写了"纵深防御":静态分析 + CSP + iframe sandbox 三层。够不够我也不知道。
3. **成本**。Sonnet 跑 100 个游戏生成就是 30 美元。所以**默认 Workers AI 几乎免费,BYOK 升级**。还加了一个 5 套模板缓存,目标 70% 走缓存 = $0。

---

## 为什么用 Cloudflare Workers(而不是 AWS Lambda / Vercel)

$0,边缘冷启动 0ms,Workers AI 不限量(免费层 10k neurons/天),KV/R2/D1 全套免费。
AWS Lambda 免费层 100 万次/月听着很多,但实际跑 LLM 流量用得很快,第二天就欠费了。
Vercel 也行,但 Cloudflare + Next.js 静态导出的组合,工程上更省事。

而且我**真的**想做到 $0 自付硬墙——失业 22 个月,每次开 AWS console 都心慌。

---

## 我从这项目想展示什么 / What's the resume angle

- **LLM 工程**: 自迭代回路 + 沙箱防御 + 缓存策略
- **全栈能力**: Next.js + Workers + R2 + D1 + Workers AI
- **成本意识**: $0 硬墙,BYOK 升级,缓存兜底
- **工程权衡**: 知道什么时候不用 Sonnet(用 DeepSeek),什么时候用模板

---

## 进度 / Status

- ✅ 设计文档:[docs/design/2026-06-07-ai-2d-game-gen-design.md](../docs/design/2026-06-07-ai-2d-game-gen-design.md)
- ✅ 实施计划:[docs/plans/2026-06-07-whimsy-2d-game-gen-plan.md](../docs/plans/2026-06-07-whimsy-2d-game-gen-plan.md)
- ✅ 计划:60 个 task,估时 1-2 周
- ⏳ 代码:还没动
- ⏳ Live URL:等代码 + deploy

---

## 实施完会写什么 / Future dev notes

跑完 deploy 后,这里会加:
- Live URL
- 几张 demo 截图
- "我学到了什么"复盘(尤其是沙箱逃逸那部分到底踩没踩坑)
- 性能数字(成功率、平均生成时间、缓存命中率)

---

*P.S. 如果你试用了发现生成的是垃圾,那大概率是 LLM 抽风了不是我的锅。点"重试"或者换 BYOK 用 Claude 试试,通常能救回来。*

# 一念成游 · Whimsy

> **说一句话,出 2D 小游戏。/ Say a sentence, get a 2D game.**

---

## 这个想法

你脑子里有个游戏画面——"超级马里奥但是太空版"——但你**不会写代码**。你想玩,但没人给你做。

**LLM 听到这句话,15 秒后给你一个能在浏览器里玩的版本**。

不是专业游戏开发。不是 Unity 教程。不是 LLM 聊天框。**就是从"想玩游戏"到"玩上"的一句话**。

## 这件事有意思在哪

**降低"做游戏"的门槛到 0**。

Replit Agent / v0 演示里已经看到 LLM 能写代码——但**集成成"普通用户能玩"的端到端产品**,是个独立的工程问题:从 prompt 构造、代码生成、错误自迭代、到沙箱防御。

这件事有意思是因为**它把"创造"和"消费"的边界模糊了**——以前只有程序员能创造游戏,现在任何有想法的人都能创造。这不是技术炫技,是**创作平权**。

具体有意思的点:
- LLM 写的代码会"几乎对"但不完美——自迭代回路是核心工程
- 沙箱逃逸是真实威胁——防御有讲究
- "用 AI 做游戏"这个市场——目前竞争是 Replit / v0 / Bolt,差异化是"普通用户友好"

## 想要实现的样子

- 输入:"超级马里奥但是太空版"
- 15 秒后,浏览器里能玩一关太空平台跳跃
- 不用安装,不用账号,不用注册
- 玩完了能改主题重新生成("换个中国风的""换个赛博朋克的")
- 生成的代码链接可以分享给别人直接玩(`/g/<id>` 短链)

技术细节:LLM 输出单文件 Phaser HTML,沙箱里跑,挂了自动重试,缓存预生成模板兜底。

## 未来可能拓展成什么

- **多模态输入**:除了文字,还能传一张手绘草图,LLM 识别后生成对应游戏
- **多关卡叙事**:从单关 → 3-5 关剧情,每关一个迷你游戏
- **教育变体**:输入物理概念(自由落体 / 抛物线),出个"玩这个概念"的小游戏
- **A/B 编辑器**:玩家跑完一关能直接改关卡参数(重力/速度/敌人数量)看变化
- **市场**:玩家互相买卖自创关卡

## 技术栈

- **前端**: Next.js 14(App Router, `output: 'export'`)
- **游戏**: Phaser 3(CDN 引入)
- **LLM**: Workers AI Llama 3.1 8B(默认,免费)/ DeepSeek-Coder V2(几乎免费)/ Claude Sonnet(BYOK)
- **后端**: Cloudflare Workers + D1 + R2 + KV
- **沙箱**: iframe `sandbox="allow-scripts"`(无 `allow-same-origin`)
- **缓存**: 5 套预生成 Phaser 模板(平台跳跃/射击/拼图/Snake/2048)兜底
- **部署**: Cloudflare Pages(前端)+ Cloudflare Workers(后端)

## To-do

- [ ] 写 Next.js 前端(input form + iframe 预览)
- [ ] 写 Worker 编排层(quota check + LLM dispatch + 沙箱)
- [ ] 写 3 个 LLM 客户端(Workers AI / DeepSeek / Claude)
- [ ] 写 5 套预生成 Phaser 模板
- [ ] 写自迭代回路(沙箱跑 → 报错 → 喂回 LLM 修,最多 2 次)
- [ ] 写 defense-in-depth 沙箱(静态分析 + CSP + iframe sandbox)
- [ ] 写 5 种 LLM 风格的 prompt 模板
- [ ] 写"换主题"功能
- [ ] 写 `/g/<id>` 短链分享
- [ ] 写 deploy 脚本 + 实际 deploy
- [ ] 写 README polish(跑完后的真实 demo + 性能数字)

## 欢迎词

开源 + 公开 portfolio。

如果你:
- **试用了觉得生成的游戏不对劲** → 提 issue,贴 situation 文字和 LLM 输出,我会复现
- **想加新游戏类型** (消除类 / 卡牌 / 模拟经营)→ 提 PR
- **想加新 LLM 后端** (Gemini Flash / Mistral / Qwen)→ 提 PR
- **发现了沙箱逃逸** → 提 issue,标 "security",**优先修**
- **想用这个做商业产品** → 发邮件聊
- **就是想来吐槽** → 提 issue 带 "rant" 标签

**提交 issue**:[github.com/kevin12369/whimsy/issues](https://github.com/kevin12369/whimsy/issues)
**发邮件**:kevin12369@users.noreply.github.com

**特别欢迎**:
- AI/ML 工程师(看 LLM 编排)
- 前端/游戏工程师(看 Phaser 集成)
- 安全研究员(审沙箱)

---

*代码还没写。设计 + 实施计划 100% 完整,等抽空跑。*

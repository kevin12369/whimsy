# Whimsy Shuffle — 回声远征

> 在破碎的棱镜世界中收集回声，结交迷途的伙伴，决定这个破碎世界的命运。

一款基于 Phaser 3 的浏览器端 2D 像素风 Roguelike 探险游戏。探索 11 个程序生成的碎镜域，招募伙伴，收集 33 段记忆碎片，做出道德选择，面对 3 种不同的结局。纯 TypeScript 构建——无需服务器、无需注册、无需安装。

**状态**: Phase A-D 已完成，从教程到结局的完整游戏流程可玩。
[开始游戏](https://kevin12369.github.io/whimsy/)（需先部署 GitHub Pages）。

---

## 概述

棱镜碎裂后，世界分崩离析。棱镜的回声散落在 11 个被污染的碎镜域中。你——一位孤独的旅者——必须深入每个域，收集回声，招募失散的伙伴，并最终决定：修复世界、重塑世界，还是释放一切。

### 核心循环

```
选择碎镜域 → 远征（5层） → 收集回声 → 
回声档案（查看进度） → 下一个域 → 
收集全部 11 枚回声 → 最终抉择 → 结局
```

每层远征使用波函数坍缩算法程序化生成地图，包含可拾取物品、可对话 NPC 和独特的域威胁。

---

## 功能特性

### 11 个碎镜域
每个域拥有独特的调色板、伙伴、陷阱和故事：

| 域 | 威胁 | 伙伴 |
|----|------|------|
| 🌲 森林 | 荆棘 | 苔藓（侦察者） |
| 🌊 海洋 | 暗流 | 潮汐（通灵者） |
| 🏰 地牢 | 暗影 | 余烬（守护者） |
| 🤖 星环 | 能量场 | 像素（AI） |
| 🏜️ 沙漠 | 流沙 | 幻影（幻术师） |
| ❄️ 冰原 | 冰裂 | 霜语（元素灵） |
| 🌴 雨林 | 毒雾 | 孢子（共生体） |
| 💎 水晶 | 水晶刺 | 棱晶（共鸣者） |
| 🌈 霓虹 | 电网 | 乱码（数据灵） |
| 👻 亡灵 | 亡魂 | 回声（迷失灵魂） |
| ☁️ 天际 | 虚空 | 和风（风行者） |

### 伙伴系统
- 11 个伙伴各有独特的被动能力
- 4 个羁绊等级，通过任务和探索获得经验解锁
- 伙伴会根据你的选择做出情境反应（对话气泡）
- 被动能力直接影响玩法：自动冻结水面、揭示陷阱、减少冲刺冷却等

### 域冲突系统
每个域有 **2 方对立势力**（共 22 个）。远征中会遇到冲突事件——你的选择影响势力好感度，并决定最终解锁哪个结局。

### 道德选择节点
旅程中分布着 5 个道德困境。选择记录你的品德倾向（同情、牺牲、真相、力量、自由、责任），影响叙事走向。

### 故事与叙事
- 33 段记忆碎片揭示棱镜的历史
- 域污染系统（40% 概率产生调色板混合）
- 3 种结局由玩家全游戏中的选择判定

### 进度与持久化
- 回声收集通过 localStorage 跨会话保存
- 伙伴招募和羁绊等级持久化
- 已完成的任务和势力好感度继承
- 收集全部 11 枚回声解锁最终结局

---

## 技术栈

| 层 | 选择 |
|----|------|
| 引擎 | Phaser 3.80 |
| 语言 | TypeScript 5 |
| 构建 | Vite 5 |
| 测试 | Vitest + Playwright |
| 地图生成 | 波函数坍缩 (WFC) |
| 持久化 | localStorage |
| 美术 | Kenney (CC0) — 像素瓦片、UI 面板、粒子特效 |
| 音效 | Kenney UI 音效包 (CC0) |
| 托管 | GitHub Pages（纯静态，无服务器） |

## 快速开始

```bash
git clone https://github.com/kevin12369/whimsy.git
cd whimsy
pnpm install
pnpm dev
# 打开 http://localhost:5173
```

需要 **Node.js 20+** 和 **pnpm 9+**。

## 如何游玩

### 首次玩家
1. **完成教程**（5 步）—— 学习移动、拾取、使用物品、对话和融合
2. **回声档案**页面打开 —— 查看所有域的进度
3. 点击 **"开始探险"** → 从 3 个候选域中选择一个

### 远征中（每个域 5 层）
- **WASD / 方向键** — 移动
- **空格** — 冲刺（1.6 秒冷却）
- **E** — 交互（拾取物品、对话、打开祭坛）
- **Q** — 丢弃物品 / 选择方案 B
- **I** — 打开背包
- **Esc** — 暂停菜单

### 关卡目标
每层随机分配一种目标：
- 🔹 **收集 X 个回声碎片** — 找到并收集发光的紫色碎片
- 🔹 **到达出口** — 前往黄色传送门
- 🔹 **激活祭坛** — 在祭坛上进行一次融合

### 伙伴招募
在第 0 层找到任务发放者，完成任务积累好感度。好感度达到门槛后，伙伴永久加入你。其被动能力立即生效。

---

## 项目结构

```
whimsy/
  index.html                         -- Vite 入口
  src/
    main.ts                          -- Phaser 游戏配置和场景注册
    config/                          -- 常量、资源键
    core/                            -- 游戏逻辑
      companion.ts                   -- 11 个伙伴定义、任务、对话、故事
      domainConflict.ts              -- 势力系统、冲突事件
      moralChoices.ts                -- 道德选择节点
      persistence.ts                 -- localStorage 存档
      itemUseEffects.ts              -- 物品跨域效果（77 种组合）
      tutorial.ts                    -- 5 步教程
      worldState.ts                  -- 关卡状态机
    procgen/
      wfc.ts                         -- WFC 地图生成
      themeWorlds.ts                 -- 11 个域的配置
      tileFrames.ts                  -- 瓦片 → spritesheet 帧映射
      itemFrames.ts                  -- 物品名 → spritesheet 帧映射
      contamination.ts               -- 域污染系统
      deckFallback.ts                -- 备选物品生成
      levelSpawner.ts                -- 物品、NPC 和祭坛放置
    phaser/
      scenes/
        BootScene.ts                 -- 资源加载
        MenuScene.ts                 -- 主菜单
        EchoArchiveScene.ts          -- 进度中心
        DomainSelectScene.ts         -- 域选择
        GameScene.ts                 -- 核心玩法（~2000 行）
        EndingScene.ts               -- 3 种结局动画
        InventoryScene.ts            -- 背包界面
        FusionAltarScene.ts          -- 融合祭坛界面
        HandScene.ts                 -- 旧版手牌
        PauseScene.ts                -- 暂停覆盖层
        PlayerTestScene.ts           -- 测试场景
      entities/
        Player.ts                    -- 移动、冲刺、碰撞
        Companion.ts                 -- 伙伴跟随实体
    ui/
      DialogueBox.ts                 -- RPG 底部对话面板
      VFX.ts                         -- 粒子特效系统
      AudioManager.ts                -- 音效播放
      KeyIcon.ts                     -- 键盘提示图标
      CardHandView.ts                -- 旧版手牌视图
  public/
    assets/
      tiles/                         -- Kenney 像素瓦片
      audio/                         -- 12 个音效（拾取、冲刺、受伤等）
      vfx/                           -- 9 枚粒子精灵（魔法、火焰、斩击等）
      ui/                            -- Kenney UI 面板和键盘图
    favicon.png
  .github/workflows/
    deploy.yml                       -- GitHub Pages 自动部署
  docs/design/                       -- 设计文档和验收报告
```

## 开发命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | Vite 开发服务器 (端口 :5173) |
| `pnpm build` | 生产构建到 `dist/` |
| `pnpm preview` | 本地预览生产构建 |
| `pnpm test` | 单元测试 (Vitest) |
| `pnpm test:e2e` | E2E 测试 (Playwright) |
| `pnpm typecheck` | `tsc --noEmit` 类型检查 |

## 部署

推送到 `main` 分支触发 [GitHub Actions](.github/workflows/deploy.yml) 自动构建并部署到 GitHub Pages。流程：

1. 拉取代码
2. 使用 pnpm 安装依赖
3. 构建项目
4. 上传 `dist/` 为 Pages 制品
5. 部署到 `https://kevin12369.github.io/whimsy/`

## 设计文档

详细设计文档位于 [docs/design/](docs/design/)：

- [Game Design Document v2](docs/design/GDD-whimsy-shuffle-v2.md)
- [Phase A 验收报告](docs/design/2026-06-22-phase15-acceptance.md)
- [Phase C 验收报告](docs/design/2026-06-22-phase16-acceptance.md)
- [游戏状态评估](docs/design/2026-06-24-game-state-evaluation.md)

## 许可证

MIT. 见 [LICENSE](./LICENSE)。

## 致谢

- [Kenney](https://kenney.nl) — 像素瓦片、UI 面板、粒子特效、UI 音效 (CC0)
- [Phaser](https://phaser.io) — 游戏引擎
- OpenGameArt.org — 素材分发平台

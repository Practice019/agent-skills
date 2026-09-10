---
name: awesome-design-md
description: "54+ 个知名网站设计系统模板（Vercel、Stripe、Linear、Notion、Figma、Claude、Apple 等 74 份 DESIGN.md），一键复用品牌级 UI 风格：给出配色 / 字体 / 组件 / 间距 tokens。当用户要求「做一个像 X 的界面」「参考某品牌设计系统」「给我 DESIGN.md 模板」「要 XXX 风格的配色/字体」时使用。Curated collection of 74 DESIGN.md files extracted from real developer-focused websites (Vercel, Stripe, Linear, Notion, Figma, Claude, Apple, Tesla...). Use when the user wants UI matching a specific brand's design system, needs a DESIGN.md template, asks for design tokens, color palettes, or typography of known products, or says 'make it look like [brand]'."
whenToUse: "用户要做落地页 / Dashboard / SaaS 官网 / AI 产品界面但没定风格，或明确点名某个品牌风格时。按项目类型推荐 3-5 个候选设计系统，选一个后直接按参考文件生成 UI。"
user-invocable: true
---

# Awesome DESIGN.md

**74 份**从真实开发者向网站提取的 DESIGN.md 设计系统规格。每份都是一个完整设计规格，AI agent 读它就能生成品牌一致的 UI。

> 上游仓库：<https://github.com/VoltAgent/awesome-design-md>（MIT License, Copyright (c) 2026 VoltAgent）。参考文件为本技能内嵌副本，路径相对本技能目录。

## What is DESIGN.md?

[DESIGN.md](https://stitch.withgoogle.com/docs/design-md/overview/) 是 Google Stitch 提出的概念——一份纯文本设计系统文档，给 AI agent 读，用来生成一致的 UI。就是一个 markdown 文件。放到项目根目录，任何 AI coding agent 立刻知道 UI 该长什么样。

| 文件 | 谁读 | 定义什么 |
|---|---|---|
| `AGENTS.md` | Coding agent | 项目怎么构建 |
| `DESIGN.md` | Design agent | 项目长什么样、什么感觉 |

## How to Use

1. **用户说"做成像 [品牌] 那样"** → 在下表找对应条目
2. **读参考文件**（见下表 Reference 列，文件位于 references/ 目录，如 stripe 品牌读 `references/stripe.md`）
3. **把内容复制到用户项目根目录**，存为 `DESIGN.md`
4. **按其中的 design tokens**（颜色、字体、间距、组件）生成 UI 代码

## Available Design Systems

### AI & Machine Learning

| Site | Reference | Style |
|------|-----------|-------|
| Claude | `references/claude.md` | 暖赤陶色调，编辑式排版 |
| Cohere | `references/cohere.md` | 鲜明渐变，数据密集仪表盘 |
| ElevenLabs | `references/elevenlabs.md` | 暗色电影感，声波美学 |
| Minimax | `references/minimax.md` | 大胆暗色界面 + 霓虹强调 |
| Mistral AI | `references/mistral.ai.md` | 法式工程极简，紫色调 |
| Ollama | `references/ollama.md` | 终端优先，单色极简 |
| OpenCode AI | `references/opencode.ai.md` | 开发者中心暗色主题 |
| Replicate | `references/replicate.md` | 干净白画布，代码优先 |
| RunwayML | `references/runwayml.md` | 电影感暗色 UI，媒体密集 |
| Together AI | `references/together.ai.md` | 技术蓝图风 |
| VoltAgent | `references/voltagent.md` | 虚空黑画布 + 翠绿强调，终端原生 |
| xAI | `references/x.ai.md` | 冷峻单色，未来极简 |

### Developer Tools & Platforms

| Site | Reference | Style |
|------|-----------|-------|
| Cursor | `references/cursor.md` | 圆润暗色界面 + 渐变强调 |
| Expo | `references/expo.md` | 暗色主题，紧字距，代码中心 |
| Linear | `references/linear.app.md` | 极致极简精确，紫色强调 |
| Lovable | `references/lovable.md` | 俏皮渐变，友好开发者气质 |
| Mintlify | `references/mintlify.md` | 干净绿色调，阅读优化 |
| PostHog | `references/posthog.md` | 刺猬吉祥物 + 开发者友好暗色 UI |
| Raycast | `references/raycast.md` | 精致暗色外壳 + 鲜艳渐变 |
| Resend | `references/resend.md` | 极简暗色 + 等宽字强调 |
| Sentry | `references/sentry.md` | 暗色仪表盘，数据密集，粉紫强调 |
| Supabase | `references/supabase.md` | 暗色祖母绿主题，代码优先 |
| Superhuman | `references/superhuman.md` | 高级暗色 UI，键盘优先，紫色辉光 |
| Vercel | `references/vercel.md` | 黑白精准，Geist 字体 |
| Warp | `references/warp.md` | 暗色 IDE 式界面，块状命令 UI |
| Zapier | `references/zapier.md` | 暖橙，插画驱动 |

### Infrastructure & Cloud

| Site | Reference | Style |
|------|-----------|-------|
| ClickHouse | `references/clickhouse.md` | 黄色强调，技术文档风 |
| Composio | `references/composio.md` | 现代暗色 + 彩色集成图标 |
| HashiCorp | `references/hashicorp.md` | 企业级干净，黑白 |
| MongoDB | `references/mongodb.md` | 绿叶品牌，开发者文档优先 |
| Sanity | `references/sanity.md` | 红色强调，内容优先编辑布局 |
| Stripe | `references/stripe.md` | 标志性紫渐变，weight-300 优雅 |

### Design & Productivity

| Site | Reference | Style |
|------|-----------|-------|
| Airtable | `references/airtable.md` | 彩色友好，结构化数据美学 |
| Cal.com | `references/cal.md` | 干净中性 UI，开发者向极简 |
| Clay | `references/clay.md` | 有机形状，柔和渐变，艺术指导布局 |
| Figma | `references/figma.md` | 鲜艳多色，俏皮且专业 |
| Framer | `references/framer.md` | 大胆黑蓝，动效优先 |
| Intercom | `references/intercom.md` | 友好蓝色，对话式 UI |
| Miro | `references/miro.md` | 亮黄强调，无限画布美学 |
| Notion | `references/notion.md` | 暖极简，衬线标题，柔和表面 |
| Pinterest | `references/pinterest.md` | 红色强调，瀑布流，图片优先 |
| Webflow | `references/webflow.md` | 蓝色调，精致营销站美学 |

### Fintech & Crypto

| Site | Reference | Style |
|------|-----------|-------|
| Binance | `references/binance.md` | 近黑画布 + 标志黄 `#FCD535` 主 CTA |
| Coinbase | `references/coinbase.md` | 干净蓝色身份，信任感，机构气质 |
| Kraken | `references/kraken.md` | 紫色调暗色 UI，数据密集仪表盘 |
| Mastercard | `references/mastercard.md` | 暖米色画布 + 超大圆角 / 圆形轨迹 |
| Revolut | `references/revolut.md` | 精致暗色，渐变卡面，fintech 精密 |
| Wise | `references/wise.md` | 亮绿强调，友好清晰 |

### Enterprise & Consumer

| Site | Reference | Style |
|------|-----------|-------|
| Airbnb | `references/airbnb.md` | 暖珊瑚色，摄影驱动，圆角 UI |
| Apple | `references/apple.md` | 高级留白，SF Pro，电影感影像 |
| BMW | `references/bmw.md` | 暗色高级表面，德式精密工程美学 |
| BMW M | `references/bmw-m.md` | 赛道工程风，近黑底 + 大写 BMW Type Next |
| Bugatti | `references/bugatti.md` | 极简豪车，纯黑 + 大写白字全幅车图 |
| Dell 1996 | `references/dell-1996.md` | 1996 目录时代复古，黑色页框 + 扁平色块卡 |
| Ferrari | `references/ferrari.md` | 电影感编辑排版，近黑 `#181818` + 白色大标题 |
| HP | `references/hp.md` | 白底企业消费风，HP Electric Blue `#024ad8` 单一信号 CTA |
| IBM | `references/ibm.md` | Carbon 设计系统，结构化蓝色调 |
| Lamborghini | `references/lamborghini.md` | 纯黑 `#000000` 剧院感 + Lamborghini Gold `#FFC000` |
| Meta | `references/meta.md` | 白底硬件电商，全幅产品摄影 |
| Nike | `references/nike.md` | 摄影优先，超大 Futura 大写 + 近单色零售壳 |
| Nintendo 2001 | `references/nintendo-2001.md` | 2001 主机金属面板风，琥珀色发光导航 |
| NVIDIA | `references/nvidia.md` | 绿黑能量，技术力量美学 |
| PlayStation | `references/playstation.md` | 黑/白/PS Blue 三画布章节，SST weight-300 |
| Renault | `references/renault.md` | 黑白 + Sunlight Yellow，NouvelR 字体，配置器界面 |
| Shopify | `references/shopify.md` | 双轨：近黑营销页 + 明亮电商页 |
| Slack | `references/slack.md` | 深茄紫主色 + 奶油薰衣草 hero 渐变 |
| SpaceX | `references/spacex.md` | 冷峻黑白，全出血影像，未来感 |
| Spotify | `references/spotify.md` | 暗底鲜艳绿，粗体字，专辑封面驱动 |
| Starbucks | `references/starbucks.md` | 四档绿 + 暖奶油画布，SoDoSans 字体 |
| Tesla | `references/tesla.md` | 极致减法：全屏车图 + 单一 Electric Blue `#3E6AE1` |
| The Verge | `references/theverge.md` | 近黑 `#131313` + 酸薄荷/紫外荧光，巨型 Manuka 标题 |
| Uber | `references/uber.md` | 大胆黑白，紧凑字形，都市能量 |
| Vodafone | `references/vodafone.md` | 编辑摄影 hero 带 + 巨型大写标题 |
| Wired | `references/wired.md` | 黑白编辑二重奏 + 窄体定制标题 |

参考文件缺失或用户想要的品牌不在表内时：**如实说没有**，不要凭记忆编造 tokens；可以推荐表内最接近的几个风格，或建议上游仓库 [getdesign.md/request](https://getdesign.md/request) 申请。

## What Each DESIGN.md Contains

每份文件按 [Google Stitch DESIGN.md 格式](https://stitch.withgoogle.com/docs/design-md/format/) 含 9 个部分：

1. **Visual Theme & Atmosphere** — 情绪、密度、设计哲学
2. **Color Palette & Roles** — 语义名 + hex + 功能角色
3. **Typography Rules** — 字族、完整层级表
4. **Component Stylings** — 按钮、卡片、输入框、导航及状态
5. **Layout Principles** — 间距刻度、栅格、留白哲学
6. **Depth & Elevation** — 阴影系统、表面层级
7. **Do's and Don'ts** — 设计护栏与反模式
8. **Responsive Behavior** — 断点、触摸目标、折叠策略
9. **Agent Prompt Guide** — 速查色值 + 可直接用的 prompt

文件头部另有 YAML frontmatter（`colors` / `typography` 等结构化 tokens），生成代码时可直接取值。

## Workflow

### 1. 用户指定品牌 → 直接匹配

```text
User: "Build me a landing page that looks like Stripe"
→ read references/stripe.md（相对本技能目录）
→ 复制内容到用户项目根目录 DESIGN.md
→ 按 tokens 生成 UI 代码
```

### 2. 用户想浏览 → 过滤并推荐

```text
User: "Show me dark-themed design systems"
→ 推荐：Vercel, Cursor, ElevenLabs, Resend, Warp, Supabase, xAI, Linear, Sentry, The Verge 等
→ 用户挑一个，再读对应参考文件
```

### 3. 用户没说风格 → 主动推荐

用户要建 UI 但**没提任何品牌或风格偏好**（如"帮我做一个落地页"、"写一个 dashboard"、"做一个 SaaS 官网"）时，**主动推荐** 3–5 个设计系统：

| Project Type | Recommended Styles | Why |
|---|---|---|
| **SaaS 官网 / Landing page** | Stripe, Vercel, Linear | 经典高转化 SaaS 风格，简洁专业 |
| **开发者工具 / 技术产品** | Vercel, Cursor, Raycast, Supabase | 暗色系、代码友好、极客气质 |
| **AI 产品 / Chat UI** | Claude, Mistral AI, ElevenLabs | AI 原生设计语言，温暖或未来感 |
| **Fintech / 金融产品** | Stripe, Revolut, Coinbase, Mastercard | 信任感、精密感、数据密集 |
| **效率工具 / 生产力产品** | Notion, Linear, Superhuman | 极简、信息密度高、键盘优先 |
| **电商 / 消费品牌** | Airbnb, Apple, Spotify, Nike | 视觉驱动、大图、情感化设计 |
| **内部后台 / Dashboard** | Sentry, PostHog, ClickHouse | 数据密集型、暗色仪表盘 |
| **创意 / 设计工具** | Figma, Framer, Clay | 大胆配色、动感十足 |
| **企业级 / B2B** | IBM, HashiCorp, MongoDB | 稳重、结构化、Design System 成熟 |
| **汽车 / 高端硬件** | Tesla, BMW, Ferrari, Lamborghini | 全幅影像 + 极少 UI 装饰 |

**推荐流程：**

```text
User: "帮我做一个 AI 聊天产品的界面"
→ Agent: "推荐以下设计风格供你选择：
   1. 🟠 Claude — 温暖柔和的赤陶色调，编辑式布局，适合对话产品
   2. 🟣 Mistral AI — 法式工程极简，紫色调，优雅专业
   3. 🎬 ElevenLabs — 暗色电影感，波形美学，适合音频/多模态
   4. ⬛ Vercel — 黑白精准，极致简约
   5. 🟢 VoltAgent — 终端风格，翠绿高亮，适合技术型 AI
   选一个编号，我直接用对应的设计系统帮你生成。"
→ 用户选一个 → read 参考文件 → 生成 UI
```

**用户说"随便 / 你决定"：**
- 默认 **Vercel**（最稳的全能选项：干净、现代、专业）
- 说明选择并给切换余地："我先用 Vercel 风格（简约黑白），不喜欢随时换。"

### 4. 多风格混搭

用户想 A 的配色 + B 的排版：分别 read 两份参考文件，**以一份为主板（surface / spacing / 组件骨架），另一份只取 tokens 子集（palette 或 type scale）**，明确告诉用户混了哪两部分，避免无来源的缝合。

## 输出与交付规范

- 复制 DESIGN.md 到用户项目时**整份复制**，不要摘要——agent 后续要靠完整 tokens 生成代码
- 生成 UI 代码时，颜色写 CSS 变量 / Tailwind theme token，不要把 hex 散落在组件里
- 交付时说明**用了哪份设计系统**（品牌名 + 参考文件名），用户能追溯
- 对上表里没有的品牌，不得编造 tokens

## 注意事项

- **路径基准**：所有 references/ 目录下的参考文件相对本技能目录解析
- **文件命名**：带点的品牌名保留点（`mistral.ai.md` / `x.ai.md` / `linear.app.md` / `opencode.ai.md` / `together.ai.md`），文件名即仓库目录名
- **正文语言**：参考文件是英文原文，不要翻译后写入用户项目（设计术语翻译会失真）
- **许可证**：上游 MIT，内嵌副本保留原始内容；再分发时保留 VoltAgent 归属与本技能内 LICENSE 说明
- **数量**：本技能含 74 份参考（上游 README badge 标注 73，以实际文件为准）

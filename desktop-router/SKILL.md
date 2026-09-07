---
name: desktop-router
description: "macOS/Windows 桌面 UI/UX 任务的专用路由 Skill：识别任务是否属于桌面应用界面设计，判断平台深度与证据目标，并把任务分发给本目录内的 desktop-* 子技能（audit/redesign/native feel/layout/typography/motion/brand/art direction/visual draft/QA/DESIGN.md）。当用户要设计、实现、重设计、审计或文档化 macOS/Windows 桌面应用 UI 时，先加载本路由，按路由表定位子技能文件并读取执行。"
whenToUse: "任务涉及桌面应用窗口、侧边栏、工具栏、表格、菜单、命令面板、设置页、原生感、信息密度、排版动效、设计稿、DESIGN.md，或要求桌面 UI 的 audit/review/critique/redesign 时，本 Skill 是唯一入口；先路由，再按路径读取对应子技能。"
user-invocable: true
disable-model-invocation: false
---

# Desktop Router —— 桌面 UI/UX 技能套件唯一入口

本文件夹是 Desktop Taste Skills 套件的**唯一路由入口**。13 个子技能的完整指令全部存放在本文件夹内部（`<子技能名>/SKILL.md`），它们**不注册为独立技能**，由本路由统一调度。

## 目录结构（全部在本技能文件夹内）

```text
~/.dsh/skills/desktop-router/
├── SKILL.md                      ← 本文件：路由表（DSH 只扫这一层）
├── desktop-taste/SKILL.md        ← 原仓库入口：边界定义与原始流程
├── desktop-design-read/SKILL.md  ← brief gate：编码前产出 Desktop Read
├── desktop-art-direction/SKILL.md
├── desktop-visual-draft/SKILL.md
├── desktop-native-feel/SKILL.md
├── desktop-layout-composition/SKILL.md
├── desktop-typography-density/SKILL.md
├── desktop-motion-interaction/SKILL.md
├── desktop-brand-system/SKILL.md
├── desktop-audit/SKILL.md
├── desktop-redesign/SKILL.md
├── desktop-qa/SKILL.md
└── desktop-design-md/SKILL.md
```

## 子技能职责速查

| 子技能（目录名） | 职责 | 典型触发信号 |
| --- | --- | --- |
| `desktop-design-read` | 编写/修改 UI 前的 brief gate，产出 Desktop Read | 写 UI 前判断平台、密度、布局、状态、交互风险 |
| `desktop-art-direction` | 提出 2-3 个明确 Art Direction 并推荐 | 需要比较设计方向，visual draft 缺输入 |
| `desktop-visual-draft` | ImageGen 生成 3 张可评审桌面窗口设计稿 | 要设计稿/mockup/ImageGen 窗口图，缺视觉目标 |
| `desktop-native-feel` | 判断并改进原生感，避免网页壳 | 像网页壳、不原生，涉及窗口/菜单/系统状态 |
| `desktop-layout-composition` | 布局类型、窗口构图、区域边界 | 侧边栏、split view、Inspector、表格、工作台 |
| `desktop-typography-density` | 排版层级、间距、信息密度 | 字号、行高、表格/列表密度、长时间阅读 |
| `desktop-motion-interaction` | 动效、状态反馈、交互手感 | hover/focus/selection/panel reveal/drag/loading/undo |
| `desktop-brand-system` | 克制可用的产品品牌表达 | accent color、empty state、图标语言、微文案 |
| `desktop-audit` | 审计已有桌面 UI 并给诊断 | audit/review/critique/检查/评估已有界面或截图 |
| `desktop-redesign` | 审计诊断转可实施方案 | 重设计已有桌面应用界面 |
| `desktop-qa` | 交付前 QA 检查 | 已实现 UI，交付前检查是否符合 Read 与证据目标 |
| `desktop-design-md` | 生成/更新桌面版 DESIGN.md | 生成/遵循桌面设计规范 |
| `desktop-taste` | 原仓库入口（本路由的上级来源） | 需要原始入口流程与边界定义时参考 |

## 固定路由流程

1. **边界判断**：是否属于 macOS/Windows 桌面应用 UI/UX？
   - 属于 → 继续；混合任务 → 只拆出桌面 UI 部分；
   - Web 落地页/移动端/纯后端工程/打包发布/纯品牌设计 → **不路由**，直接用对应能力处理。
2. **平台深度**：`macOS-first`（可深入 Liquid Glass、SwiftUI scene/window、AppKit 边界）/ `Windows-first`（保留 title bar、command bar、context menu、Fluent/Mica/Acrylic、系统主题）/ `cross-platform desktop`。明确记录，macOS 规则不自动套 Windows。
3. **证据目标**：现有 `DESIGN.md`、截图、运行中窗口、UI 代码路径、tokens/样式/组件、平台参考、用户约束、已选 visual draft / art direction。证据目标不要求 ImageGen/Figma；只有缺视觉目标或用户要求视觉探索时才路由到 art direction / visual draft。
4. **路由决策**：按下表选出主路由技能；若同时命中多项，按 先 brief → 再方向/布局/细节 → 最后 QA/文档 的顺序组合，不要同时展开全部。
5. **读取并执行**：用 `read` 工具读取 `~/.dsh/skills/desktop-router/<子技能名>/SKILL.md`，把该文件的完整指令纳入当前任务执行。路由只负责"选"，执行以子技能文件内容为准。
6. **收尾**：涉及已实现 UI 交付时补 `desktop-qa`；需要长期契约时补 `desktop-design-md`。

## 主路由表

| 用户诉求 | 主路由（子技能目录） | 不适用条件 | 产出 |
| --- | --- | --- | --- |
| 设计/实现新桌面 UI | `desktop-design-read` → （需要方向时）`desktop-art-direction` → 实现 | 已有唯一方向且只需编码 | Desktop Read + 可运行 UI |
| 缺少视觉目标、要设计稿 | `desktop-visual-draft`（前置 `desktop-art-direction`） | 已有唯一视觉目标 | 3 张独立设计稿等待选择 |
| review/audit/critique 现有界面 | `desktop-audit` | 纯代码质量/性能 review | 诊断、风险、最小修正路径 |
| 重设计已有界面 | `desktop-redesign`（前置 `desktop-audit`） | 没有现有界面且只要新建 | 可实施方案 |
| 像网页壳、不原生 | `desktop-native-feel` | 纯工程选型/发布 | 原生感改进清单 |
| 布局/窗口结构问题 | `desktop-layout-composition` | 只改颜色文案 | 布局类型与区域边界判断 |
| 字号/密度/可读性 | `desktop-typography-density` | 品牌字体展示 | 层级与密度校准 |
| 动效/状态/手感 | `desktop-motion-interaction` | 营销装饰动画 | 动效与状态反馈方案 |
| 品牌/气质/微文案 | `desktop-brand-system` | 品牌站/logo/广告 | 桌面内品牌表达 |
| 交付前检查 | `desktop-qa` | 广义产品审计 | QA 结论与修复清单 |
| 生成/更新设计规范 | `desktop-design-md` | Web 设计规范 | 桌面 DESIGN.md |
| 需要原套件入口定义 | `desktop-taste` | — | 边界判断与原始流程 |

## 路由输出格式

开始执行前先输出路由判断（2-4 行），再读取子技能：

```text
Desktop Router:
- applies: yes/no
- platform_depth: macOS-first / Windows-first / cross-platform desktop
- evidence_target: screenshot / runtime / code / DESIGN.md / reference / art direction / visual draft / user description
- route: <desktop-taste / desktop-design-read / desktop-art-direction / desktop-visual-draft / desktop-native-feel / desktop-layout-composition / desktop-typography-density / desktop-motion-interaction / desktop-brand-system / desktop-audit / desktop-redesign / desktop-qa / desktop-design-md>
- next: read ~/.dsh/skills/desktop-router/<route>/SKILL.md 并按其中指令执行
```

`applies: no` 时停止路由，直接说明应使用什么能力处理原任务。

## 注意事项

- 子技能**不注册为独立技能**（DSH 只扫描本文件夹的 SKILL.md 一层），路由后必须用 `read` 读取子技能文件获取完整指令。
- 若目标子技能文件缺失，只记录路由需求，不假装已加载。
- 路由只做一次判断，不要在每个子任务里重复路由。
- 不要修改 `desktop-router/SKILL.md` 之外的 frontmatter 结构；子技能文件保持原样即可。

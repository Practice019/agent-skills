---
name: desktop-taste
description: 识别 macOS 和 Windows 桌面 UI/UX 任务并路由到合适的桌面设计能力。
version: 0.4.0
---

# Desktop Taste 入口

这是 Desktop Taste Skills 的入口 Skill。它只负责判断任务是否属于 macOS / Windows 桌面应用 UI/UX，说明不适用边界，并把任务路由给后续能力。不要在这里展开完整专项规则。

## 触发条件

当用户要设计、实现、重设计、审计或文档化桌面应用 UI 时使用本 Skill。典型信号包括：

- macOS、Windows、Electron、Tauri、SwiftUI、AppKit、WinUI、WPF 桌面应用界面
- 让应用更原生、更像真实桌面软件、更不像网页壳
- 调整窗口、标题栏、工具栏、侧边栏、表格、Inspector、命令面板、设置页、状态栏
- 生成桌面应用设计稿、visual draft、mockup 或可供实现对照的 ImageGen 窗口图
- 生成或维护桌面应用的 `DESIGN.md`
- 在写 UI 前判断平台、密度、布局、状态和交互风险

## 不适用场景

遇到以下任务时不要使用 Desktop Taste Skills；如果任务混合了桌面 UI 与非 UI 工程，只处理桌面 UI/UX 部分：

- Web landing page、营销站、品牌官网、SaaS 官网
- Mobile app、响应式移动页面、iOS / Android 原生移动界面
- 通用后端、数据库、API、认证、队列、部署、CI
- Electron / Tauri / SwiftUI / WinUI 的工程架构、打包、签名、发布、自动更新
- 纯品牌识别、logo、海报、社媒视觉，且没有桌面应用 UI 载体

边界处理：

- 用户只问工程问题：直接回答工程问题，不加载本插件。
- 用户问桌面应用里的品牌、文案或图标：只评估它们如何服务窗口、导航、状态和工作流。
- 用户要求 Web 和 Desktop 同时做：先拆出桌面应用 UI 目标，Web 部分交给对应能力。

## 固定入口流程

1. 先判断是否属于桌面 UI/UX。
2. 若属于，先查找当前任务直接相关的桌面上下文：现有 `DESIGN.md`、截图、运行中窗口、UI 代码路径、tokens、样式表、组件、平台约束或已选设计方向；只读相关材料，不全仓库漫游，也不建立 Product Design 式 saved context 或 onboarding 流程。
3. 运行 `desktop-design-read` 作为 brief gate，产出可引用的 Desktop Read。关键信息缺失时先问缺口；信息足够时回放判断，不重复提问。
4. 同时判断平台深度：`macOS-first`、`Windows-first` 或 `cross-platform desktop`。macOS-first 可以进入 Liquid Glass、SwiftUI scene/window、AppKit 边界和 toolbar/sidebar/inspector 深度；Windows-first 必须保留 Windows title bar、command bar、context menu、快捷键、系统主题和 Fluent / Mica / Acrylic 预期。
5. 大范围实现、redesign 或 `DESIGN.md` 生成前，必须绑定桌面视觉/证据目标：截图、运行中窗口、现有 UI 代码路径、已有 `DESIGN.md`、平台参考、用户提供的设计约束、draft-ready brief，或已选 visual draft / `desktop-art-direction`。小型机械修正可用当前代码和用户描述作为证据目标。
6. 证据目标不要求 ImageGen、Figma 或 Web prototype；只有用户明确要求视觉探索、缺少视觉目标或需要设计稿评审时，才把 `desktop-art-direction` / `desktop-visual-draft` 作为方向来源。
7. 再按下方路由选择后续能力。若对应专项 Skill 尚未存在或未安装，只记录路由需求，不假装已经加载。
8. 最后实现、审计、QA 或文档化时，保持 macOS / Windows 桌面应用视角；macOS-strong 不等于 macOS-only。

## 路由表

| 路由 | 触发条件 | 不适用条件 | 行动 |
| --- | --- | --- | --- |
| `audit` | 用户要求 review、critique、audit、检查现有桌面 UI | 只检查代码质量或性能 | 输出问题诊断、风险、最小修正路径 |
| `redesign` | 用户要求重设计已有桌面应用界面 | 没有现有界面或截图，且只要新建页面 | 先保留有效工作流，再提出改法 |
| `native feel` | 用户说不像原生、像网页壳，或涉及窗口、菜单、系统状态 | 纯工程选型或发布问题 | 聚焦平台习惯、窗口结构、输入反馈、系统状态 |
| `layout` | 涉及侧边栏、split view、Inspector、表格、工作台、信息架构 | 只是颜色或文案调整 | 判断桌面布局类型和真实数据承载能力 |
| `typography` | 涉及字号、层级、行高、密度、长时间阅读 | 只是品牌字体展示 | 校准桌面字号层级、信息密度和可读性 |
| `motion` | 涉及 hover、focus、selection、panel reveal、drag、loading、undo | 营销滚动动效或装饰动画 | 保证动效服务操作确认和空间理解 |
| `brand` | 涉及产品气质、accent color、empty state、图标语言、微文案 | 品牌站、logo 系统或广告视觉 | 让品牌表达进入桌面工作流，不压倒可用性 |
| `art direction` | 需要比较 2-3 个桌面设计方向，或 visual draft 缺少可执行方向输入 | 用户已经指定唯一方向且只需实现 | 使用 `desktop-art-direction` 输出方向推荐与 draft-ready brief |
| `visual draft` | 用户要求设计稿、mockup、ImageGen 窗口图，或实现前缺少可评审视觉目标 | 已有唯一视觉目标且只需实现，或任务不是桌面 UI | 使用 `desktop-visual-draft` 生成 3 张独立桌面 bitmap 设计稿并等待选择 |
| `QA` | 已实现桌面 UI，需要交付前检查是否符合 Desktop Read 和证据目标 | 用户要求广义产品审计或纯代码 review | 使用 `desktop-qa` 检查平台感、布局、密度、状态、键盘、真实数据和主题 |
| `DESIGN.md` | 用户要求生成、更新或遵循桌面设计规范 | Web 设计规范或通用品牌手册 | 生成桌面应用设计契约，不生成模板目录 |

## 输出格式

先给出路由判断，再进入后续工作：

```text
Desktop Taste Routing:
- applies: yes/no
- reason: <一句话说明>
- desktop_read: required/skipped
- platform_depth: <macOS-first / Windows-first / cross-platform desktop>
- evidence_target: <screenshot/runtime/code/DESIGN.md/reference/art direction/draft-ready brief/visual draft/user description>
- target_surface: <main window/settings/inspector/popover/dialog/tray popover/specific window/not needed>
- draft_state: <not needed/needed/exploratory/draft-ready/selected/blocked missing context>
- draft_dimensions: <width x height/window ratio/not needed>
- routes: <audit/redesign/native feel/layout/typography/motion/brand/art direction/visual draft/QA/DESIGN.md>
- out_of_scope: <不处理的非桌面范围>
```

如果 `applies: no`，停止使用本 Skill，并说明应改用什么能力或直接处理原问题。

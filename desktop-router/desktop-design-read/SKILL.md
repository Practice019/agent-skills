---
name: desktop-design-read
description: 在编写或修改桌面 UI 前产出可复用的桌面设计判断。
version: 0.4.0
---

# Desktop Design Read

在写 macOS / Windows 桌面 UI 代码、做重设计、审计或生成 `DESIGN.md` 前，先产出 Desktop Read。它是后续 Skill 和实现工作的设计输入，不是完整设计稿。

本 Skill 同时是桌面 brief gate。它只确认当前设计动作需要的最少上下文；不实现 UI，不创建文件，不生成完整设计系统，也不直接生成设计稿。

## 触发条件

- 入口 `desktop-taste` 判断任务属于桌面 UI/UX
- 用户要新建、修改、重设计或审计桌面应用界面
- 用户要求更原生、更专业、更有品味、更适合长期使用
- 用户要求生成桌面设计稿、visual draft、mockup 或 ImageGen 窗口图
- 需要生成或更新桌面应用 `DESIGN.md`

## 不适用场景

- Web landing、品牌官网、Mobile app
- 后端、发布、签名、安装、自动更新等工程问题
- 只修复不影响 UI/UX 的纯逻辑 bug
- 用户明确要求不要做设计判断，只要机械改动

## 判断维度

必须覆盖以下字段。信息不足时做保守推断，并标注 `assumption`：

- `platform`: macOS、Windows 或 cross-platform
- `platform_depth`: macOS-first、Windows-first 或 cross-platform desktop。macOS-first 可启用更深的 Liquid Glass、SwiftUI scene/window、AppKit 边界和原生组件判断；Windows-first 必须保留 Windows 原生 title bar、command bar、context menu、快捷键、系统主题和 Fluent / Mica / Acrylic 预期。
- `app_archetype`: 工具、编辑器、工作台、启动器、控制台、数据库客户端、创作工具、AI workspace 等
- `user_role`: 普通用户、专业用户、开发者、创作者、研究人员、运营人员等
- `session_context`: 短任务、长时间工作、频繁切换、后台监控、批量处理、深度创作
- `density`: calm、standard、dense、control-room
- `primary_interaction`: 鼠标优先、键盘优先、command-first、drag-and-drop、multi-window、multi-pane
- `evidence_target`: screenshot、runtime、code、DESIGN.md、reference、art direction、draft-ready brief、visual draft、user description 或 missing
- `target_surface`: primary window、secondary window、settings window、utility window、command palette、inspector / side panel、dialog / sheet / popover、menu bar / tray popover、workbench canvas、table / list view、specific window 或 not needed
- `draft_state`: not needed、needed、exploratory、draft-ready、selected 或 blocked missing context
- `draft_dimensions`: `<width>x<height>`、窗口比例 / 预设，或 not needed。常用预设包括 `1440x900 primary window`、`900x640 compact window`、`880x640 settings`、`760x480 command palette`、`420x560 popover`、`560x360 dialog`
- `main_risks`: 网页壳、dashboard 化、过度留白、平台感缺失、状态缺失、真实数据下失效
- `design_thesis`: 这个界面应该给人的一句话感受
- `anti_pattern`: 明确不要像什么
- `next_routes`: audit、redesign、native feel、layout、typography、motion、brand、art direction、visual draft、QA、DESIGN.md 中的后续路由

## Brief Gate

使用两种模式之一，不要两种都做：

- `question mode`：缺少会改变设计判断的信息时，只问缺口。关键缺口包括平台、目标窗口或界面、真实数据规模、主要交互、视觉/证据来源、visual draft 的目标表面 / 状态 / 尺寸、必须保留的功能或不能触碰的约束。
- `playback mode`：信息已足够时，用简短 Desktop Read 回放判断，并说明下一路由；不要重复询问用户已经给出的内容。

Hard boundary：

- brief gate 未完成前，不做大范围 UI 实现、redesign、审计结论或 `DESIGN.md` 生成。
- 纯文字新建或重设计请求没有桌面视觉/证据目标时，先输出 Desktop Read，并把后续路由指向 `desktop-art-direction` 或 `desktop-visual-draft`；不要直接大改 UI。
- 小型机械 UI 修正可以用当前代码和用户描述作为证据目标，但仍要保留平台、密度和状态判断。
- 用户明确要设计稿时，Desktop Read 必须给出 `target_surface`、`draft_state` 和 `draft_dimensions`；如果缺失会改变画面，先问缺口。

## 输出格式

```text
Desktop Read:
- platform: <macOS / Windows / cross-platform>
- platform_depth: <macOS-first / Windows-first / cross-platform desktop>
- app_archetype: <type>
- user_role: <role>
- session_context: <context>
- density: <calm / standard / dense / control-room>
- primary_interaction: <interaction model>
- evidence_target: <screenshot/runtime/code/DESIGN.md/reference/art direction/draft-ready brief/visual draft/user description/missing>
- target_surface: <primary window/secondary window/settings window/utility window/command palette/inspector or side panel/dialog sheet popover/menu bar or tray popover/workbench canvas/table list view/specific window/not needed>
- draft_state: <not needed/needed/exploratory/draft-ready/selected/blocked missing context>
- draft_dimensions: <width x height/window ratio/preset/not needed>
- design_thesis: <one sentence>
- anti_pattern: <one sentence>
- main_risks:
  - <risk>
- next_routes:
  - <route>
- assumptions:
  - <only if needed>
```

## 使用规则

- Desktop Read 必须先于 UI 实现或 redesign 方案出现。
- 后续实现、审计和 `DESIGN.md` 必须引用 Desktop Read 的平台、密度、交互和风险判断。
- 后续 visual draft 必须引用 Desktop Read 的 `target_surface`、`draft_state`、`draft_dimensions` 和 `evidence_target`。
- 在已有项目中，优先复用当前任务相关的 `DESIGN.md`、tokens、样式、组件、截图和平台约束；只有它们正是问题根因时才建议偏离。
- 不要把 Desktop Read 写成视觉风格库；它只决定方向和边界。
- 不要默认选择 `calm` 或大留白。开发者工具、数据工具、研究工具和控制台通常需要更高密度。
- 发现任务其实不是桌面 UI/UX 时，回到 `desktop-taste` 的不适用处理。

## 快速自检

交付前确认：

- 是否明确平台策略，而不是把 macOS 和 Windows 压成通用 Web UI
- 是否明确平台深度；macOS 深度规则没有自动套用到 Windows，Windows 覆盖没有被降级
- 是否明确桌面应用类型和真实用户工作流
- 用户需要设计稿时，是否明确 target_surface、draft_state 和 draft_dimensions
- 是否选择了合理密度
- 是否指出网页壳、dashboard 化、平台感缺失、状态缺失等主要风险
- 是否给后续路由留下可执行输入

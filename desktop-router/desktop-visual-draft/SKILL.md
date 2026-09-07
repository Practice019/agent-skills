---
name: desktop-visual-draft
description: 为 macOS 和 Windows 桌面应用生成可评审的 ImageGen 设计稿，作为实现、redesign 或 DESIGN.md 的视觉目标。
version: 0.1.0
---

# Desktop Visual Draft

本 Skill 用于在 Desktop Read 和必要的 art direction 之后，为 macOS / Windows 桌面应用生成 3 个可评审的 bitmap 设计稿方向。它只生成视觉稿和选择交接，不直接实现 UI、不建立 Figma 流程，也不把桌面应用转成 Web 或 Mobile 设计。

## 触发条件

当任务属于 macOS / Windows 桌面 UI/UX，且出现以下需求时使用本 Skill：

- 用户要求设计稿、视觉稿、mockup、screen concept、ImageGen 方案或多方案视觉探索
- `desktop-design-read` 的 `next_routes` 包含 `visual draft`
- `desktop-art-direction` 已输出可转成图像的方向，需要生成 3 张独立设计稿供选择
- redesign、实现或 `DESIGN.md` 缺少可引用的视觉目标，需要先建立 selected visual draft
- 用户要比较 macOS-first、Windows-first 或 cross-platform desktop 的窗口视觉方案

## 不适用场景

不要用本 Skill 处理：

- Web landing、Mobile app、品牌官网、海报、社媒图、logo 或纯品牌资产
- 直接把设计稿转成代码；实现应交给 redesign、layout、native feel 或项目代码任务
- 只需要文字 art direction，不需要生成图像
- 用户已经提供唯一截图或 Figma，并明确要求按现有视觉实现
- 工程架构、打包、签名、发布、后端、数据模型或自动更新问题

混合任务只处理桌面应用窗口内的视觉稿。非桌面范围写入 `out_of_scope`。

## 前置输入

优先引用已有 Desktop Read。没有 Desktop Read 时，先运行 `desktop-design-read`。

必须具备或保守推断：

- `platform`: macOS、Windows 或 cross-platform
- `platform_depth`: macOS-first、Windows-first 或 cross-platform desktop
- `app_archetype`、`user_role`、`session_context`
- `density` 与 `primary_interaction`
- `target_surface`: main window、settings、inspector、popover、dialog、tray popover、document window、command palette 或具体窗口名
- `draft_state`: populated、empty、loading、error、selected item、multi-select、editing、permission denied、syncing 或其他目标状态
- `draft_dimensions`: 推荐输出尺寸、窗口比例和是否包含窗口 chrome
- `evidence_target`: art direction、draft-ready brief、visual draft、reference、screenshot、runtime、DESIGN.md、code、user description 或 missing

如果还没有可执行视觉方向，先用 `desktop-art-direction` 产出并推荐一个方向；不要从空白文字直接生成平均化 UI。

## 分析方法

1. **绑定窗口目标**：先说明要生成哪个桌面窗口或表面，而不是生成一张泛 UI moodboard。
2. **绑定状态**：每张设计稿必须体现同一个核心工作流状态，或明确说明状态差异；不要只生成空态和漂亮壳。
3. **选择平台材料**：macOS-first 可把 Liquid Glass 作为优先材料策略，但只用于 toolbar、sidebar、sheet、popover 或合适的辅助表面；Windows-first 使用 Windows title bar、command bar、Mica / Acrylic 或系统主题预期；cross-platform 保留两边差异，不压成 Web UI。
4. **生成 3 张独立图像**：默认输出 3 个方向，每个方向一张独立 ImageGen 图像；cross-platform 任务至少覆盖 macOS-forward、Windows-forward 和 cross-platform compromise 的取舍；不要生成小图拼贴、九宫格或把多个窗口塞进同一张图。
5. **控制可实现性**：prompt 必须写清窗口结构、真实数据密度、状态、组件和禁用项；不要依赖不可实现的发光背景、假玻璃、巨型 hero 或营销卡片。
6. **保留选择交接**：用户选择后，把 selected visual draft 记录为后续 redesign、实现、QA 和 `DESIGN.md` 的视觉目标。

## ImageGen Prompt 规则

每个 prompt 至少包含：

- `platform`: macOS / Windows / cross-platform desktop，以及平台特定窗口 chrome 和系统材料边界
- `window`: 目标窗口、尺寸比例、是否包含 titlebar / toolbar / sidebar / inspector / status bar
- `workflow_state`: populated / selected / empty / error / loading 等状态
- `layout`: 主布局、导航、数据区、Inspector、bottom panel 或命令入口
- `density`: calm / standard / dense / control-room，并描述表格、列表、标签和控件节奏
- `visual_direction`: 来自 art direction 的 thesis、signature moment 和反模式
- `material_color_type`: 表面、边框、语义色、accent、字体层级和可读性约束
- `negative_prompt`: 禁止 Web landing、hero、CTA、marketing card grid、generic cards、fake glass、mobile UI、browser chrome 和不可读小字

尺寸建议：

- 通用主窗口：优先 `1536x1024`、`1512x982`、`1440x900` 或等价 16:10；可以展示完整窗口结构和真实数据状态。
- macOS 主窗口：`1512x982`、`1440x900` 或等价 16:10；可以展示系统 titlebar / toolbar / sidebar / inspector。
- Windows 主窗口：`1440x960`、`1366x900` 或等价宽屏；保留 title bar、command bar、系统主题和 Fluent / Mica / Acrylic 预期。
- utility / settings / popover：使用更窄比例，但仍要显示完整窗口边界和关键状态。
- 不要使用手机比例、网页长页面比例或只适合营销海报的竖幅构图。

## 反模式

- 一张图里塞 3 个小 mockup，导致后续实现无法观察细节
- 只换颜色不换布局、密度、状态或平台表达
- 把桌面应用画成 Web SaaS dashboard、landing hero、CTA 区块或三列 feature cards
- macOS-first 过度透明，让正文、表格、错误、focus ring 或 selected state 被 Liquid Glass 吞掉
- 把 Liquid Glass、macOS toolbar 或 AppKit 规则当作 Windows 默认
- 生成品牌海报、空洞氛围图、概念插画或不可交互的静态宣传页
- 让设计稿包含无法实现、无法读取或不属于产品的假数据、假图表和装饰资产
- 把生成图像当作像素级规范；后续实现应吸收结构、密度、状态和方向，不照抄系统 chrome 或随机细节

## 输出格式

```text
Desktop Visual Draft:
- source_read:
  - platform: <macOS / Windows / cross-platform>
  - platform_depth: <macOS-first / Windows-first / cross-platform desktop>
  - app_archetype: <Desktop Read app_archetype>
  - density: <Desktop Read density>
  - primary_interaction: <Desktop Read primary_interaction>
- target_surface: <main window / settings / inspector / popover / dialog / tray popover / specific window>
- draft_state: <populated / selected item / empty / loading / error / editing / permission denied>
- draft_dimensions: <width x height / ratio / window chrome included>
- art_direction_source: <chosen direction / assumption / not available>
- evidence_target: <art direction / draft-ready brief / visual draft / reference / screenshot / runtime / DESIGN.md / code / user description>

Draft Variants:
1. <variant name>
   - thesis: <一句话说明这个视觉稿的桌面主张>
   - best_for: <适用场景>
   - platform_material_strategy: <Liquid Glass / Mica / Acrylic / native surfaces / custom surface boundary>
   - image_prompt: <可直接交给 ImageGen 的完整 prompt>
   - size: <recommended dimensions>
   - negative_prompt: <明确禁止项>
   - implementation_notes:
     - <后续可吸收的结构、密度、状态或组件规则>

2. <variant name>
   - thesis: ...
   - best_for: ...
   - platform_material_strategy: ...
   - image_prompt: ...
   - size: ...
   - negative_prompt: ...
   - implementation_notes:
     - ...

3. <variant name>
   - thesis: ...
   - best_for: ...
   - platform_material_strategy: ...
   - image_prompt: ...
   - size: ...
   - negative_prompt: ...
   - implementation_notes:
     - ...

Selection Handoff:
- selected_visual_draft: <variant name / image id / file path / pending user choice>
- carry_forward:
  - <layout / density / component state / material boundary / signature moment>
- do_not_copy:
  - <random generated text / exact pixels / fake system chrome / unreadable blur / non-product assets>
- next_routes:
  - <redesign / DESIGN.md / QA / implementation-specific route>
- out_of_scope:
  - <non-desktop or engineering scope>
```

## 使用规则

- 生成图像前必须先输出上述 draft brief；图像结果必须和 brief 一一对应。
- 默认生成 3 个方向；用户要求更多时，先说明选择成本，再扩展。
- 设计稿是事实载体，但不是像素规范；后续实现以桌面结构、密度、状态和平台边界为准。
- 生成结果进入 redesign 或 `DESIGN.md` 前，必须有一个 `selected_visual_draft`；未选择时下一步是用户选择或收敛推荐。
- QA 时必须把 selected visual draft 与实现截图 / runtime evidence 对齐到同一窗口、状态、平台和数据密度。

## Preflight Checklist

- [ ] 是否引用 Desktop Read 的平台、平台深度、密度、交互和风险
- [ ] 是否明确 target_surface、draft_state 和 draft_dimensions
- [ ] 是否保留 macOS / Windows 桌面边界，没有变成 Web、Mobile 或品牌海报
- [ ] 是否默认生成 3 张独立、可评审、可实现的设计稿
- [ ] 是否为每张图写清 platform material strategy 和 negative prompt
- [ ] macOS-first 是否把 Liquid Glass 限定在合适表面并保护内容可读性
- [ ] Windows-first 是否保留 title bar、command bar、context menu、系统主题和 Fluent / Mica / Acrylic 预期
- [ ] 是否输出 selected visual draft 的选择交接和不可照抄边界

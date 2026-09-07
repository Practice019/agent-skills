---
name: desktop-art-direction
description: 为 macOS 和 Windows 桌面应用提出、比较并推荐明确的 Art Direction，避免平均化模板 UI。
version: 0.3.0
---

# Desktop Art Direction

本 Skill 用于在 `desktop-design-read` 之后，把桌面应用的产品语境转成 2-3 个可执行的视觉与交互方向。目标不是“更好看”，而是让界面有明确主张、清楚边界和可落地的 signature moment。

## 触发条件

当任务属于 macOS / Windows 桌面 UI/UX，且出现以下需求时使用本 Skill：

- 用户要求设计方向、视觉方向、art direction、产品气质、品牌表达或 UI 风格探索
- 用户说界面太普通、太模板、太像网页壳、太像通用 SaaS dashboard
- 需要在实现前比较 2-3 个桌面设计方向
- 需要为 `desktop-visual-draft` 准备可生成图像的 draft-ready brief
- 需要为 redesign、native feel、layout、typography、motion、brand 或 `DESIGN.md` 提供方向输入
- `desktop-design-read` 的 `next_routes` 包含 brand、visual draft、redesign、layout、motion、typography 或 `DESIGN.md`

## 不适用场景

- Web landing、Mobile app、品牌官网、海报、社媒图或纯 logo 系统
- 只需要修复代码 bug、打包、签名、发布、CI 或后端逻辑
- 用户已经指定唯一视觉方向，只需要照着实现
- 只做可访问性、性能或平台 API 排错，且不改变 UI/UX
- 没有桌面应用窗口、工作流、数据密度或交互状态作为设计载体

若任务混合了桌面 UI 与非桌面范围，只处理桌面应用 UI 内部的 art direction。

## 输入要求

优先引用已有 Desktop Read。没有 Desktop Read 时，先补一个最小 Desktop Read，再进入本 Skill。

必须知道或保守推断：

- `platform`: macOS、Windows 或 cross-platform
- `app_archetype`: 工具、编辑器、工作台、控制台、数据库客户端、创作工具等
- `user_role` 与 `session_context`
- `density` 与 `primary_interaction`
- `design_thesis` 与 `anti_pattern`
- 真实窗口结构：侧边栏、工具栏、表格、Inspector、画布、命令面板、状态栏等
- 设计稿需求存在时的 `target_surface`、`draft_state` 和 `draft_dimensions`

如果用户只有文字需求，没有截图、运行中窗口、现有 UI 代码、`DESIGN.md` 或明确平台参考，本 Skill 可以作为后续实现的视觉/证据目标来源。输出后必须推荐一个方向，或等待用户选择方向；不要从未确认的方向直接进入大范围实现。

## 分析方法

1. 先用一句话说清产品应像什么具体对象或工作场所，不要只堆 `clean`、`modern`、`premium`、`trustworthy`。
2. 为同一产品生成 2-3 个方向，每个方向必须解决同一个桌面工作流，但选择不同的布局、密度、节奏和品牌表达。
3. 每个方向都要有负约束：明确不应该像什么，以及哪些常见 AI UI 习惯会破坏它。
4. 根据用户、平台、任务时长、数据量和输入方式推荐一个最佳方向。推荐要有理由，不要平均保留所有方向。
5. 把方向落到桌面组件：窗口 chrome、标题栏、工具栏、侧边栏、表格、Inspector、panel reveal、selection、focus、empty/loading/error 状态。
6. 如果下一步是 visual draft，把推荐方向压缩成 draft-ready brief：目标表面、窗口状态、尺寸、布局区域、材料 / 颜色、字体层级、要出现的状态和禁止项。

## 最佳实践

- 用具体参照物建立方向，例如“高密度音频工作站”“安静的研究资料台”“工业控制室”“native 文件管理器”“studio-grade creative tool”。
- 让品牌表达进入操作路径：accent color、图标语言、empty state、微文案、状态反馈和 signature interaction，而不是只换 hero、logo 或渐变背景。
- 密度必须服务任务。开发者工具、数据工具和控制台通常需要 `dense` 或 `control-room`，创作工具可以用更强画布感和更少 chrome。
- 字体策略优先考虑桌面可读性：系统字体、清晰数字、表格对齐、标签层级和长时间阅读舒适度。
- 动效服务空间理解和操作确认：panel reveal、selection change、command palette、drag feedback、undo toast、loading skeleton。
- macOS 与 Windows 的差异要说清：标题栏位置、toolbar 语义、菜单与命令入口、focus ring、density、context menu 和系统材质预期。
- signature moment 必须是用户会真实触发或看见的桌面产品瞬间，不是装饰背景。

## 反模式

- 只输出“干净现代、专业高级、简洁可信”这类泛形容词
- 三个方向只换颜色，布局、密度、交互和组件行为完全一样
- 把桌面应用做成 Web SaaS dashboard：大 hero、营销卡片、三列 feature cards、过度留白
- 滥用玻璃、紫蓝渐变、发光 orb、bento card、emoji、假数据大数字和无意义图表
- 为了品牌感牺牲工具效率：低密度、低对比、状态不清、键盘路径缺失
- signature moment 只是加载动画、背景插画或一次性 onboarding，而不参与核心工作流
- 忽略真实数据压力：长列表、空状态、错误状态、批量选择、窗口缩放、多窗和高密度表格

## Preflight Checklist

输出前逐项确认：

- [ ] 是否基于 Desktop Read 的平台、用户、场景、密度和风险
- [ ] 是否提出 2-3 个真正不同的方向
- [ ] 每个方向是否包含适用场景、不适用场景、布局、字体、密度、动效、品牌表达、反模式、signature moment
- [ ] 是否明确推荐一个最佳方向，并说明取舍
- [ ] 是否说明这个应用应该像什么、不应该像什么
- [ ] 是否覆盖桌面组件和状态，而不是只谈颜色和氛围
- [ ] 是否避免通用 Web、Mobile、landing page 和纯品牌设计语言
- [ ] 下一步需要设计稿时，是否输出 draft-ready brief，而不是只给抽象风格词
- [ ] 是否能直接喂给 visual draft、redesign、implementation 或 `DESIGN.md`

## 输出格式

```text
Desktop Art Direction:
- source_read: <引用 Desktop Read 的关键判断，或说明 assumption>
- product_should_feel_like: <具体对象 / 工作场所 / 软件类型>
- product_should_not_feel_like: <明确反面参照>

Directions:
1. <方向名>
   - thesis: <一句话设计主张>
   - applies_when: <适用场景>
   - avoid_when: <不适用场景>
   - layout: <窗口、导航、工具栏、侧边栏、Inspector、表格/画布策略>
   - typography: <字体、字号层级、数字/表格/标签策略>
   - density: <calm / standard / dense / control-room，并说明原因>
   - motion: <反馈、panel、selection、loading、命令入口等动效策略>
   - brand_expression: <品牌如何进入桌面工作流>
   - anti_patterns: <这个方向必须避开的具体模式>
   - signature_moment: <核心工作流里的可实现记忆点>

2. <方向名>
   - thesis: ...
   - applies_when: ...
   - avoid_when: ...
   - layout: ...
   - typography: ...
   - density: ...
   - motion: ...
   - brand_expression: ...
   - anti_patterns: ...
   - signature_moment: ...

3. <方向名，可选>
   - thesis: ...
   - applies_when: ...
   - avoid_when: ...
   - layout: ...
   - typography: ...
   - density: ...
   - motion: ...
   - brand_expression: ...
   - anti_patterns: ...
   - signature_moment: ...

Recommendation:
- chosen_direction: <方向名>
- why: <基于平台、用户、任务时长、数据密度和实现风险的理由>
- tradeoffs: <放弃了什么>
- next_routes: <visual draft/redesign/native feel/layout/typography/motion/brand/DESIGN.md>

Draft-Ready Brief:
- chosen_direction: <方向名>
- target_surface: <main window/settings/inspector/popover/dialog/tray popover/specific window>
- draft_state: <draft-ready / blocked missing context>
- draft_dimensions: <width x height / window ratio / preset>
- platform_depth: <macOS-first / Windows-first / cross-platform desktop>
- window_chrome: <titlebar/toolbar/sidebar/inspector/status bar/platform-specific boundaries>
- layout_zones:
  - <zone>: <role and content>
- density: <calm / standard / dense / control-room>
- materials_and_color: <Liquid Glass / Mica / Acrylic / native surfaces / accent and semantic color boundaries>
- typography: <desktop hierarchy and density notes>
- states_to_show:
  - <populated/selected/error/loading/empty/focus/etc.>
- must_include:
  - <desktop components, real data pressure, signature moment>
- must_avoid:
  - <web landing/mobile/hero/card grid/fake glass/unreadable blur/macOS rules on Windows>

Visual Draft Output:
- artifact: <visual draft / brief-only / missing>
- evidence_target: <visual draft / draft-ready brief>
- usable_for:
  - <redesign / layout / typography / motion / brand / DESIGN.md / QA>
- desktop_boundary: macOS / Windows desktop surface only; no web landing, mobile screen, brand poster, hero page, or marketing card grid
```

如果信息不足，仍给出保守方向，但在 `source_read` 或 `Recommendation` 中标注 `assumption`。不要用信息不足作为回避设计判断的理由。

---
name: desktop-brand-system
description: 让 macOS 和 Windows 桌面应用形成克制、可用、可实现的产品品牌表达。
version: 0.2.0
---

# Desktop Brand System

本 Skill 负责把产品气质落到桌面应用 UI，而不是把窗口做成品牌官网。品牌表达必须服务工具效率、状态识别和长期使用舒适度。

## 触发条件

当 `desktop-taste` 路由到 `brand`，或用户在桌面应用 UI 中提到以下内容时使用本 Skill：

- 品牌感、产品气质、视觉识别、应用辨识度
- `accent color`、semantic color、主题色、状态色
- app icon language、图标语言、插画风格、空状态、onboarding、loading
- command palette personality、微文案、语气、命令命名
- signature interaction、产品专属动效或交互记忆点
- window material、玻璃、毛玻璃、背景材质、平台原生感
- 产品特有符号、行业隐喻、domain motif

使用前必须引用已有 Desktop Read；没有 Desktop Read 时先运行 `desktop-design-read`。

## 不适用场景

- 品牌官网、landing page、广告、社媒图、海报、纯 logo 系统
- 与 macOS / Windows 桌面窗口、导航、状态、工具流无关的品牌战略
- 只需要改 README、市场文案或发布说明
- 用户明确要求按现成品牌手册机械套色，且不需要 UI 判断

混合任务只处理桌面应用 UI 里的品牌表达；营销、传播和纯平面设计部分应交给其他能力。

## 分析方法

1. 先写一句具体引用，而不是堆形容词：`像 <具体产品/对象/专业场景>，但适合 <平台/应用类型/密度>`。
2. 判断品牌要帮助什么：识别产品、区分状态、降低空白尴尬、解释 onboarding，还是让高频操作有记忆点。
3. 只选择 2-3 个品牌载体。优先在 app icon、accent、empty state、microcopy、signature interaction 中选，不要全部铺满。
4. 把品牌色分成 `accent`、`semantic` 和 `surface`：accent 用于选择、当前项和主操作；semantic 只表达状态；surface 只承担窗口层级和阅读舒适度。
5. 为 macOS 和 Windows 分别校准：macOS 可借系统材质和 vibrancy，但必须轻；Windows 可借 Mica / Acrylic / Fluent 语义，但不能遮蔽内容。
6. 用负面约束收窄风格：明确不要像营销页、仪表盘模板、社媒封面、游戏启动器或品牌手册样张。

## 品牌载体规则

- `app icon language`：用一个可在 16-32px 仍成立的轮廓或隐喻；不要把完整 logo、口号或复杂插画塞进图标。
- `accent color`：默认只出现在选中态、焦点环、主操作、进度和关键标记；不要把导航、背景、卡片边框全部染成品牌色。
- `illustration style`：只用于 empty state、onboarding 或少量解释性屏幕；工作区、表格、Inspector 和命令面板不靠插画撑场。
- `empty state tone`：说明下一步可执行动作，语气可以有产品性格，但不写营销承诺。
- `onboarding tone`：短、任务导向、可跳过；解释用户现在能做什么，不写愿景宣言。
- `command palette personality`：命令名优先清楚和可搜索；性格只允许体现在少量动词、分组名或空结果文案。
- `loading state`：高频操作用低调进度、骨架或状态行；只在长任务中加入轻量品牌语气，不能打断工作流。
- `signature interaction`：只选一个可重复感知的交互记忆点，例如 reveal、snap、focus handoff、completion pulse；必须短、可禁用、尊重 reduced motion。
- `window material`：材质用于层级和平台感，不用于炫技。正文和数据区域保持可读，侧栏或标题栏才考虑轻材质。
- `Liquid Glass`：macOS-first 时是现代系统材料的一等策略，优先用于系统 toolbar、sidebar、sheet、popover 和 utility surface；它不是品牌滤镜，也不是 Windows 默认风格。
- `microcopy`：像产品里的同事，不像销售页。写具体对象、动作和结果，避免 “beautiful”、“powerful”、“next-gen”。
- `semantic color rules`：成功、警告、错误、危险、信息必须与品牌色解耦；红色不能因为品牌主色而失去错误语义。
- `product-specific motifs`：从产品对象、行业工具、文件形态、工作流节奏中提取 1 个 motif；它应影响图标、空状态或动效，不应变成满屏纹样。

## 最佳实践

- 用 prose first：先描述品牌如何在桌面工作流中表现，再列颜色、材质或图标约束。
- 用 specific reference：选择具体、可想象的参考物，避免只写“现代、干净、高级、可信”。
- 让品牌表达贴近高频界面：侧栏当前项、命令面板、空状态、状态栏、完成反馈，比大封面更有效。
- 品牌强度按区域递减：入口和空状态最强，主工作区中等，数据密集区最低。
- Liquid Glass、vibrancy、Mica / Acrylic 或自定义材质必须服务平台层级；不要让材料替代产品信息架构或状态语义。
- 保持平台控件的默认可识别性。按钮、菜单、表格、焦点、选择态不为了品牌而变成自绘谜题。
- 对长期使用界面降低饱和度和对比噪音；品牌记忆点靠一致和稀缺，不靠面积。

## 反模式

- 品牌色到处乱用，导致选择态、状态色和装饰色无法区分。
- 大渐变背景、发光光斑、海报式 hero section 占据第一屏。
- 过度玻璃拟态让正文、列表、表格或 Inspector 变得难读。
- fake Liquid Glass：手绘半透明层、重复 blur、发光边框或暗色 scrim 冒充系统材料，破坏 toolbar、sidebar、popover 或内容可读性。
- macOS Liquid Glass 被当成跨平台品牌风格套到 Windows，覆盖 Mica / Acrylic、Fluent 或系统主题预期。
- marketing copy 进入工具界面，例如把空状态写成广告标语。
- 每个状态都插画化，导致专业工具像 onboarding demo。
- 为了“有个性”重命名常规命令，使用户搜不到 `Open`、`Save`、`Export`、`Settings`。
- 把 logo 当作纹样、边框、水印或背景反复铺在工作区。
- 为跨平台一致性牺牲 macOS / Windows 的系统预期。

## Preflight Checklist

交付前逐项确认：

- 已引用 Desktop Read 的 `platform`、`app_archetype`、`density`、`primary_interaction` 和 `anti_pattern`。
- 已写出一句具体品牌引用，而不是形容词堆叠。
- 已限定 2-3 个主要品牌载体，没有把全部界面都品牌化。
- `accent color`、semantic color 和 surface color 的职责互不重叠。
- 品牌色没有覆盖错误、警告、危险等语义状态。
- 插画、empty state、onboarding 和 loading 都提供下一步动作。
- command palette 的命令仍然清楚、可搜索、符合平台习惯。
- signature interaction 短、可重复、可降级，且不影响 reduced motion。
- window material 不损害正文、表格、表单和代码/数据区域可读性。
- macOS-first 时 Liquid Glass 使用位置明确；Windows-first 时没有套用 macOS 材料语言。
- 没有大渐变、过度玻璃、hero section 化或营销文案进入工具界面。

## 输出格式

```text
Desktop Brand System:
- brand_reference: <具体参考物/产品场景，而不是形容词>
- brand_role: <品牌在此桌面工作流中解决的问题>
- carriers:
  - <app icon / accent / empty state / microcopy / signature interaction 等，2-3 项>
- color_rules:
  - accent: <使用位置和禁用位置>
  - semantic: <成功/警告/错误/危险/信息规则>
  - surface: <窗口材质和背景规则>
- voice_rules:
  - empty_state: <语气和动作>
  - onboarding: <语气和动作>
  - command_palette: <命令命名和空结果语气>
- interaction_rules:
  - loading: <等待反馈规则>
  - signature_interaction: <唯一记忆点和降级规则>
- visual_rules:
  - icon_language: <小尺寸成立的图标语言>
  - illustration_style: <只在哪些屏幕使用>
  - product_motif: <产品特有 motif 及禁用方式>
- anti_patterns:
  - <本项目必须避免的 3-5 条>
- preflight_result: pass/fail with notes
```

如果输出会进入 `DESIGN.md`，保留 prose first：先写品牌意图和使用边界，再给 tokens 或组件规则。

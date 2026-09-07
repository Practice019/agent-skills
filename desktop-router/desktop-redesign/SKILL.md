---
name: desktop-redesign
description: 将 macOS 和 Windows 桌面应用审计诊断转成可实现的 redesign 方案。
version: 0.4.0
---

# Desktop Redesign

本 Skill 用于重设计已有 macOS / Windows 桌面应用界面。它从 Desktop Read 和审计诊断出发，把问题转成布局、组件、状态、交互和视觉策略，再给出实现顺序与验证点。目标是改好现有产品，不是借 redesign 做无关重构、重写功能或换一套产品语义。

## 触发条件

当 `desktop-taste` 路由到 `redesign`，或用户提出以下需求时使用本 Skill：

- 重设计已有桌面应用、窗口、工作台、设置页、Inspector、命令面板、表格、侧边栏或工具栏
- 已有界面像网页壳、demo、dashboard、landing page、低密度 SaaS 后台或平台感不足
- 已有 `desktop-audit` / 设计审计结论，需要转成可实现的 redesign
- 需要在不改变核心功能的前提下提升 native feel、layout、typography、motion 或 brand
- 已有 selected visual draft，需要转成可实现的桌面布局、组件、状态和材料边界
- 需要给 coding agent 一个可直接拆任务实现的桌面 UI 改造顺序

## 不适用场景

不要用本 Skill 处理：

- 新建一个没有既有界面、既有流程或既有产品语义的全新应用
- Web landing page、Mobile app、品牌官网、营销页或纯品牌视觉
- 只修业务逻辑、后端、CI、打包、签名、发布、自动更新等工程问题
- 用户要求完全重做产品信息架构、删除功能、改业务模式或重写核心交互合同
- 只需要机械替换颜色、字体、文案或图标，且不需要 redesign 判断

混合任务只处理桌面 UI/UX 范围；业务行为、数据模型和工程架构除非直接影响 UI 可用性，否则保持不变。

## 前置输入

开始前必须引用或补齐这些输入：

- `Desktop Read`：至少包含 `platform`、`app_archetype`、`user_role`、`session_context`、`density`、`primary_interaction`、`design_thesis`、`anti_pattern` 和 `main_risks`。
- 平台深度：macOS-first、Windows-first 或 cross-platform desktop；macOS-first 时必须保留 Liquid Glass、scene/window、toolbar/sidebar/Inspector 和 AppKit 边界判断，Windows-first 时不得套用 macOS 材料规则。
- 现有界面证据：截图、运行中的窗口、代码中的 UI 结构、用户描述或可复现路径。
- 视觉目标：可选的 selected visual draft、draft-ready brief 或 art direction。它们是视觉证据目标，不是像素级实现稿。
- `desktop-audit` 结论：如果已有审计，消费其 findings、severity、证据和建议；如果没有，先做最小诊断，不假装已有审计。
- 约束：必须保留的功能、数据、命令、快捷键、平台、技术栈和不能触碰的文件。

若缺少任何桌面视觉/证据目标，不要直接给大范围实现方案；先回到 `desktop-design-read` 补 brief gate，或用 `desktop-art-direction` 产出并确认一个方向。小型机械修正可用当前代码和用户描述作为证据目标。

引用规则：

- `source_read` 必须明确来自 Desktop Read 的平台、密度、交互和风险判断。
- `audit_source` 必须说明来自 `desktop-audit`、用户截图、代码阅读还是保守假设。
- `selected_visual_draft` 必须拆成可实现契约：布局区域、组件角色、密度、层级、色彩 / 材质意图、状态语义和 signature moment；不得照抄随机文字、假数据、系统 chrome 或不可实现视觉细节。
- 信息不足时用 `assumption` 标注，不要把猜测写成事实。

## 分析方法

按下面顺序工作，不要先挑颜色或组件库：

1. **保留产品语义**：列出现有对象、主要任务、命令、状态和用户已习惯的路径。能保留的先保留，除非它正是问题根因。
2. **归并审计问题**：把 audit findings 合并为 3-6 个 redesign drivers，例如平台感缺失、布局层级不清、密度不匹配、状态缺失、品牌表达无意义、真实数据下失效。
3. **确定 redesign thesis**：用一句话说明新界面要成为哪类桌面工具，以及明确不再像什么。
4. **转成可实现策略**：把每个 driver 转成布局、组件、状态、交互和视觉策略，而不是停在“更专业、更原生、更现代”。
5. **映射设计稿**：如有 selected visual draft，逐项标记 `adopt`、`adapt` 或 `reject`。只吸收对桌面工作流有意义的结构、密度、状态、平台材料和 signature moment。
6. **排定实现顺序**：先改信息架构和结构，再改组件状态与交互，最后做视觉细化。避免先做表面样式导致后续返工。
7. **设置验证点**：每个阶段都要能用截图、真实数据、键盘路径、窗口缩放、主题 / reduced motion 或状态覆盖检查结果。

## Redesign 决策面

### Layout

- 选择一个主布局类型：utility window、sidebar app、two-pane、three-pane、inspector layout、command-first、editor workbench、creative canvas、data cockpit、monitoring console、settings、tray popover、tabbed workspace 或 multi-document。
- macOS-first 时先判定窗口 / scene 角色：WindowGroup 主窗口、Window 辅助窗口、Settings、MenuBarExtra 或 DocumentGroup；再决定 title / toolbar、sidebar、Inspector、popover、sheet、resize、restoration 和 placement。
- 明确保留、移动、合并或删除的区域：title / toolbar、sidebar、main workspace、Inspector、bottom panel、status bar。
- 用真实数据压力测试空态、1 条、10 条、100+ 条、长名称、多选、错误、权限和后台任务。
- 避免把 redesign 变成 card grid、dashboard、网页首页或营销 hero。

### Components

- 把现有功能映射到桌面组件：toolbar、menu、context menu、segmented control、list、table、tree、splitter、popover、dialog、sheet、Inspector、command palette、status bar。
- 同一命令在 menu、toolbar、context menu 和 command palette 中保持名称、快捷键和禁用条件一致。
- macOS toolbar、sidebar 和 Inspector 优先使用系统语义；不要为了视觉统一把 source list 改成卡片墙，或让 Inspector 承担主任务。
- 表格、列表、树、Inspector 和设置表单必须有 clear empty / loading / error / disabled / selected 状态。
- 不为单一页面创建抽象组件库；只抽出重复出现、语义稳定的桌面组件。

### States

- 至少覆盖：hover、focus、selected、active、disabled、loading、empty、error、success、dirty、offline / syncing、permission denied。
- selected 表示持久选择，focus 表示键盘位置，active 表示正在按下或执行；不要用同一种灰色或品牌色混淆。
- 错误和权限状态靠近相关对象，并说明用户下一步；不要只用 toast 或全局 banner。
- 空状态保留产品语义：说明当前对象为空、为什么为空、最相关的下一步是什么。

### Interaction

- 保留用户已掌握的核心路径、快捷键、选择模型和数据编辑模型。
- 为 redesign 后的布局定义鼠标路径、键盘路径、`Esc`、Tab 顺序、方向键、context menu、拖拽、resize splitter 和 undo / redo 反馈。
- command palette、popover、sheet、Inspector 和 panel reveal 必须说明打开来源、关闭方式和焦点返回位置。
- 动效只服务操作确认、状态变化和空间理解；支持 reduced motion。

### Visual Strategy

- 先引用 `desktop-native-feel` 判断平台习惯，再决定哪些区域可表达产品语言。
- macOS-first 时把 Liquid Glass 当作优先材料策略，但只用于合适的系统表面和层级；正文、数据、代码、表单和错误区域必须保持可读。
- AppKit escape hatch 必须说明 owner、状态源和回退条件；不为纯视觉效果扩散 AppKit。
- 先引用 `desktop-layout-composition` 确定窗口结构和真实数据承载，再做视觉层级。
- 先引用 `desktop-typography-density` 确定密度、字号、行高、表格 / 列表节奏，再调整留白。
- 先引用 `desktop-motion-interaction` 确定状态反馈和转场语义，再写 easing 或 duration。
- 先引用 `desktop-brand-system` 选择 2-3 个品牌载体，例如 accent、empty state、microcopy、icon language 或 signature interaction；不要把品牌铺满工作区。
- 如果引用 selected visual draft，把它当作方向约束而非像素规范；系统 chrome、随机生成文字、不可读 blur、假图表和非产品装饰默认需要 adapt 或 reject。

## 实现顺序

推荐按下面顺序交付。范围小时可以合并阶段，但不要反过来先做视觉装饰。

1. **Inventory**：记录现有屏幕、主要对象、命令、状态、快捷键、真实数据规模和 audit findings。
2. **Layout first**：调整窗口区域、导航、主工作区、Inspector、bottom panel、status bar 和 resize 策略。
3. **Component mapping**：把功能落到桌面组件，统一命令入口、选择模型、表格 / 列表 / 树、表单和弹出层。
4. **State coverage**：补齐空、加载、错误、禁用、选中、焦点、同步、权限和脏状态。
5. **Interaction feel**：校准键盘、鼠标、右键、拖拽、面板 reveal、撤销 / 重做、reduced motion。
6. **Visual pass**：收敛 typography、spacing、surface、accent、semantic color、icon、microcopy 和 signature moment。
7. **Verification**：用真实数据、截图和目标平台检查，不用营销页审美替代桌面可用性。

## 验证点

交付 redesign 方案或实现后至少检查：

- Desktop Read 与 redesign thesis 一致，没有偏离平台、用户、密度和交互判断。
- audit findings 已逐条映射为保留、修正、延期或不处理，并说明原因。
- selected visual draft 已被映射为 adopt / adapt / reject，没有把不可实现细节照抄进实现计划。
- 现有核心功能、产品对象、命令名称、快捷键和数据语义没有被无关重写。
- 0 / 1 / 多条真实数据、长文本、多选、错误、权限、同步和后台任务都有可见处理。
- 窗口缩放、splitter、滚动区域、焦点、selected、hover、disabled 和 context menu 可用。
- macOS / Windows 平台习惯、系统主题、accent color、high contrast 和 reduced motion 已考虑。
- macOS-first 已验证 scene/window 角色、toolbar/title、sidebar/Inspector、Liquid Glass 可读性和 AppKit bridge 边界。
- 视觉策略没有落回 Web dashboard、card grid、hero、过度玻璃、品牌色滥用或营销文案。

## 反模式

发现以下情况时直接收窄范围：

- 借 redesign 删除、重命名或重写用户依赖的核心功能
- 只换皮肤，不解决布局、状态、密度、平台感或真实数据问题
- 把所有内容拆成卡片、bento、dashboard 或三列营销网格
- 先建一套抽象设计系统，再回头找使用场景
- 为了统一跨平台而牺牲 macOS / Windows 的窗口、菜单、焦点和快捷键预期
- 用大渐变、毛玻璃、插画、空状态文案或动效掩盖工作区不可用
- 把 ImageGen 设计稿当成像素级规范，照抄随机文字、错误平台 chrome、不可读材料或不存在的产品对象
- 为了 Liquid Glass 或自绘 chrome 破坏 macOS 系统 toolbar、sidebar、sheet、popover、focus 或语义状态
- AppKit bridge 没有明确 owner，重复 SwiftUI 状态源，或把 NSWindow / NSView 泄漏到无关视图层
- 忽略已有 audit 证据，重新凭感觉做一份不相关设计

## 输出格式

```text
Desktop Redesign:
- source_read:
  - platform: <Desktop Read platform>
  - platform_depth: <macOS-first / Windows-first / cross-platform desktop>
  - app_archetype: <Desktop Read app_archetype>
  - density: <Desktop Read density>
  - primary_interaction: <Desktop Read primary_interaction>
  - main_risks: <Desktop Read risks>
- audit_source: <desktop-audit / screenshots / code read / assumption>
- evidence_target: <screenshot/runtime/code/DESIGN.md/reference/art direction/draft-ready brief/selected visual draft/user description>
- selected_visual_draft:
  - source: <image id / file path / prompt / brief / not provided>
  - scope: <window / platform / theme / data state>
  - use_as: <visual evidence target, not pixel spec>
- redesign_thesis: <一句话说明新界面应成为哪类桌面工具>
- preserve:
  - <必须保留的产品语义、功能、命令、数据或用户路径>
- redesign_drivers:
  - <audit finding 或风险> -> <布局/组件/状态/交互/视觉策略>
- layout_strategy:
  - chosen_layout: <layout type>
  - scene_window_role: <macOS scene/window 或 Windows/cross-platform 窗口角色>
  - lifecycle: <resize/restoration/placement/multi-window/settings entry>
  - zone_changes: <保留/移动/合并/新增/删除的窗口区域>
- component_strategy:
  - <toolbar/menu/list/table/tree/inspector/palette/dialog/status bar 等映射>
- state_strategy:
  - <empty/loading/error/focus/selected/disabled/sync/permission 等覆盖>
- interaction_strategy:
  - <keyboard/mouse/context menu/drag/splitter/panel/reduced motion>
- visual_strategy:
  - native feel: <平台判断>
  - liquid_glass: <macOS-first 时的材料策略；其他平台写 not applicable>
  - appkit_boundary: <not needed / narrow bridge + owner/state source>
  - layout: <构图判断>
  - typography: <密度与层级判断>
  - motion: <反馈判断>
  - brand: <品牌载体与禁用项>
- implementation_mapping:
  - adopt:
    - <从 selected visual draft 直接吸收的结构、状态、密度或材料边界>
  - adapt:
    - <需要按平台、可读性、真实数据或工程约束调整的视觉细节>
  - reject:
    - <随机文字、假数据、错误 chrome、不可实现材料或非产品装饰>
- implementation_order:
  - 1. <first change>
  - 2. <next change>
- validation_points:
  - <命令、截图、真实数据或交互检查>
- out_of_scope:
  - <不处理的功能重写、工程架构、Web/Mobile/营销范围>
- assumptions:
  - <only if needed>
```

输出可以压缩，但必须保留 `source_read`、`audit_source`、`preserve`、`redesign_drivers`、`implementation_order` 和 `validation_points`。实现代码时先写这个判断，再动手改 UI。

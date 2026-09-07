---
name: desktop-native-feel
description: 判断并改进 macOS / Windows 桌面应用的原生感，避免界面像网页包壳。
version: 0.2.0
---

# Desktop Native Feel

本 Skill 用于判断桌面 UI 是否像真实 macOS / Windows 应用，并给出最小可落地修正。它不是工程架构 Skill，不处理 Electron / Tauri / SwiftUI / WinUI 的架构选型、打包、签名、发布或自动更新。

## 触发条件

当 `desktop-taste` 路由到 `native feel`，或用户提出以下需求时使用本 Skill：

- 让 macOS / Windows 桌面应用更原生、更不像网页壳或 WebView wrapper
- 审查窗口、标题栏、工具栏、菜单、右键菜单、popover、sidebar、split view、inspector
- 调整焦点、hover、selected、active、disabled、键盘导航、拖拽或输入反馈
- 适配系统主题、系统 accent color、reduced motion、high contrast、系统字体或窗口材质
- 处理加载、空状态、错误状态、完成反馈、撤销 / 重做反馈是否像桌面应用
- 判断某个模式应该更接近 macOS、Windows，还是做跨平台折中

## 不适用场景

不要用本 Skill 处理：

- Web landing page、Mobile app、品牌官网、营销页
- 后端、数据库、认证、CI、性能基础设施或通用工程问题
- 打包、签名、公证、发布、自动更新、安装包、崩溃上报等发布工程
- 纯视觉品牌、logo、海报或没有桌面 UI 载体的素材设计
- 只需要修复业务逻辑、且不影响桌面 UI/UX 的 bug

如果任务混合了工程与 UI，只处理原生感会影响的 UI/UX 决策；工程实现细节留给对应平台或框架能力。

## 前置输入

在分析前必须引用已有 `Desktop Read`。如果当前任务还没有 `Desktop Read`，先运行 `desktop-design-read`，至少确认：

- `platform`: macOS、Windows 或 cross-platform
- `platform_depth`: macOS-first、Windows-first 或 cross-platform desktop
- `app_archetype` 与真实工作流
- `density` 与主要交互方式
- `main_risks` 中是否包含网页壳、平台感缺失、状态缺失或真实数据下失效

## 分析方法

按下面顺序判断，不要直接从颜色或圆角开始：

1. **平台策略**：先决定这是 macOS-first、Windows-first，还是 cross-platform desktop。跨平台不等于压平成通用 Web UI；可共享信息架构，但窗口 chrome、菜单、快捷键和焦点反馈要尊重平台习惯。
2. **窗口结构**：确认窗口角色、标题栏、工具栏、状态栏、侧边栏、split view、inspector 和主内容区是否组成真实桌面工作区，而不是一张网页卡片。
3. **系统入口**：检查菜单栏 / 应用菜单、右键菜单、快捷键、settings、dialog、sheet、popover 是否符合平台预期。
4. **输入与状态**：逐一检查 focus、hover、selected、active、disabled、drag-over、loading、empty、error、success、undo / redo。原生感常败在状态缺失，而不是配色。
5. **系统适配**：确认系统主题、accent color、reduced motion、high contrast、系统字体、滚动条和窗口材质是否跟随 OS，而不是硬编码品牌样式。
6. **产品语言边界**：允许产品有自己的 accent、图标和微文案，但不能替代平台基本行为；品牌表达应发生在内容、空状态、签名交互和局部强调中。

## 最佳实践

### 窗口与标题栏

- 使用真实窗口语义：可拖拽标题栏、系统窗口控制、正确的 resize / minimize / close 行为。
- macOS 保留左侧 traffic lights 和应用菜单；Windows 保留右侧最小化 / 最大化 / 关闭按钮和窗口命令习惯。
- 标题栏只放窗口身份、关键文档状态和少量全局命令；不要塞营销标题或网页 hero。
- 窗口大小、位置、焦点恢复和多显示器行为应可预测。

### macOS Native Depth

- Liquid Glass 是现代 macOS UI 的一等材料策略，优先用于系统支持的 toolbar、sidebar、sheet、popover、utility surface 和窗口层级；它不是跨平台默认风格。
- 先使用系统提供的 SwiftUI / AppKit 控件和材料，让 NavigationSplitView、toolbar、sheet、popover、Inspector 等原生结构自然获得现代 macOS 外观，再考虑自定义 glass surface。
- Liquid Glass 必须服务层级、连续性和可读性：正文、表格、代码、日志、错误和表单区域不能因为透明、模糊或背景延展而降低对比。
- 大型 sidebar、Inspector 或数据区需要更高不透明度和稳定文本层级；不要为了“玻璃感”让选中态、错误态、焦点环和语义色被材料吞掉。
- 自定义 Liquid Glass 只用于产品确实需要的局部 signature surface；不要手绘假玻璃、叠加暗色 scrim、重复模糊层或自绘窗口 chrome。
- macOS-first 不等于忽略 Windows。只有目标平台或 Desktop Read 明确为 macOS-first 时，才把 Liquid Glass 作为优先策略。

### SwiftUI First / AppKit Narrow Bridge

- SwiftUI / 原生场景优先：先检查 scene、toolbar、commands、settings、NavigationSplitView、Inspector、popover、sheet 和系统控件是否已经覆盖需求。
- AppKit 只作为窄 escape hatch：用于 NSWindow / NSPanel、responder chain、menu validation、representable、pasteboard、精细 drag/drop 或 SwiftUI 无法表达的文本系统行为。
- 桥接边界必须小而明确：SwiftUI 保持状态源，AppKit 包在 representable、coordinator 或单一 helper 内；不要让 NSWindow、NSView 或 coordinator 穿透多层视图树。
- 如果只是为了视觉效果、固定尺寸、隐藏标题、模拟材料或绕过布局问题而引入 AppKit，优先退回 SwiftUI / 原生窗口和材料规则。

### 工具栏与菜单

- 工具栏承载高频命令，使用稳定位置、图标或短标签；禁用态必须可见。
- macOS 的全局菜单、Windows 的应用菜单 / command bar / context menu 要使用平台快捷键：例如 macOS 用 `Cmd`, Windows 用 `Ctrl`。
- 右键菜单只放当前对象相关命令；不要把网页浏览器默认菜单暴露给用户。
- 菜单项、工具栏按钮和命令面板里的同一命令应保持同名、同快捷键、同禁用条件。

### Popover、Dialog、Sheet

- popover 用于临时选择或轻量设置，失焦或 `Esc` 应关闭，不应伪装成完整页面。
- 阻塞确认优先使用平台 dialog / sheet；不要默认用带背景遮罩的大型网页 modal。
- dialog 文案要短，主按钮清晰，危险操作使用平台习惯的强调和取消路径。

### Sidebar、Split View、Inspector

- sidebar 放导航或对象集合，selected 状态必须比 hover 更强，且能用键盘移动。
- split view 的分隔线应可拖拽、可恢复合理宽度，并在窄窗口下有退化策略。
- inspector 放当前选中对象的属性和局部操作；没有选中对象时要有明确空状态。
- 不要把所有内容做成 card grid。桌面工作区优先使用列表、表格、树、分栏和面板。

### 焦点与交互状态

- 所有可操作元素必须有清晰的 focus、hover、selected、active、disabled 状态。
- focus ring 应符合平台风格，并支持完整键盘导航；`Esc` 应关闭 popover、取消操作或回到上一级。
- hover 不能一刀切：列表行和 toolbar icon 可有轻微 hover，普通按钮不应像网页按钮一样大幅变色。
- selected 表示持久选择，active 表示按下或正在执行，disabled 表示当前不可用；不要用同一种灰色混淆。
- 文本选择只出现在可编辑或内容阅读区域；窗口 chrome、按钮、标签和标题不应被误选中。

### 系统主题与状态反馈

- 跟随 light / dark、系统 accent color、high contrast 和 reduced motion；不要硬编码唯一品牌蓝或自定义动效。
- 加载小于约 200ms 可不显示；中等等待用 spinner 或 inline progress；长任务用进度、取消和错误恢复。
- 空状态应短：图标、一个说明、一条最相关行动。不要写营销页式大段解释。
- 错误状态要说明发生了什么、用户能做什么、是否可重试；不要只弹 toast。
- 任务完成反馈应靠状态变化、inline confirmation 或系统通知；不要用网页式庆祝动画。

## 反模式

发现以下问题时直接指出，并给出最小修正：

- 手绘标题栏、手绘窗口控制、CSS window shadow 或固定圆角冒充系统窗口
- macOS-first 界面不用系统 toolbar、sidebar、sheet 或 popover，却手绘 Liquid Glass / 毛玻璃来冒充原生材料
- 为了玻璃效果牺牲正文、表格、代码、错误、focus ring、selected state 或语义色可读性
- 视觉需求不明确却把 AppKit 对象散布到 SwiftUI 视图树中，造成重复状态源或无法维护的 bridge
- macOS / Windows 共用一套快捷键、菜单和窗口控制位置
- 把桌面工具做成 landing page：大 hero、巨型卡片、过度留白、装饰渐变
- 所有可点元素统一 `cursor: pointer`、统一 hover 背景、统一圆角按钮
- 用网页 modal、toast、skeleton、route fade 替代平台 dialog、通知和直接状态变化
- sidebar 没有 selected，inspector 没有空状态，split view 不能拖拽或宽度失控
- 禁用态只降低 opacity，导致用户不知道为什么不能操作
- 系统暗色、高对比、reduced motion 或 accent color 切换后界面破裂
- 品牌色压过系统语义色，错误、警告、成功和选择状态无法区分

## Preflight Checklist

交付前至少检查这些项，并只汇报与当前任务相关的失败项：

- [ ] 平台策略明确：macOS、Windows 或 cross-platform 折中
- [ ] 平台深度明确：macOS-first、Windows-first 或 cross-platform desktop；macOS 深度规则没有误套到 Windows
- [ ] 窗口、标题栏、工具栏、菜单和右键菜单符合目标平台
- [ ] macOS-first 时已考虑 Liquid Glass、SwiftUI scene/window、toolbar/sidebar/Inspector 和 AppKit narrow bridge 边界
- [ ] popover、dialog、sheet 的关闭、取消和阻塞语义正确
- [ ] sidebar、split view、inspector 的选中、空状态和 resize 行为明确
- [ ] focus、hover、selected、active、disabled 状态可区分
- [ ] 键盘导航、快捷键、`Esc`、Tab 顺序和列表 type-ahead 可用
- [ ] 系统主题、accent color、high contrast、reduced motion 和系统字体已考虑
- [ ] loading、empty、error、success、undo / redo 反馈不依赖网页式 toast 或营销动效
- [ ] 没有把发布工程、架构选型或打包签名问题混入本 Skill 输出

## 输出格式

分析或交付时使用以下格式；没有问题的分区可以省略：

```text
Desktop Native Feel:
- platform_strategy: <macOS / Windows / cross-platform, with reason>
- platform_depth: <macOS-first / Windows-first / cross-platform desktop>
- native_thesis: <一句话说明这个界面应像哪类桌面应用>
- macos_native_depth:
  - liquid_glass: <used/avoided + reason>
  - swiftui_first: <scene/toolbar/commands/inspector/settings 等判断>
  - appkit_bridge: <not needed / narrow bridge + ownership boundary>
- keep_native:
  - <必须保留的平台习惯>
- product_expression:
  - <允许体现产品语言的位置>
- findings:
  - [severity] <窗口/菜单/状态/系统适配等问题> -> <最小修正>
- preflight:
  - pass: <已满足的关键项>
  - fail: <仍需修正的关键项>
- out_of_scope:
  - <明确不处理的工程或非桌面范围>
```

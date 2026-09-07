---
name: desktop-layout-composition
description: 判断 macOS 和 Windows 桌面应用的布局类型、窗口构图和关键区域使用边界。
version: 0.2.0
---

# Desktop Layout Composition

这是桌面布局与构图专项 Skill。它用于把 Desktop Read 转成可实现的窗口结构：选择合适的布局类型，决定导航、主工作区、工具栏、检查器、底部面板、命令面板、列表 / 表格 / 树和状态栏的取舍。目标是避免默认 card grid、dashboard 和网页式页面结构。

## 触发条件

当任务涉及 macOS / Windows 桌面应用的窗口布局、信息架构或工作区构图时使用本 Skill。典型信号包括：

- Desktop Read 的 `next_routes` 包含 `layout`
- 用户要求设计、重设计或审计 sidebar、split view、Inspector、toolbar、bottom panel、command palette、status bar
- 用户要构建 utility window、sidebar app、two-pane、three-pane、editor workbench、creative canvas、data cockpit、settings、tray popover 或 tabbed workspace
- 界面在真实数据下可能过空、过散、过像网页后台，或默认被做成 card grid / dashboard
- 需要判断 table、list、tree、canvas、editor、console、form 或多窗体之间的主次关系

## 不适用场景

以下任务不要使用本 Skill；混合任务只处理桌面布局部分：

- Web landing page、Mobile app、品牌官网、SaaS 管理后台页面
- 只改颜色、字体、动效、图标、文案，且不改变窗口结构
- Electron / Tauri / SwiftUI / WinUI 的打包、发布、签名、自动更新或后端工程
- 纯视觉 moodboard、logo、海报或营销素材
- 用户明确只要机械修复，不要重新判断 UI/UX

## 前置输入

优先引用 `desktop-design-read` 的结果。没有 Desktop Read 时，先保守补齐这些判断再继续：

- `platform`: macOS、Windows 或 cross-platform
- `platform_depth`: macOS-first、Windows-first 或 cross-platform desktop
- `app_archetype`: 工具、编辑器、工作台、创作工具、数据工具、监控台、设置窗口等
- `session_context`: 短任务、长时间工作、频繁切换、后台监控、批量处理、深度创作
- `density`: calm、standard、dense、control-room
- `primary_interaction`: 鼠标、键盘、command-first、drag-and-drop、multi-window、multi-pane
- 真实数据规模：对象数量、属性数量、层级深度、同时打开的工作项数量

## 分析方法

按下面顺序判断，不要先画卡片或页面：

1. 定义主对象和主动作：用户是在浏览对象、编辑对象、比较数据、控制系统、创作画布，还是快速执行命令。
2. 划分信息层级：稳定导航、当前对象、对象详情、上下文属性、临时输出、系统状态分别放在哪里。
3. 选择布局类型：先选最少区域能承载工作流的类型，再决定是否需要 split、Inspector、bottom panel 或 tabs。
4. 做真实数据压力测试：用 0、1、10、100+ 条记录，长名称，多列，多状态，多选和错误状态检查布局是否仍成立。
5. 检查桌面手感：窗口缩放、键盘焦点、鼠标路径、选择状态、滚动区域、可调整分隔条和平台习惯是否清楚。

## macOS Scene / Window 判断

当 `platform_depth` 是 macOS-first 时，先判断窗口角色，再决定布局组件：

| macOS scene / window | 何时使用 | 布局影响 |
| --- | --- | --- |
| `WindowGroup` / 主窗口 | 常规主应用窗口、可多开或需要启动时出现 | 保留稳定 title / toolbar、主导航、主工作区和状态反馈 |
| `Window` / 辅助窗口 | About、support、utility、单例工具窗口 | 尺寸、恢复、minimize 和关闭行为应匹配短任务 |
| `Settings` | 偏好、账户、权限、连接配置 | 用分类导航 + 表单，避免塞回主工作区 |
| `MenuBarExtra` / tray popover | 即时状态、快捷开关、最近项、短流程 | 内容短、可扫，长内容进入完整窗口 |
| `DocumentGroup` / document window | 独立文档、项目、查询或创作对象 | 文档标题、dirty state、保存、恢复和多窗口策略必须清楚 |

macOS-first 布局优先使用系统 sidebar、toolbar、Inspector、popover、sheet 和 split view。只有需要非常规尺寸控制或系统 API 缺口时，才把实现边界交给 AppKit；不要为了卡片式视觉重做原生 source list。

## 布局类型判断

| 类型 | 何时使用 | 避免 |
| --- | --- | --- |
| utility window | 短任务、单一目标、少量选项或一次性确认 | 塞入多级导航、报表或复杂编辑器 |
| sidebar app | 模块、集合或账户空间需要稳定切换 | 只有一两个入口却放宽侧边栏 |
| two-pane split view | 左侧 list/tree/table 选择对象，右侧查看或编辑详情 | 详情页和列表没有选择关系 |
| three-pane workspace | 导航 / 集合、主内容、上下文详情需要同时可见 | 三栏都放同等重要内容 |
| inspector layout | 当前选择对象有属性、样式、元数据、权限或诊断信息 | 把核心任务藏进 Inspector |
| command-first layout | 高级用户频繁搜索、跳转、执行命令，键盘路径比浏览更快 | 用命令面板替代必要的可见状态 |
| editor workbench | 文件、资源、编辑器、诊断、预览或输出共同组成长时间工作区 | 把每个区域做成独立 dashboard 卡片 |
| creative canvas | 画布、时间线、图层或可拖拽对象是主工作区 | 让工具面板压缩画布或遮挡选择 |
| data cockpit | 用户需要筛选、排序、比较、监控和批量处理密集数据 | 只用图表卡片，缺少表格、过滤和状态 |
| monitoring console | 日志、告警、指标和实时状态需要高密度持续观察 | 用静态 dashboard 展示不可操作摘要 |
| settings window | 分类设置、账户、偏好、权限或连接配置 | 做成营销页或卡片墙 |
| tray popover | 菜单栏 / 托盘里的即时状态、快捷开关和短流程 | 放入深层配置、长表单或多文档工作流 |
| tabbed workspace | 多个文档、查询、会话或任务需要并行保留上下文 | 用 tabs 替代 sidebar 分组或简单模式切换 |
| multi-document interface | 独立文档 / 项目需要并排、跨窗口或跨显示器工作 | 单一上下文却制造多窗口复杂度 |

## 关键组件取舍

| 组件 | 使用条件 | 不使用条件 |
| --- | --- | --- |
| sidebar | 稳定导航、空间切换、集合入口或长期可见的上下文 | 一次性流程、简单工具、只有少量命令 |
| split view | 选择对象和详情需要同时存在，且用户频繁往返 | 主内容只有单一表单或单一页面 |
| Inspector | 属性、元数据、样式、权限、诊断等依附于当前选择 | 这些信息是主任务本身 |
| toolbar | 高频命令、视图切换、过滤、运行、保存、分享等需要就近操作 | 把所有菜单项都复制到工具栏 |
| bottom panel | 日志、终端、错误、输出、预览、队列或诊断需要临时展开 | 长期主内容或无归属杂项 |
| command palette | 命令多、用户熟练、键盘优先、需要快速跳转或跨区执行 | 新手唯一入口或不可见关键状态 |
| table | 多列属性、排序、筛选、比较、批量选择 | 每项只有标题和一句说明 |
| list | 同类对象浏览、少量元数据、选择后看详情 | 需要表达层级或列比较 |
| tree | 文件、目录、分组、依赖或嵌套对象有真实层级 | 扁平集合被强行分层 |
| status bar | 同步、连接、选中数量、光标位置、后台任务、权限或环境状态会影响操作 | 静态信息或装饰性口号 |

macOS-first 组件规则：

- toolbar：放高频命令、视图切换、搜索、过滤和运行状态；同一命令在 menu、toolbar、context menu、command palette 中保持名称、快捷键和禁用条件一致。
- sidebar：优先 source-list 形态，行内只放必要图标、标题和一条辅助信息；richer metadata 进入 detail 或 Inspector。
- Inspector：依附当前选择，放属性、诊断、样式、权限和上下文操作；无选择时给短空态，不承担主任务。
- commands / menus：高频命令可以进入 toolbar，但完整命令路径应保留在菜单或 command palette；不要把所有命令都堆进 toolbar。

## 最佳实践

- 让中心区域承载主工作，不要让导航、卡片或装饰占据最大空间。
- 先设计选择模型：单选、多选、无选择、跨窗选择和空状态会决定 Inspector、toolbar 和 status bar。
- 桌面应用可以高密度，但要有清晰分组、对齐、滚动边界和可调整分隔条。
- 长时间工作区优先保留用户位置：sidebar 状态、打开的 tabs、面板展开状态和当前选择。
- macOS-first 时先让 toolbar、sidebar、Inspector 和 sheet 使用系统结构与材料；自定义 surface 只用于内容区或产品特定区域。
- settings 使用分类导航 + 右侧表单；危险操作、权限和账号状态要有明确区域，不混进普通偏好。
- tray popover 保持轻量：状态、快捷开关、最近项和一个进入完整窗口的入口通常足够。
- creative canvas 让画布优先，工具、图层、Inspector 围绕选择对象服务，不抢主工作区。
- data cockpit 和 monitoring console 需要真实表格、筛选、时间范围、告警和状态，而不是只堆统计卡片。

## 反模式

- 默认把桌面应用做成 card grid、dashboard 或网页首页。
- 用大 hero、营销文案、超大留白或浮动 section 代替工作区。
- 把 sidebar 当装饰导航，或者把 Inspector 当第二个主页面。
- macOS source list 被做成大圆角卡片墙，导致选择、密度和系统材料都失效。
- toolbar、menu、context menu 和 command palette 对同一命令使用不同名称、快捷键或禁用条件。
- Inspector 不跟随当前选择，或者无选择时显示旧对象属性。
- 所有操作都堆进 toolbar，导致命令没有优先级。
- bottom panel 变成杂物箱，无法解释它和当前对象的关系。
- tabs、sidebar、breadcrumb 同时表达同一层级。
- 表格没有排序、筛选、选择、空状态或错误状态。
- 真实数据一多就只剩横向滚动、截断、重叠或无法比较。

## Preflight checklist

交付布局方案或实现前确认：

- 已引用 Desktop Read，或明确写出平台、应用类型、密度和交互假设。
- 已选择一个主布局类型，并说明拒绝的相近布局。
- 已画清窗口区域：title / toolbar、sidebar、main、Inspector、bottom panel、status bar 哪些存在，哪些不存在。
- 已说明 sidebar、split view、Inspector、toolbar、bottom panel、command palette、table/list/tree、status bar 的取舍。
- 已用真实数据规模检查空态、长文本、多选、错误、加载、权限和后台任务。
- 缩放窗口后仍能看清主工作区；可滚动区域和可调整分隔条明确。
- 没有默认 card grid、dashboard、网页式页面结构或营销式 hero。

## 输出格式

使用本 Skill 后输出下面结构；实现代码时先写这个判断，再动手：

```text
Desktop Layout Composition:
- applies: yes/no
- source_read: <Desktop Read 引用或 assumptions>
- chosen_layout: <utility window/sidebar app/two-pane/three-pane/inspector/command-first/editor workbench/creative canvas/data cockpit/monitoring console/settings/tray popover/tabbed workspace/multi-document>
- platform_depth: <macOS-first / Windows-first / cross-platform desktop>
- macos_scene_window: <WindowGroup/Window/Settings/MenuBarExtra/DocumentGroup/not applicable + reason>
- rejected_layouts:
  - <layout>: <为什么不用>
- zone_map:
  - title_toolbar: <exists/omitted + reason>
  - sidebar_or_split: <exists/omitted + reason>
  - main_workspace: <primary work>
  - inspector: <exists/omitted + reason>
  - bottom_panel: <exists/omitted + reason>
  - status_bar: <exists/omitted + reason>
- component_decisions:
  - command_palette: <yes/no + reason>
  - table_list_tree: <table/list/tree/none + reason>
- data_stress:
  - empty: <handling>
  - realistic: <record count/columns/states>
  - overflow: <resize/scroll/truncation strategy>
- risks:
  - <card grid/dashboard/web shell/real data/platform risk>
- preflight: pass/fail with notes
```

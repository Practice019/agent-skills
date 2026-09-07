---
name: desktop-audit
description: 审计已有 macOS / Windows 桌面应用 UI，诊断网页壳、demo 感、不专业、密度不对、平台感不足、真实数据下失效等问题，并给出保留项、禁止改动项、最小可行改法、高水平改法和实现后检查项。用于用户要求 audit、review、critique、inspect、检查、评估已有桌面界面、截图、原型或实现时。
version: 0.2.0
---

# Desktop Audit

本 Skill 用于审计已有桌面 UI，并把问题转成可落地的修正路径。它不是完整 redesign Skill，也不是代码质量 review；只处理 macOS / Windows 桌面应用的窗口、布局、状态、密度、平台感和真实工作流。

## 触发条件

当 `desktop-taste` 路由到 `audit`，或用户提出以下需求时使用本 Skill：

- 审计、评审、检查、诊断已有 macOS / Windows 桌面应用 UI
- 用户提供截图、视频、可运行界面、原型、代码实现或旧设计说明，希望判断哪里不像真实桌面应用
- 需要解释界面为什么像网页壳、demo、不专业、密度不对、平台感不足或真实数据下失效
- 需要在进入 `desktop-redesign` 前先明确保留项、问题优先级、最小修正路径和实现后检查项
- 需要把 native feel、layout、typography、motion、brand 或 anti-slop 专项判断汇总成审计报告

## 不适用场景

不要用本 Skill 处理：

- 没有桌面应用 UI 载体的 Web landing、Mobile app、品牌官网、海报、广告或纯 logo 设计
- 只做代码正确性、安全、性能、测试覆盖或工程架构 review，且不涉及桌面 UI/UX
- 用户明确要求直接实现指定机械改动，不需要 UI/UX 判断
- 打包、签名、发布、自动更新、后端、数据库、同步或账号体系等非 UI 工程问题
- 从零完整重设计且没有已有界面可审计；这类任务应先做 Desktop Read，再进入设计方向或 redesign 流程

混合任务只审计桌面 UI/UX 部分；工程、Web、Mobile 或营销范围必须写入 `out_of_scope`。

## 前置输入

审计前必须引用已有 `Desktop Read`。如果当前任务还没有 Desktop Read，先运行 `desktop-design-read`，至少得到：

- `platform`
- `app_archetype`
- `user_role`
- `session_context`
- `density`
- `primary_interaction`
- `main_risks`
- `design_thesis`
- `anti_pattern`

同时说明证据来源：截图、视频、可运行界面、代码、原型或用户描述。证据不足时仍可审计，但必须标注 `assumption`，不要把猜测写成事实。

## 证据规则

- 只使用当前任务提供或本轮实际读取/捕获的证据；不要用记忆、旧截图或未打开的文件当事实。
- 每个 P0 / P1 / P2 finding 必须绑定 evidence、impact 和 minimum fix。
- 截图只能证明可见布局和状态；不能单独证明键盘路径、无障碍、真实数据承载或动态行为。无法验证时写入 `limits`。
- 代码路径只能证明实现结构；不能替代运行截图或真实交互证据。需要运行证据时写入 `needed_evidence`。
- 用户描述可以作为输入，但与截图、runtime 或代码冲突时，先标注冲突，不把描述升级成事实。

## 分析方法

1. **绑定证据**：列出审计对象、平台、窗口范围和数据状态。不要只凭单个静态截图判断动态状态。
2. **先保留有效部分**：找出现有 UI 中应该保留的工作流、信息架构、命名、密度、平台习惯或品牌线索。审计不是推倒重来。
3. **按风险诊断**：把问题归入网页壳、demo 感、不专业、密度不对、平台感不足、真实数据失效或状态缺失。
4. **拆分改法**：每个主要问题都给出最小可行改法和高水平改法。默认先建议最小改动，除非核心工作流已经错位。
5. **限定不该改什么**：明确哪些有效结构、原生命令、已有用户习惯、真实数据字段或可访问性路径不应被 redesign 破坏。
6. **给实现后检查项**：把检查落到可执行状态：窗口缩放、键盘、真实数据、主题、错误、空态、加载、选择和平台控件。

## 诊断维度

### 网页壳

指出它为什么像 WebView wrapper，而不是只说“不原生”：

- 大 hero、营销文案、卡片墙、装饰渐变或过度留白占据主窗口
- 自绘标题栏、窗口控制、modal、toast、右键菜单或快捷键不符合平台习惯
- 主要区域像网页 route / dashboard section，而不是桌面工作区
- 侧边栏、split view、Inspector、toolbar、status bar 缺失或只是装饰

### Demo 感

说明它在哪些真实任务中会露馅：

- 只有 happy path，没有 loading、empty、error、disabled、offline、permission、undo / redo
- 控件看起来可点但没有状态反馈、焦点路径、快捷键或批量操作
- 数据是短名字、少量卡片和假统计，无法承载长文本、多列、多状态和 100+ 条记录
- onboarding、空状态或插画比主工作区更完整

### 不专业

把“不专业”翻译成可修的问题：

- 对齐、间距、层级、图标尺寸、色彩语义或文案角色不稳定
- 命令命名含糊，用户看不出对象、动作和结果
- 品牌色、状态色和选择态混在一起
- 高风险操作、错误恢复、权限和同步状态没有足够清晰度

### 密度不对

用 Desktop Read 的 `density` 判断，而不是凭喜好判断：

- `calm` 界面仍要像桌面工具，不能变成 landing page
- `standard` 要支持常规列表、表格、过滤、设置和状态
- `dense` / `control-room` 要优先扫描、比较、时间戳、日志、批量操作和状态对齐
- 过松会浪费工作区，过密会破坏命中目标、焦点和错误可读性

### 平台感不足

检查 macOS / Windows 差异：

- 窗口 chrome、traffic lights / caption buttons、菜单、toolbar、context menu、settings、dialog / sheet
- `Cmd` / `Ctrl` 快捷键、Tab 顺序、方向键、`Esc`、type-ahead、focus ring
- 系统字体、accent color、light / dark、high contrast、reduced motion、滚动条和窗口材质
- 平台控件与品牌表达的边界

### 真实数据下失效

至少用这些数据压力测试判断：

- 0、1、10、100+ 条记录
- 长名称、长路径、多列、多标签、多状态、多选、权限差异
- 加载中、部分失败、离线、重试、后台任务、同步冲突
- 窗口窄宽变化、多显示器、失焦后返回、滚动区域嵌套

## 反模式

发现这些模式时必须转成具体证据和最小修正，不要只给审美判断：

- 把桌面窗口做成 Web dashboard、landing page、feature cards 或营销首页
- 主界面依赖泛用圆角卡片、巨大标题、装饰渐变、过度玻璃、低密度表格或假数据
- 没有键盘路径、没有焦点态、selected / hover / active 状态混用
- macOS 和 Windows 被压成平台中性的网页 UI，窗口、菜单、快捷键、系统字体和 dialog 行为都不像目标平台
- 空态、加载、错误、权限、离线、撤销 / 重做、后台任务和真实数据压力都没有设计
- 审计建议一上来推倒重来，误删有效工作流、真实字段、平台习惯或用户已经熟悉的路径

## 复用专项判断

审计时可以调用或复用这些 Skill 的判断，但不要假装修改它们：

- `desktop-native-feel`：用于窗口、菜单、平台控件、系统状态、焦点和网页壳诊断。
- `desktop-layout-composition`：用于信息架构、split view、Inspector、表格 / 列表 / 树和真实数据承载能力。
- `desktop-typography-density`：用于字号层级、行高、表格密度、状态文案和长期可读性。
- `desktop-motion-interaction`：用于 hover、focus、selected、active、loading、error、drag、resize 和 reduced motion。
- `desktop-brand-system`：用于 accent、semantic color、empty state、microcopy、图标语言和品牌不过载。
- `anti-slop` 判断：删除或降级没有服务工作流的装饰、假数据、模板卡片、泛文案、无状态控件和一次性 demo 设计；保留能提高任务效率、平台一致性和真实数据承载能力的部分。

如果某个专项是主要风险，先运行对应 Skill 得到专项结论，再把结论压缩进审计报告。不要把本 Skill 扩写成所有专项 Skill 的副本。

## 输出格式

```text
Desktop Audit:
- source_read:
  - platform: <引用 Desktop Read>
  - app_archetype: <引用 Desktop Read>
  - density: <引用 Desktop Read>
  - primary_interaction: <引用 Desktop Read>
  - main_risks: <引用 Desktop Read>
- evidence:
  - <截图/视频/runtime/code/prototype/user description + 范围>
- limits:
  - <截图、代码或描述无法证明的交互、可访问性、真实数据或运行状态>
- verdict: <一句话说明当前 UI 最大问题和优先修正方向>

- keep:
  - <应该保留的工作流、结构、平台习惯、状态、密度或品牌线索>

- problem_diagnosis:
  - [P0/P1/P2] <web_shell/demo_feel/unprofessional/density_mismatch/platform_gap/real_data_failure/state_gap>: <症状>
    evidence: <具体截图/步骤/代码路径/描述>
    impact: <为什么影响桌面工作流>
    minimum_fix: <最小可行修正>

- change:
  - <应该改的窗口、布局、状态、文字、密度、平台或品牌问题>

- do_not_change:
  - <不应改掉的有效结构、原生行为、真实字段、用户习惯或可访问性路径>

- minimum_viable_fix:
  - <最小可行改法，能用少量实现修掉核心问题>

- high_level_fix:
  - <更高水平但更大范围的改法，说明何时值得做>

- specialist_reuse:
  - native_feel: <used/needed/skipped + reason>
  - layout: <used/needed/skipped + reason>
  - typography: <used/needed/skipped + reason>
  - motion: <used/needed/skipped + reason>
  - brand: <used/needed/skipped + reason>
  - anti_slop: <删除/保留/降级的判断>

- implementation_checks:
  - <实现后必须检查的窗口、键盘、状态、真实数据、主题或平台项>

- out_of_scope:
  - <明确不处理的 Web、Mobile、发布工程、后端或完整 redesign 范围>
```

## 优先级规则

- `P0`：阻断核心任务、破坏数据可信度、导致危险操作不清楚，或真实数据下主界面不可用。
- `P1`：让界面明显像网页壳、demo，或破坏平台预期、键盘路径、状态反馈和密度。
- `P2`：视觉一致性、品牌表达、微动效、文案精度等不会阻断任务但会降低专业度的问题。

默认先修 P0 / P1；P2 只在不扩大范围时一起处理。

## 实现后检查项

交付审计修复后至少检查：

- 是否仍引用同一个 Desktop Read，且平台、密度和主交互没有漂移
- 0 / 1 / 10 / 100+ 条记录、长文本、多列、多状态、多选是否可用
- hover、focus、selected、active、disabled、loading、empty、error、success 是否可区分
- `Tab`、方向键、`Esc`、快捷键、context menu 和焦点恢复是否符合平台
- light / dark、high contrast、reduced motion、系统字体和 accent color 是否没有破裂
- 窗口缩放、splitter、滚动区域、侧边栏、Inspector 和 status bar 是否稳定
- 最小改法有没有误删有效工作流、真实字段、平台习惯或可访问性路径

---
name: desktop-motion-interaction
description: 设计和审查 macOS / Windows 桌面应用的动效、状态反馈与交互手感。
version: 0.2.0
---

# Desktop Motion & Interaction

本 Skill 用于判断桌面 UI 的动效和交互反馈是否服务真实操作。桌面动效应帮助用户确认操作、理解状态变化和保持空间定位；它不是品牌展示、营销滚动或装饰动画 Skill。

## 触发条件

当 `desktop-taste` 路由到 `motion`，或用户提出以下需求时使用本 Skill：

- 调整 hover、focus、selected、active、disabled、drag-over 等交互状态
- 设计 command palette reveal、panel reveal、inspector transition、popover 或 drawer 的出现 / 消失
- 改进 drag-and-drop、resize splitter、列表选择、键盘导航或鼠标按压手感
- 处理 loading、task completion、error recovery、undo / redo 的反馈方式
- 校准 macOS command/menu/focus、source-list selection、Inspector/panel reveal、popover/sheet 焦点返回
- 让桌面应用更快、更稳、更有响应感，避免像网页动画模板
- 适配 `prefers-reduced-motion`、系统 reduced motion、high contrast 或键盘用户

## 不适用场景

不要用本 Skill 处理：

- Web landing page、营销页、滚动叙事、视差滚动或广告动效
- Mobile app 手势动画、游戏动画、角色动画或复杂物理模拟
- 动画库选型、渲染性能工程、打包、发布或 CI
- 纯品牌片头、logo 动画、社媒素材或没有桌面 UI 载体的视觉包装
- 只需要修业务逻辑、且不改变 UI 状态反馈的 bug

如果任务混合了工程与 UI，只处理动效和交互反馈会影响的桌面 UX 决策；性能或框架细节留给对应工程能力。

## 前置输入

在分析前必须引用已有 `Desktop Read`。如果当前任务还没有 `Desktop Read`，先运行 `desktop-design-read`，至少确认：

- `platform`: macOS、Windows 或 cross-platform
- `app_archetype` 与真实工作流
- `density` 与主要交互方式
- `primary_interaction`: 鼠标、键盘、command-first、drag-and-drop、多面板或多窗口
- `main_risks` 中是否包含状态缺失、网页壳、平台感缺失或真实数据下失效

## 分析方法

按下面顺序判断，不要先挑 easing 或 duration：

1. **操作意图**：明确用户正在点击、选择、拖拽、搜索、调整尺寸、提交任务、撤销还是恢复错误。没有操作意图的动画先删除。
2. **状态语义**：区分 hover、focus、selected、active、disabled、loading、success、error、undoable。每种状态只能表达一个意思。
3. **空间关系**：判断 command palette、panel、inspector、popover、sheet 从哪里来、影响哪块区域、关闭后焦点回到哪里。
4. **输入路径**：同时检查鼠标、触控板、键盘、快捷键和辅助功能路径；focus 不能只为鼠标 hover 服务。
5. **时间预算**：桌面工具优先响应感。即时状态要快，结构变化要清楚，长任务要可取消和可恢复。
6. **系统适配**：确认 reduced motion、high contrast、系统 accent color 和平台焦点样式可用。

## 最佳实践

### 基础交互状态

- hover 只提示“可交互”或“当前命中对象”，不要让列表、表格和工具栏大面积跳动。
- focus 表示键盘当前位置，必须比 hover 更稳定；焦点移动应可预测，并能通过 `Tab`、方向键和 `Esc` 回退。
- selected 表示持久选择，视觉强度应高于 hover，且在窗口失焦时仍可识别。
- active 表示按下、拖动中或命令正在执行；按下反馈要短，不能伪装成已完成。
- disabled 需要解释或暴露原因；不要只降透明度到难以阅读。

### Reveal 与转场

- command palette reveal 应轻、快、居中或贴近命令入口；打开后焦点立即进入输入框，关闭后回到触发位置。
- panel reveal 要表达空间关系：侧栏从侧边进入，底部日志从底部展开，popover 从触发控件附近出现。
- inspector transition 应跟随 selected 对象变化；内容可淡入或滑入，但不能让用户丢失当前对象身份。
- macOS source-list selection、toolbar command、menu command 和 command palette 对同一对象的执行反馈应一致；焦点、选中和执行中状态不能混用。
- Inspector / panel reveal 必须保留对象关系：打开来源、当前选择、关闭方式和焦点返回位置都要明确。
- popover 和 sheet 遵循平台关闭路径：`Esc`、失焦、取消按钮或系统关闭行为；不要用网页式全屏遮罩替代。
- 弹出层关闭优先响应 `Esc`、失焦和平台关闭行为；不要用网页式全屏遮罩替代桌面 popover、panel 或 sheet。

### 拖拽与尺寸调整

- drag-and-drop 必须提供 drag start、drag over、valid / invalid target、drop preview 和 drop result。
- 拖拽预览要说明将移动、复制、链接还是重新排序；跨区域拖拽时目标位置必须可见。
- resize splitter 要有可命中的分隔线、hover / active 状态、最小 / 最大尺寸和双击或重置策略。
- split view、sidebar、inspector 调整尺寸时内容不应抖动；窄窗口下要有明确折叠或滚动策略。

### 加载、完成与错误恢复

- 小于约 200ms 的等待通常不显示 loading，避免闪烁；更长等待使用 inline spinner、progress 或 skeleton 的最小版本。
- 长任务需要进度、取消、重试或后台状态；不要只丢一个 toast。
- task completion 优先通过对象状态变化、inline confirmation、状态栏或系统通知表达；不要用庆祝动画打断工作流。
- error recovery 要说明失败点、影响范围、下一步和是否可重试；错误反馈不能只靠颜色或震动。
- undo / redo 需要让用户看见被撤销或恢复的对象，并保持命令名、快捷键和状态栏反馈一致。

### Reduced Motion

- 支持系统 reduced motion：保留状态变化，移除大位移、缩放、弹跳、视差和循环动画。
- reduced motion 下用即时切换、轻微淡入、边框 / 高亮 / 文案反馈替代移动转场。
- loading 和进度反馈不能在 reduced motion 下消失；改用静态进度、文本状态或系统控件。
- 不要把 reduced motion 当作“关闭所有反馈”；用户仍需要确认操作结果和错误恢复路径。

## 反模式

发现以下问题时直接指出，并给出最小修正：

- 为了“高级感”给所有页面加 route fade、scroll reveal、视差、弹跳或渐变动效
- hover、focus、selected、active 使用同一种背景色，导致状态语义混乱
- selected 只在 hover 时可见，窗口失焦或键盘导航时丢失选择
- macOS sidebar selection、focus ring 和 active command 共用一种高亮，导致用户分不清当前对象、键盘位置和执行状态
- Inspector 或 panel reveal 后焦点停在触发按钮，键盘用户无法进入新区域或关闭后无法回到原对象
- command palette 像网页 modal 一样慢慢浮现，打开后焦点没有进入输入框
- panel / inspector 从任意方向出现，用户无法理解它和当前对象的关系
- drag-and-drop 没有合法目标、放置预览、失败反馈或撤销路径
- resize splitter 命中区域过窄、没有 active 状态，或拖动后布局失控
- loading、success、error 全靠 toast，主工作区状态没有变化
- 错误用抖动或红色闪烁替代可恢复说明
- undo / redo 只改数据，不给对象级视觉确认
- reduced motion 下仍保留大位移、缩放、循环动画或自动播放动效

## Preflight Checklist

交付前至少检查这些项，并只汇报与当前任务相关的失败项：

- [ ] 已引用 `Desktop Read` 的平台、密度、主要交互方式和风险
- [ ] hover、focus、selected、active、disabled 的语义可区分
- [ ] command palette reveal 的焦点进入、关闭和焦点恢复正确
- [ ] macOS-first 时 menu、toolbar、command palette、context menu 的命令反馈和焦点返回一致
- [ ] panel reveal 与 inspector transition 表达了空间来源和对象关系
- [ ] drag-and-drop 覆盖 start、over、valid / invalid target、preview、result 和 undo
- [ ] resize splitter 有可命中区域、hover / active、尺寸约束和退化策略
- [ ] loading、task completion、error recovery、undo / redo 都落在工作流内，而不是只靠 toast
- [ ] reduced motion 下仍保留操作确认、状态变化和错误恢复
- [ ] 没有营销页式滚动动效、装饰动画或大面积页面转场
- [ ] 没有把动画库、性能工程、发布工程或非桌面范围混入本 Skill 输出

## 输出格式

分析或交付时使用以下格式；没有问题的分区可以省略：

```text
Desktop Motion & Interaction:
- platform_strategy: <macOS / Windows / cross-platform, with reason>
- motion_thesis: <一句话说明动效如何服务操作确认、状态变化或空间理解>
- interaction_states:
  - <hover/focus/selected/active/loading/error 等状态判断>
- spatial_transitions:
  - <command palette/panel/inspector/popover 的来源、关闭和焦点恢复>
- findings:
  - [severity] <问题> -> <最小修正>
- reduced_motion:
  - <保留的反馈> / <移除或替代的运动>
- preflight:
  - pass: <已满足的关键项>
  - fail: <仍需修正的关键项>
- out_of_scope:
  - <明确不处理的工程、Web、Mobile 或营销动效范围>
```

---
name: desktop-design-md
description: 生成或更新 macOS / Windows 桌面应用项目中的 DESIGN.md，记录可延续的桌面 UI/UX 设计契约。
version: 0.3.0
---

# Desktop DESIGN.md

本 Skill 用于在用户项目中生成或更新桌面版 `DESIGN.md`。它把 Desktop Read、设计主张、平台策略、窗口结构、组件规则和后续 Agent 延续方式写成可复用契约，不是生成 Web 设计系统、品牌官网规范或营销 landing 内容。

可以引用计划中的模板路径 `templates/DESIGN.md` 作为未来模板位置；如果仓库中尚未存在该模板，不要创建模板文件，也不要把本 Skill 扩大成模板系统。

## 触发条件

当 `desktop-taste` 路由到 `DESIGN.md`，或用户提出以下需求时使用本 Skill：

- 生成、更新、补齐或遵循桌面应用 `DESIGN.md`
- 为 macOS / Windows / cross-platform 桌面应用沉淀设计规范
- 在实现前记录窗口、布局、密度、组件、状态、动效和品牌规则
- 把 selected visual draft、draft-ready brief 或 art direction 转成可延续的桌面设计契约
- 让后续 Agent 能延续同一桌面 UI/UX 方向，而不是每次重新发明界面
- 把 Desktop Read、art direction、native feel、layout、typography、motion 或 brand 结论整理成项目文档

## 不适用场景

不要用本 Skill 生成：

- Web landing page、品牌官网、SaaS 营销页或移动端设计规范
- hero section、CTA、feature sections、responsive web breakpoints、marketing card grid
- 纯品牌手册、logo 规范、广告视觉或社媒模板
- Electron / Tauri / SwiftUI / WinUI 的打包、签名、发布、CI 或后端工程手册
- 和桌面窗口、工作流、状态、键鼠路径无关的通用设计文章

如果用户项目同时包含 Web 与桌面端，只处理桌面应用 `DESIGN.md`；Web 范围必须明确标注为 out of scope。

## 前置输入

优先引用已有 `Desktop Read`。没有 Desktop Read 时，先运行 `desktop-design-read`，至少得到：

- `platform`: macOS、Windows 或 cross-platform
- `platform_depth`: macOS-first、Windows-first 或 cross-platform desktop
- `app_archetype` 与真实用户工作流
- `user_role`、`session_context`、`density`、`primary_interaction`
- `design_thesis`、`anti_pattern`、`main_risks`

如项目已有 UI、截图、设计说明或旧 `DESIGN.md`，先读取现有事实，保留仍有效的设计约束；不要用新文档覆盖真实产品行为。

如存在 selected visual draft，必须记录它的来源、适用窗口、平台、主题、数据状态、选择理由和不可照抄边界。设计稿只提供视觉目标和结构证据，不是像素级规范。

## 分析方法

1. 先写设计主张，再写 token 或组件细节。`DESIGN.md` 必须说明这个桌面应用应该像什么、服务谁、在哪种工作流里成立。
2. 每条规则都要能指导后续 Agent 做取舍。避免只写“现代、简洁、高级、专业”等不可执行形容词。
3. 规则必须落到桌面对象：窗口、标题栏、工具栏、侧边栏、split view、Inspector、表格、列表、命令面板、状态栏、popover、dialog、焦点和选择状态。
4. 如果消费 selected visual draft，先提炼可实现契约：布局、组件角色、密度、材料边界、状态语义和 signature moment；随机生成文字、错误平台 chrome、假数据、不可读 blur 和非产品装饰必须标记为不照抄。
5. macOS 与 Windows 的差异要写清。cross-platform 可以共享信息架构，但不能把平台习惯压成通用 Web UI。
6. macOS-first 可以更深入记录 Liquid Glass、SwiftUI scene/window、toolbar/sidebar/Inspector 和 AppKit narrow bridge；这些规则不能默认套用到 Windows。
7. Windows-first 必须保留 title bar、command bar、context menu、快捷键、系统主题、Mica / Acrylic 或 Fluent 预期，不被 macOS 材料语言覆盖。
8. 设计密度服务真实数据。用空态、1 条、10 条、100+ 条、长名称、多选、错误、加载和窄窗口检查文档是否可实现。
9. 只记录当前项目需要的规则。不要写未来也许会用到的组件库、主题引擎或完整设计系统。

## DESIGN.md 结构

生成或更新 `DESIGN.md` 时使用以下目录。可以压缩无关细节，但不要删除这些一级主题。

```markdown
# DESIGN.md

## 1. 桌面设计主张
## 2. 平台目标
## 3. 窗口与表面系统
## 4. 布局语法
## 5. 排版
## 6. 间距与密度
## 7. 色彩与材质
## 8. 组件
## 9. 动效与交互手感
## 10. 品牌表达
## 11. Anti-Slop 规则
## 12. Agent 实现指南
```

### 1. 桌面设计主张

记录：

- 一句话设计主张：这个应用应给人的具体桌面感受
- 用户、场景、任务时长和信息密度
- 主要工作流和最重要的对象
- selected visual draft 的来源、适用窗口 / 状态、选择理由和不可照抄边界
- 正面参照：像哪类专业工具、工作台或系统应用
- 负面参照：明确不要像什么

不要写成愿景宣言、营销口号或品牌 slogan。

### 2. 平台目标

记录：

- 目标平台：macOS、Windows 或 cross-platform
- 平台深度：macOS-first、Windows-first 或 cross-platform desktop
- 平台优先级和折中策略
- 菜单、快捷键、窗口控制、系统字体、accent color、主题、高对比和 reduced motion 策略
- 哪些行为必须跟随平台，哪些区域允许产品语言
- macOS-first 时记录 Liquid Glass 使用位置、SwiftUI scene/window 角色、AppKit bridge owner 和回退条件

### 3. 窗口与表面系统

记录：

- 主窗口、辅助窗口、popover、dialog、sheet、Inspector、bottom panel、status bar 的角色
- macOS-first 时记录 WindowGroup、Window、Settings、MenuBarExtra 或 DocumentGroup，及 resize、restoration、placement、多窗口和 settings entry 策略
- titlebar、toolbar、sidebar、split view 和主工作区如何分层
- surface 层级、边框、材质、阴影、背景和滚动区域边界
- Liquid Glass、Mica / Acrylic 或自定义材质只承担层级和平台感；正文、表格、代码、错误和表单必须保持可读
- 空态、加载、错误、离线、权限不足和长任务状态放在哪里

### 4. 布局语法

记录：

- 选定布局类型：utility window、sidebar app、two-pane、three-pane、editor workbench、data cockpit、settings 等
- zone map：title / toolbar、navigation、main、Inspector、bottom panel、status bar
- 列表、表格、树、画布、表单、日志、命令面板的使用条件
- 窗口 resize、splitter、折叠、滚动和真实数据压力策略

### 5. 排版

记录：

- app title、window title、toolbar label、section label、sidebar item、body、metadata、table/list row、code/log、caption、status、error 的层级
- 字号、行高、字重、截断、换行、数字和路径显示策略
- 何处使用系统字体，何处可使用 monospace
- 禁止 hero-scale type 进入普通桌面工作区

### 6. 间距与密度

记录：

- density 档位：calm、standard、dense 或 control-room
- toolbar、sidebar、list row、table row、panel、form、dialog 和 status bar 的密度取向
- 信息密集区如何保持扫描、对齐和命中目标
- 哪些留白是结构需要，哪些大留白应避免

### 7. 色彩与材质

记录：

- accent、semantic、surface、border、text 和 selection 的职责
- light / dark、高对比、系统 accent color 和平台材质策略
- success、warning、error、danger、info 不得被品牌色覆盖
- 材质和透明只用于层级或平台感，不牺牲正文、表格、代码和表单可读性

### 8. 组件

记录当前项目真实需要的组件规则，例如：

- titlebar、toolbar、sidebar、split view、Inspector、command palette
- macOS toolbar/sidebar/Inspector 的系统语义、命令一致性、source-list 密度和当前选择绑定
- table、list、tree、tabs、segmented control、search、filter、empty state
- popover、dialog、sheet、toast 或 inline notification
- focus、hover、selected、active、disabled、loading、error、success 状态

只写会被实现或维护的组件。不要列完整组件库清单。

### 9. 动效与交互手感

记录：

- 动效主张：服务操作确认、状态变化和空间理解
- hover、focus、selected、active、drag、resize、panel reveal、command palette reveal 的反馈规则
- loading、completion、error recovery、undo / redo 的反馈位置
- duration、easing 或 reduced motion 规则，只在项目确实需要时写
- 禁止营销滚动动效、route fade、视差、弹跳和装饰动画进入桌面工作流

### 10. 品牌表达

记录：

- 品牌在桌面工作流中解决什么问题：识别、状态区分、空态指导、命令气质或 signature interaction
- 2-3 个主要品牌载体：app icon language、accent、empty state、microcopy、signature interaction、product motif 等
- 品牌强度按区域递减：入口和空态可更强，主工作区和数据区要克制
- 禁止把窗口做成品牌官网、海报或营销首页

### 11. Anti-Slop 规则

至少列出本项目必须避免的具体反模式。优先从这些里选择：

- landing page inside app
- giant hero in application UI
- Web dashboard inside desktop window
- generic rounded cards everywhere
- marketing card grid
- fake glassmorphism
- low-density tables
- no keyboard path
- no focus state
- selected / hover / active 混用
- platform-neutral UI that feels native nowhere
- empty state 好看但 populated state 不可用
- brand decoration without product meaning

### 12. Agent 实现指南

写给后续 Agent，必须包含：

- 开始实现前要读取 `DESIGN.md` 和 Desktop Read
- 新增 UI 时先说明它继承哪些 thesis、platform、layout、density、component 和 motion 规则
- macOS-first 新增 UI 时先说明 scene/window 角色、Liquid Glass 是否适用、AppKit 是否需要以及状态 owner 在哪里
- 变更设计规则时更新 `DESIGN.md`，不要只改代码
- 当实现需要偏离设计主张时，记录偏离原因、影响范围和回退条件
- 不要默认生成 Web landing 内容；桌面应用第一屏应是可工作的窗口、工作区或任务入口
- 验证时至少检查真实数据、键盘路径、焦点、选择态、错误态、窗口 resize 和目标平台主题

## 输出格式

使用本 Skill 时，先给出简短路由判断，再生成或更新文档：

```text
Desktop DESIGN.md:
- source_read: <Desktop Read 引用或 assumptions>
- selected_visual_draft: <image id / file path / prompt / brief / not provided>
- visual_target_scope: <platform / target window / theme / data state / selected by>
- target_file: <用户项目中的 DESIGN.md 路径>
- action: <create/update>
- platform: <macOS / Windows / cross-platform>
- platform_depth: <macOS-first / Windows-first / cross-platform desktop>
- thesis: <一句话设计主张>
- out_of_scope:
  - <Web landing / Mobile / marketing / engineering 等不处理范围>
```

然后写入 `DESIGN.md`。如果只更新部分章节，在回复中说明更新了哪些章节和没有动哪些章节。

## Preflight Checklist

交付前确认：

- [ ] `DESIGN.md` 包含 12 个一级主题或明确保留等价结构
- [ ] 已记录 design thesis、platform、window/surface、layout、typography、spacing、color/materials、components、motion、brand、anti-slop 和 Agent guide
- [ ] 如使用 selected visual draft，已记录来源、适用窗口、选择理由、可吸收契约和不可照抄边界
- [ ] 后续 Agent 能根据文档延续设计，而不是只看到风格形容词
- [ ] 没有默认生成 Web landing、hero、CTA、responsive web breakpoints 或 marketing card grid
- [ ] 规则来自当前桌面项目事实、Desktop Read 和必要 assumptions
- [ ] 文档没有承诺未实现的组件库、主题系统或跨平台工程能力

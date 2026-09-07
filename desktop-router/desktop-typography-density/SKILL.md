---
name: desktop-typography-density
description: 校准 macOS 和 Windows 桌面应用的 typography、spacing 与 density。用于处理字号层级、文字角色、行高、表格/列表密度、工具栏标签、元信息、状态/错误文案、代码/日志文本，以及避免网页营销页式大标题、过大留白、低密度表格和小字号不可读的问题。
version: 0.2.0
---

# Desktop Typography Density

用本 Skill 把桌面应用的文字层级、间距节奏和信息密度调整到适合长期工作的状态。它服务真实窗口、工具栏、侧边栏、表格、列表、日志、状态栏和面板，不服务营销页视觉冲击。

## 触发条件

在 `desktop-taste` 或 `desktop-design-read` 判断任务属于桌面 UI/UX 后，遇到以下信号时使用：

- 用户要求调整字号、行高、留白、表格密度、列表密度、层级、可读性或信息密度
- 界面像 landing page、SaaS 首页、卡片太松、标题过大、真实数据放不下
- 需要定义或审查 app title、window title、toolbar label、section label、sidebar item、body、metadata、table/list row、code/log、caption、status、error 的文字规则
- macOS-first 界面需要校准 source-list row、Inspector 表单、toolbar label、metadata、Liquid Glass 表面上的可读性
- 需要生成或更新桌面应用 `DESIGN.md` 中的 Typography 或 Spacing & Density 部分

## 不适用场景

- Web landing page、品牌官网、Mobile app 或纯海报视觉
- 只选择品牌字体、logo 字形或广告标题风格，且不落到桌面窗口 UI
- 后端、发布、签名、安装、CI 等非 UI 工程问题
- 用户明确只要机械改动，且改动不影响 UI/UX 判断

## 密度档位

| density | 适用场景 | 排版与间距取向 |
| --- | --- | --- |
| `calm` | 写作、阅读、轻工具、低频设置 | 更舒展的段落和区块；仍保持桌面控制密度，不做营销页大留白 |
| `standard` | 通用生产力应用、文件管理、任务管理、AI workspace | 默认选择；标题克制，控件间距清楚，列表和表格能承载真实数据 |
| `dense` | 开发者工具、数据工具、研究工具、多面板工作台 | 压缩行高和区块间距；强调扫描、对齐、列密度和快捷操作 |
| `control-room` | 监控、运维、交易、日志、分析面板 | 最高信息密度；状态、异常、时间戳和数值优先，避免装饰性标题和空卡片 |

密度必须来自 Desktop Read 的应用类型、用户角色和会话场景。不要因为界面“看起来高级”而默认 `calm`。

## 分析方法

1. 读取 Desktop Read，确认 `platform`、`app_archetype`、`session_context`、`density` 和主要风险。
2. 列出当前界面的文字角色：标题、导航、命令、数据、状态、错误、说明、元信息、日志。
3. 判断用户主要是在阅读、扫描、比较、编辑、监控还是排错；排版必须服务这个动作。
4. 先定密度档位，再定字号层级、行高、内边距、表格/列表行高和面板间距。
5. 用真实数据压力测试：长标题、多列、错误状态、空状态、时间戳、路径、代码和日志都必须可读且不撑坏布局。

## 文字角色

| 角色 | 作用 | 桌面处理 |
| --- | --- | --- |
| app title | 应用身份 | 出现在窗口 chrome、侧边栏顶部或命令入口时保持短，不做 hero 标题 |
| window title | 当前窗口/文档上下文 | 比 app title 更具体，可含文件名、项目名或当前位置 |
| toolbar label | 命令说明 | 优先短动词或名词；图标按钮需要 tooltip，不用长句挤进 toolbar |
| section label | 面板分组 | 小而清楚，服务扫描；避免营销式大标题和夸张字重 |
| sidebar item | 导航目标 | 稳定行高和选中态；文本过长时截断或提供 tooltip |
| body | 正文说明 | 只用于必要解释；桌面工具不要把主要区域写成文章 |
| metadata | 时间、路径、计数、来源、状态补充 | 降低视觉权重但保持可读；不要和 body 同层级混在一起 |
| table/list row | 可比较数据 | 行高必须支持扫描和点击；避免低密度表格浪费视口 |
| code/log | 等宽、路径、命令、堆栈、日志 | 用 monospace，保留对齐、时间戳、级别和换行策略 |
| caption | 辅助说明 | 只解释图表、字段或风险；不要承载关键操作信息 |
| status | 进行中、成功、警告、离线、同步 | 短、可扫、靠近相关对象；不要藏在长段落里 |
| error | 错误与恢复路径 | 可读、具体、靠近出错控件；说明用户下一步，不只给红色文本 |

## 最佳实践

- 使用平台默认字体栈；除非产品明确需要，不为桌面 UI 引入展示字体。
- 保持层级少而稳定：窗口级、区块级、行级、辅助级即可；不要每个卡片都有新字号。
- 标题服务定位，不服务震撼；桌面 app 的主界面通常不需要 hero-scale type。
- 表格和列表先为真实数据设计：列标题、行高、单元格内边距、截断、排序和选中态一起考虑。
- `dense` 和 `control-room` 可以更紧，但不能牺牲命中目标、焦点态、错误可读性和长时间使用舒适度。
- macOS source-list 行保持轻量：一个图标、一个主标题、一条可选辅助信息通常足够；丰富 metadata 放到 detail 或 Inspector。
- Inspector 表单使用清晰分组、稳定 label 宽度、短说明和靠近字段的错误；不要把主工作流藏进 Inspector。
- toolbar label 必须短，优先图标 + tooltip 或短动词；不要让长标签挤压搜索、状态或窗口操作区。
- Liquid Glass 或其他材料表面上的文字要优先保证对比；正文、表格、代码、错误和状态不为材料效果降级。
- 元信息、caption、status 可以小一档或弱一档，但不能低到用户需要贴近屏幕才能读。
- 面板之间用结构、边框、标题和对齐建立关系；不要靠大留白假装高级。
- 长文本优先折行或截断策略；路径、日志、代码优先保留可复制性和对齐。

## 反模式

- 把桌面窗口做成网页 landing page：超大 H1、宽松 hero、卡片之间大面积空白。
- 所有文本都像 body copy，导致标题、元信息、状态和错误没有优先级。
- 表格行高过大、列间距过宽，真实数据一多就只能滚动。
- 为了“高级感”把正文、metadata、caption 或日志降到不可读小字号。
- toolbar label 过长，挤压搜索框、分段控件、状态或窗口操作区。
- source-list row 被塞满多列 metadata、重复图标、时间戳或三行以上文本，失去 macOS 侧边栏密度和选中节奏。
- Inspector 表单过松、label 不对齐，或错误说明远离对应字段。
- Liquid Glass / 毛玻璃导致小字号、metadata、错误和状态文本低对比。
- section label 太大太重，让每个面板都像页面标题。
- 错误只用颜色表达，或把恢复动作藏在远离错误源的位置。

## Preflight Checklist

交付前检查：

- 已选择 `calm` / `standard` / `dense` / `control-room`，且理由来自真实工作流
- app title、window title、toolbar label、section label、sidebar item、body、metadata、table/list row、code/log、caption、status、error 都有明确层级或处理策略
- macOS-first 时 source-list、Inspector、toolbar label 和材料表面上的小字仍可读
- 没有网页营销页式大标题、过大留白、低密度表格或不可读小字号
- 表格/列表在真实数据量下仍能扫描、比较、选择和操作
- 状态与错误靠近对象，文案短且能指导下一步
- macOS / Windows 平台预期没有被压成通用 Web UI

## 输出格式

在实现、审计或写入 `DESIGN.md` 前，先输出：

```text
Typography Density:
- density: <calm / standard / dense / control-room>
- reason: <一句话说明为什么>
- hierarchy:
  - app title: <处理>
  - window title: <处理>
  - toolbar label: <处理>
  - section label: <处理>
  - sidebar item: <处理>
  - body: <处理>
  - metadata: <处理>
  - table/list row: <处理>
  - source-list row: <macOS-first 时的处理>
  - inspector form: <macOS-first 时的处理>
  - code/log: <处理>
  - caption: <处理>
  - status: <处理>
  - error: <处理>
- spacing_density_notes:
  - <表格、列表、面板、工具栏或日志的关键调整>
- anti_patterns_avoided:
  - <避免的具体问题>
```

若只是小范围修复，可压缩输出，但必须保留 `density`、关键文字角色和反模式判断。

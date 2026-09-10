---
name: myagents-router
description: "MyAgents 技能套件统一入口：按用户意图路由到套件内子技能（任务对齐 / 任务执行 / 网络资源下载 / 多 AI 并行深度研究），再用 read 读取对应子技能文件执行。当用户说「帮我规划并对齐这件事」「先对齐再动手」「/task-alignment」「/task-implement」「启动这个任务」「下载电子书/论文/影视/音乐/软件」「多 AI 并行深度研究/多方对比调研」时使用。 Unified router for the MyAgents skill suite: task alignment, autonomous task execution, resource downloading, and multi-AI parallel deep research. Routes an intent to the embedded subskill file and executes it via read; use for /task-alignment, /task-implement, download requests, or deep multi-source research."
whenToUse: "用户意图落在「先对齐再动手的任务」「启动已对齐任务的自主执行」「下载或搜集网络资源」「多 AI 并行深度研究」四类之一时；跨模块、不确定该走哪个子技能时也先走本路由。"
user-invocable: true
---

# MyAgents Router（套件路由）

上游来源：`https://github.com/hAcKlyc/MyAgents_skills`（作者 Ethan L）。本技能把该仓库的 4 个子技能**物理内嵌**为一个套件文件夹，可用技能列表里只出现 `myagents-router` 这一个入口（子技能不再单独注册，这是预期行为，不是安装失败）。

## 目录结构

```text
myagents-router/
├── SKILL.md                    ← 唯一被 DSH 扫描的入口（只做路由判断）
├── task-alignment/SKILL.md     ← 子技能：需求对齐，产出 .task 文档
├── task-implement/SKILL.md     ← 子技能：自主执行已对齐任务
├── download-anything/SKILL.md  ← 子技能：找资源 + 下载
│   ├── references/（9 份分类站点/技巧参考）
│   └── scripts/（7 个 dl-*.sh 下载脚本）
└── ultra-research/SKILL.md     ← 子技能：多 AI 并行深度研究
    └── references/（6 份各 AI 服务操作参考）
```

## 子技能职责速查

| 子技能 | 职责 | 典型触发信号 |
|---|---|---|
| `task-alignment` | 把粗略想法对齐成可执行的事；判断「当前会话直接做」还是「固化成 `.task/` 任务」，后者产出 4 份文档 | 帮我规划一下、先理一理、我有个想法、想探索 X、`/task-alignment`；用户没定义范围就跳进复杂任务 |
| `task-implement` | 作为用户代理自主执行 `.task/<MMDD_slug>/` 下已对齐的任务，拆解、委派子智能体、独立校验、交付 | `/task-implement`、start the task、go ahead and implement、execute the plan、「没问题，开始执行」 |
| `download-anything` | 找并下载网络资源：影视、音乐、电子书、论文、软件、图片字体、课程、网盘资源 | 下载某视频/音乐/书/软件、找资源、批量下图、磁力/种子、网盘搜索 |
| `ultra-research` | 多 AI 服务并行研究、交叉验证、输出带引用综合报告 | 全面调研、深度研究、多方对比、竞品/选型/行业趋势这类复杂主题 |

## 固定路由流程

1. **边界判断**：用户意图是否落在上表四类之内？不属于 → 不用本套件，按普通任务处理（例如简单事实查询不该走 `ultra-research`）。
2. **顺序判断**（任务类）：
   - 还没有 `.task/` 文档、或用户还在「想做什么」阶段 → `task-alignment`
   - 已有 `.task/` 文档、或用户明确要启动执行 → `task-implement`
   - 二者是**前后阶段**关系，不是二选一：先对齐，再执行。
3. **资源类判断**：要「找/下载东西」→ `download-anything`；要「研究一个主题并产出结论」→ `ultra-research`；两者都要（先研究再下素材）→ 先 `ultra-research` 再 `download-anything`。
4. **读取执行**：`read` 对应子技能文件，按其内容执行。**不要用 `skill` 工具加载子技能**——子技能未注册，按名加载会失败。

## 主路由表

| 用户诉求 | 走哪个子技能 | 不适用条件 | 产出物 |
|---|---|---|---|
| 需求模糊，要先对齐范围与验收标准 | `task-alignment/SKILL.md`（相对本技能目录） | 三言两语就能做完的小事 | 对齐结论；要么当场做，要么 `.task/<slug>/` 下 4 份文档 |
| 已有对齐文档，要自主执行 | `task-implement/SKILL.md`（相对本技能目录） | `.task/` 里没有任务 → 先回 `task-alignment` | 代码/文档变更、`progress.md` 全程记录、交付总结 |
| 下载视频/音频/图片/磁力 | `download-anything/SKILL.md`（相对本技能目录） | — | 落地文件 + 所用工具与命令 |
| 找电子书/论文/软件/课程 | 同上 | — | 资源链接 + 下载结果 |
| 网盘资源检索（百度/阿里/夸克） | 同上，再读 `download-anything/references/cloud-search.md` | — | 可用分享链接 + 提取码 |
| 复杂主题的深度调研/多方对比 | `ultra-research/SKILL.md`（相对本技能目录） | 简单事实查询（一次检索就够） | 带引用的综合报告 + 各来源原始记录 |
| 跨模块（要研究 → 再下素材 → 再固化成任务） | 依次 `ultra-research` → `download-anything` →（需要长期跟进时）`task-alignment` | — | 报告 + 素材 + 任务文档 |

## 路由输出格式

命中本套件后，先给出判断块再执行：

```text
route: <subskill-name>
reason: <一句话说明为什么走它>
next: read <subskill-name>/SKILL.md（相对本技能目录）
```

规则：

- 一次只路由到一个子技能；需要串联时按顺序逐个路由，**不要并行读取相互依赖的子技能**。
- 判断块之后**立刻开始执行**，不要停下来问「要不要我继续」。
- 若用户已用命令形式指定（`/task-alignment`、`/task-implement`），直接路由到对应子技能，不要再做二次判断。

## 注意事项

1. **子技能不注册**：`task-alignment`、`task-implement`、`download-anything`、`ultra-research` 都不在可用技能列表里，只能用 `read` 读文件执行。这是模式 B（内嵌路由）的预期结果。
2. **路径基准**：本技能里所有 `<子技能名>/SKILL.md`、`references/*.md` 都相对**本技能目录**解析；子技能内部写的 `references/xxx.md`、`scripts/xxx.sh` 相对**该子技能目录**解析。
3. **文件缺失时如实说**：某个子技能文件不存在（被移动/删除）时，只记录路由需求并告知用户，不要假装已加载。
4. **`task-alignment` ↔ `task-implement` 是强顺序**：`.task/` 目录由对齐阶段生成；没有它时执行阶段会直接走「建议先对齐」分支。
5. **DSH 工具差异**：子技能里写的 Bash / Agent / WebSearch 等名字，按各自文末的「DSH 适配」小节映射到 `pwsh` / `subagent` / `web_search` 等。`ultra-research` 依赖的 Playwright MCP 本机没有，走 `browser-harness` 技能。
6. **Windows**：`download-anything` 的 `.sh` 脚本需要 Git Bash 或 WSL；中文路径建议在其下执行。
7. **与其他技能的分工**：通用深度调研可优先用 `super-research`（其「并行子 agent 深度调研」模式即原 `deep-research`）（本机原生、不依赖浏览器登录态）；`ultra-research` 的价值在于**用你已登录的多个 AI 服务**并行取证，需要浏览器通道可用。

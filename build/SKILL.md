---
name: build
description: "Build 路由技能：每次任务先建 git 基线、套 epoch 训练循环（原子改进→真实验证→通过 commit 固化 / 失败 reset 换思路，子问题级与轮次级双粒度 checkpoint），并默认多 agent 编排（改动跨文件/跨模块或需并行探索与独立评审时派 Builder 子代理，仅单文件单函数级改动才显式降级）；再读对应资源文件执行。含增量实现、TDD、上下文工程、来源校验、对抗复查、前端与 API 设计。当进入某个已规划任务的编码实现时使用；也用于任何挂持久目标（goal）、派子代理/delegation、或长任务跨轮推进的场景——此时必须按 team-orchestration.md 的「Goal 自挂 + 轮内收束」执行：在轮内把子代理 join 干净，未 join 完不得结束本轮，否则 goal 会空烧轮次。（触发词：挂 goal、创建目标、持久目标、子代理、子智能体、delegation、委派、并行 agent、多 agent、编排、分工、长任务、一直循环、空转、等子代理、goal 不等待、继续这个任务。）Build router: always establish a git baseline and run the epoch training loop (atomic improvement -> real verification -> commit on pass / reset and change approach on fail, with sub-problem-level and round-level checkpoints), orchestrating Builder subagents by default. Also use whenever a persistent goal is attached, subagents are delegated to, or a long task spans multiple rounds — in that case follow the Goal + in-round join discipline in team-orchestration.md: join every subagent within the round and never end a round with unfinished joins, or the goal will burn empty rounds. Covers incremental implementation, TDD, context engineering, source-driven development, doubt-driven review, frontend and API design."
---

# Build（构建阶段 · 路由）

> 对应原版 `/build`。
> 核心理念：**One slice at a time。**

## 这个技能怎么用（先读这里）

本技能是**路由技能**。它不把所有规则堆在一处，而是先判定**执行形态**，
再让你读对应的资源文件。资源文件都在**本技能目录下**，用 `read` 按相对路径读取。

> ⚠️ 本技能内嵌的资源文件**没有注册成独立技能**，`skill` 工具加载不到它们。
> 一律用 `read <文件名>` 读取（相对本技能目录）。

## 第一步：git 基线（每个任务都做，无例外）

**开工前第一件事永远是确认 git 基线。** 这不是可选项，也不因任务大小而豁免。

```bash
git rev-parse --is-inside-work-tree   # exit 128 = 不是仓库
```

- **不是仓库** → `git init`；目录含大量历史杂物时先写 `.gitignore`
  把追踪范围收窄到交付物路径，再提交基线
- **是仓库** → 确认工作区状态干净（或已提交既有改动），再记下当前 commit 作为基线
- **首次 commit = 本任务的起点 checkpoint**

> ★ **基线是失败回退的唯一安全网。** 没有基线，`reset` 无处可退，
> epoch 循环就退化成"改坏了只能硬修"。所以基线先于一切。

> **谁执行 git**：单 agent 任务你自己做；**多 agent 任务只有 Orchestrator 做**，
> 子代理不碰任何 git 命令（并发 commit 会制造交错历史，`reset` 会毁掉
> 别人的未交付成果）。完整规则见 `team-orchestration.md` 的「Git 归属」。

## 第二步：判定执行形态（默认多 agent）

基线就绪后，默认假设：**本任务由多 agent 编排完成。** 先做编排判定，再看是否需要降级。

```text
【默认路径】按多 agent 编排 → 读 team-orchestration.md
   │
   └─ 降级判定：本任务是否属于「单文件 / 单函数」级改动？
      ├─ 是 → 降级为单 agent，并说明降级理由（见下）
      └─ 否 → 保持多 agent 编排
```

| 执行形态 | 何时 | 必读 |
|---|---|---|
| **多 agent 编排**（默认） | 改动跨文件/跨模块、需要并行探索、或需要独立评审 | `team-orchestration.md` |
| **单 agent**（降级后） | 单文件/单函数级改动 | `incremental-implementation.md` |

**注意：epoch 循环不在这张表里** —— 它是包在所有形态外面的**通用外层循环**
（见第三步），多 agent 和单 agent 都要走。

### 降级规则：什么算「单文件 / 单函数」级

**全部满足**才可降级（否则保持多 agent）：

- 改动集中在一个文件内的一个函数/方法
- 不需要并行探索（不需要同时查多份资料/多个模块）
- 不需要独立评审（改动足够机械、对错一眼可判）

**降级必须显式说明理由**，不能默默降级：

```text
[形态判定] 降级为单 agent — 理由：改动集中在 <文件> 的 <函数>，无并行探索需求，无需独立评审。
```

> **默认多 agent 的真实含义**是**默认按多 agent 思考**，而不是默认制造开销。
> 小任务降级是设计的一部分，不是偷懒——但降级要留痕，让你能看见、能推翻。
> **注意**：降级只降"谁来执行"，**不降 git 基线与 epoch 循环**——那两层仍照走。

> **形态互斥**：同一时刻只有一条分支被激活。
> 你是编排者就不亲自 build；你要亲手写代码就走单 agent 流程，别套用编排角色。

## 第三步：套上 epoch 循环（所有形态通用）

**无论多 agent 还是单 agent，都必须套这层循环。** 读 `epoch-loop.md`：

```text
基线 commit（第一步已建）
for 子问题 in 分解出的序列:
    基线 = 当前 commit（该子问题的 checkpoint）      ← 子问题级粒度
    for epoch in 1..N:
        1. 原子改进（一次只推一个点）
        2. 验证（真实命令/真实输出）
        3. 通过 → commit（新基线）                  ← 轮次级粒度
           失败 → git reset --hard 回基线
                  + 记录失败原因 + 换思路（不原样重试）★
    子问题达成 → commit 固化，成为下一子问题的新基线
```

**双粒度 checkpoint**：每个子问题一个基线 commit（里程碑级），
子问题内部每轮原子改进也 commit（轮次级）。两者都要有。

> **小任务也要走**：改动小 → 子问题序列只有 1 个，epoch 可能只跑 1 轮，
> 但**基线与 commit 照做**。"这次太小了不用建基线"是明确的红灯——
> 恰恰是小改动最容易在乱改中失去可回退点。

> ★ 失败回退分支只在 `epoch-loop.md` 完整展开；
> `incremental-implementation.md` 是切片内的局部循环，两者配合使用。

## 第四步：按任务类型加载子模块

无论哪种形态，命中下列情况时读对应文件：

| 情况 | 读 |
|---|---|
| 任何实现前，确认上下文足够 | `context-engineering.md` |
| 任何新逻辑/新行为 | `test-driven-development.md` |
| 涉及 API / 模块边界 | `api-and-interface-design.md` |
| 涉及前端 UI | `frontend-ui-engineering.md` |
| 需要权威资料、不能凭记忆写 | `source-driven-development.md` |
| 高风险/不确定决策，需要对抗性复查 | `doubt-driven-development.md` |
| **多 agent 并行 / 派发子代理 / 任务认领 / 队列** | `team-orchestration.md` 的「任务队列与认领」 |
| **决定开几个 agent / 并发上限** | `team-orchestration.md` 的「并发上限」 |
| 失败，需要系统排查 | `../verify/debugging-and-error-recovery.md` |

**切片内的执行顺序**（降级为单 agent 时，或作为 Builder 子代理时）：

1. 读 `context-engineering.md`，确保上下文足够。
2. 读 `incremental-implementation.md`，按薄垂直切片实现。
3. 每个切片按 `test-driven-development.md`：先写失败测试 → 再实现 → 再验证。
4. 按上表命中情况读对应子模块。
5. 失败 → 读 `../verify/debugging-and-error-recovery.md` 系统排查。
6. 完成一个切片后提交，再进下一个。

> 这层管"**切片内怎么写**"；第三步的 epoch 循环管"**跨轮怎么推进与回退**"。
> 两层同时生效，不互相替代。

## 编排形态（默认路径）

除降级情形外，按多 agent 推进：主会话做 Orchestrator（路由 / 跟踪 / 评审），
实现交给 Builder 子代理。读 `team-orchestration.md` 获取完整规则——角色定义、
**任务队列与认领**（`tasks/queue/` 状态机）、**并发上限 3-5**、Git 归属、
交接五要素、评审门禁、以及 DSH 特有的
**「Goal 自挂 + 轮内收束」**（自动挂 goal，并把子代理在轮内 join 干净）。

**任务从哪来**：`plan` 阶段把每个任务写成 `tasks/queue/pending/NNN-slug.md`。
**每轮第一件事是读一眼队列**，再决定派发、join 还是收工（见该文件的「与 goal 的配合」）。

**四层同时生效**，缺一层都会出问题：

| 层 | 谁执行 | 管什么 |
|---|---|---|
| git 基线 | **只有 Orchestrator** | 全队唯一回退点 |
| 任务队列与认领 | **只有 Orchestrator** 移动 `tasks/queue/` | 防重复认领、抗 goal 空转 |
| epoch 循环 | Orchestrator 调度，子代理在每个子问题内执行 | 推进与失败回退 |
| 切片 + TDD | 每个 Builder 子代理内部 | 单切片怎么写 |

> ⚠️ **默认多 agent 不等于无脑派发。** 派发前确认三件事：
> 产物路径写清楚、Completion criteria 可验证、子代理提示词自包含
> （它看不到父会话）。这三条缺一条，多 agent 的质量会低于单 agent。

## 资源文件清单

| 文件 | 内容 |
|---|---|
| `incremental-implementation.md` | 增量实现主流程（薄垂直切片、切片策略、实现规则） |
| `test-driven-development.md` | 测试驱动开发（RED-GREEN-REFACTOR、Prove-It、测试金字塔） |
| `epoch-loop.md` | **通用外层循环**（git 基线、任务分解、双粒度 checkpoint、失败回退）**每次都用** |
| `team-orchestration.md` | **多智能体编排**（角色、**任务队列与认领**、**并发上限**、Git 归属、生命周期、交接、评审、goal/join 纪律） |
| `context-engineering.md` | 上下文工程 |
| `source-driven-development.md` | 基于官方文档开发 |
| `doubt-driven-development.md` | 对抗性复查 |
| `frontend-ui-engineering.md` | 前端 UI 工程 |
| `api-and-interface-design.md` | API 与接口设计 |

外部引用：`../verify/debugging-and-error-recovery.md`（相对本技能目录的上级）。

## 边界

**做**：把已规划的任务实现出来，保证每步可运行、可验证、可回退。

**不做**：
- ❌ 不做需求对齐与规划 —— 那是 `define` / `plan` 阶段的职责
- ❌ 不做上线发布 —— 那是 `ship` 的职责
- ❌ 不做合并前评审 —— 那是 `review` 的职责（本技能的 `doubt-driven-development.md`
  是**进行中**的对抗姿势，不是最终裁决，两者不同）

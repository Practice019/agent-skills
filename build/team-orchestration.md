# Team Orchestration（多智能体编排）

> 来源：原 `agent-team-orchestration` 技能，并入 build。
> 相对本技能目录解析：`team-orchestration.md`。

## 什么时候读这个文件

**这是 build 的默认路径。** 除非任务命中降级规则（见 `SKILL.md` 第一步），
否则默认按多 agent 编排推进——主会话做 Orchestrator，实现交给 Builder 子代理。

触发信号（命中任一即保持多 agent，不降级）：

- 改动跨文件 / 跨模块，需要多个 Builder 分工
- 需要并行探索（同时查多份资料、多个模块、多个方案）
- 需要独立评审（产出需要另一双眼睛签字）
- 长任务挂持久目标（goal）且需要委派

**唯一的降级条件**（三条全满足才降级为单 agent，且必须显式说明理由）：

- 改动集中在一个文件内的一个函数/方法
- 不需要并行探索
- 不需要独立评审（改动足够机械、对错一眼可判）

> 默认多 agent 的含义是**默认按多 agent 思考**，不是默认制造开销。
> 降级是设计的一部分，但**降级要留痕**——让用户看得见、能推翻。

## ⚠️ Git 归属：只有 Orchestrator 碰 git

**这是硬规则。** 子代理产出文件，Orchestrator 独占全部 git 操作。

| 动作 | 谁做 | 为什么 |
|---|---|---|
| `git init` / `.gitignore` / 建基线 commit | **Orchestrator** | 基线是全队共享的唯一回退点 |
| `git add` / `git commit` | **Orchestrator** | 只有它看得见全队状态 |
| `git reset --hard` | **Orchestrator** | **破坏性操作，见下** |
| 读文件、写文件、跑测试 | 子代理 | 这是它们该干的 |

**子代理不执行任何 git 命令。** 委派提示词里要**明确写这一条**，
否则子代理会自己 `git add -A && git commit`，在并行时制造交错历史甚至锁冲突。

**子代理怎么交付**：按约定路径写产物文件 + 在最终回复里报告
「改了哪些文件 / 怎么验证 / 已知问题」。**commit 由 Orchestrator 在 join 之后统一做。**

### 并行时的两条禁令

**① 禁止让多个子代理同时改同一工作区的同一批文件。**

同一工作区里，B 看到的树可能是 A 改了一半的中间态 → **B 的验证结论对 A 的改动不成立**。
要么**串行**（一次只开一个写同一目录的子代理），要么**分区**
（各自独立子目录，或各自 `git worktree`）。

**② 禁止在有子代理正在工作时执行 `git reset --hard`。**

`reset --hard` 会**丢弃整个工作区的未提交改动**——包括其他子代理正在写、
还没交付的成果。这不是"回退自己这一轮"，是**毁掉别人的工作**。

**正确顺序**：

```text
1. 所有子代理 join 完成（本轮工作区不再有并发写入）
2. 检查产物 → 记录哪些文件变了（git status）
3. 验证通过 → git add <本轮产物> && git commit —— 原子提交，不 add -A 卷入无关改动
4. 验证失败 → 确认没有他人未交付的成果后，才允许 reset
              或更安全：git checkout -- <本轮涉及的文件> 做定点回退
```

> ⚠️ **优先用定点回退**（`git checkout -- <file>` / 手工撤销本轮改动），
> 只有在本轮改动确实是工作区里唯一未提交内容时，才用 `reset --hard`。

### 串行场景（单 agent 或只有一个写入者）

只有一个写入者时，`epoch-loop.md` 的"失败 → `reset --hard` 回基线"是安全的——
那时工作区里确实只有你自己的改动。**并行的存在与否，决定 `reset --hard` 安不安全。**

## ⚠️ 与 build 本体的关系（先读这条）

两者**不是冲突，是分层**：

| | 本文件（编排层） | build 本体（执行层） |
|---|---|---|
| 回答 | **谁**来写、谁审、怎么交接 | 代码**怎么**写才对 |
| 你的角色 | **Orchestrator**（路由与跟踪，不亲自 build） | **Builder**（亲自切片实现） |
| 生效范围 | 编排者会话 | **每个子智能体的会话内部** |

**关键**：Orchestrator 不亲自干活，但**每个 Builder 子智能体内部仍按 build 的切片 + TDD 流程执行**。
子智能体的委派提示词里应当带上 build 的执行纪律（见「委派提示词模板」）。

> 同一时刻只有一条分支被激活：你是编排者 → 读本文件；你要亲手写代码 → 读 build 本体。
> 不要同时套用两套角色指令。

## 角色

每个 agent 一个主角色，重叠会导致混乱。

| Role | Purpose | 模型倾向 |
|---|---|---|
| **Orchestrator** | 路由工作、跟踪状态、做优先级判断 | 高推理模型（承担判断） |
| **Builder** | 产出工件——代码、文档、配置 | 机械性工作可用更省的模型 |
| **Reviewer** | 验证质量、对缺口提出反对 | 高推理模型（能抓住 Builder 漏掉的） |
| **Ops** | 定时任务、站会、健康检查、派发 | 可靠前提下最省的模型 |

## 默认编排：一次标准派发

默认路径不是"派一堆 agent"，而是**有形状的两/三步**。最小可用形态：

```text
1. 形态判定       写一行 [形态判定]，确认保持多 agent（或降级并说明理由）
2. 读任务队列     从 tasks/queue/ 取「可认领」的任务（见「任务队列与认领」）
3. 确认 goal      已挂则复用；多轮/多批次且没挂 → create_goal
4. 分配 + 扇出    队列里标记认领者，再派 Builder：
                  默认 subagent(run_in_background: false) × N
                  ⚠️ 同一轮发多个 = 真并行 + 全部返回后才继续
5. 收敛           默认(false) → 工具返回即已收敛，无需额外动作
                  用了(true)  → 无事后等待接口，结果靠推送（下一轮）
6. 更新队列       通过 → 标 done + commit hash；失败 → 回退到 pending
7. 评审           要独立评审 → 再派一个 Reviewer 子代理（干净上下文）
8. 交棒           汇总产物、决定下一轮
```

> **独立工作放在哪**：用默认的 `false` 时工具**本身阻塞**，
> 所以主会话没有"空窗"要填 —— 该做的独立工作应放在**第 4 步扇出之前**做完。
> 只有用异步 `true` 时才需要"边跑边干"。

### ⚠️ 并发上限：3-5 个，不是越多越好

**这是实测结论，不是保守建议。** 加 agent 的收益会**先升后降**：

| 并发数 | 效果 |
|---|---|
| 1 | 基准 |
| **3-5** | **峰值区间** |
| 15 | 产出质量**下降 23%**（相比 5 个时），即使算力翻三倍 |

**两个独立来源指向同一量级**：

- 实测：productivity peaks between **three and five** agents; at 15 agents, **23% decline** in output quality.
- 业界观察：coding swarms **stall at single-digit concurrency**.

**为什么会降**：为避免互相覆盖，任务边界被迫**变粗**（细粒度的活更容易冲突）。
边界越粗 → 可并行的活越少 → 收益被吃掉。这就是 **Brooks 定律**（《人月神话》1975）在 agent 上的复现。

**另一条关键数据**：单 agent 在 **~64%** 的评测任务上**持平或优于**多 agent 管道。
所以**多 agent 不是默认更优**，它只在特定形状的任务上赢。

**因此**：

- **默认 2-3 个 Builder**，观察是否有真实等待瓶颈再加
- **超过 5 个是红灯**，先回头把任务切得更独立，而不是继续加人
- 加人之前先问：**这些活真的互不依赖吗？** 不独立 → 加了只会更慢

**评审要派给谁**：评审必须是**另一个**子代理（干净上下文），
不要主会话自检——那等于自己给自己签字。

## 任务状态

```text
Inbox → Assigned → In Progress → Review → Done | Failed
```

**规则**：
- **Orchestrator owns state transitions** —— 不要指望 agent 更新自己的状态
- 每次状态迁移记一条 comment（谁、做了什么、为什么）
- Failed 是合法终态——记录原因，继续走

## 任务队列与认领

> **来源**：本节的机制嫁接自 [gak4u/kanban-agent](https://github.com/gak4u/kanban-agent)
> 的 work-item queue convention（MIT），并按其 DSH 约束改造。
> 核心思想：**状态由位置表示，认领必须原子，编号即优先级。**

### 为什么需要认领

没有认领记录时的典型事故：

```text
agent A 读到：Task 3 = 待做
agent B 读到：Task 3 = 待做     ← 同一瞬间
两边都开工 → 重复劳动 + 产出冲突 → 白烧两倍算力
```

**多 agent 并行的前置条件就是"谁在做哪件事"有记录。**

### 状态：用位置表示，不要用字段

**这是踩过坑的结论**：状态如果写成任务里的一个字段，**它会过期**。

```text
❌ 在 tasks/plan.md 的 Task 3 里写 **状态**：待认领
   → agent 改了字段但忘了同步别处 → 字段与事实不符
   → 而且多个 agent 同改一个 plan.md 会冲突

✅ 状态 = 任务所在的目录
   → 移动是原子的，位置永远是真的
```

**目录布局**（在 `tasks/` 下）：

```text
tasks/
  plan.md                  ← 索引 + 架构决策（人读的总览）
  queue/
    pending/    NNN-slug.md   ← 可认领
    claimed/    NNN-slug.md   ← 已分配（认领者写在文件里）
    review/     NNN-slug.md   ← 已实现，等独立评审
    blocked/    NNN-slug.md   ← 卡住，附「## Blocked」说明
    done/       NNN-slug.md   ← 完成 + 已验证
```

### 认领规则（DSH 改造版）

> ⚠️ **与 kanban-agent 的关键差异**：它是**去中心抢占**（worker 自己 `git mv`），
> 而 DSH 里**子代理不碰 git**（见「Git 归属」）。所以此处是**中心化分配**：
> **只有 Orchestrator 移动任务文件。**

```text
Orchestrator 分配一个任务：
  1. 取 tasks/queue/pending/ 里 编号最小 的一项       ← 编号即优先级，免调度器
  2. 检查它的 depends_on 是否都已在 done/
  3. git mv queue/pending/NNN-x.md queue/claimed/NNN-x.md
  4. 在文件里填「认领者」字段（agent id）
  5. 再派 Builder，提示词里带上这个任务文件路径
```

**为什么仍用 `git mv`**：即使由中心分配，move 仍是原子的 ——
**防止主会话自己并发起两个相同任务**（比如 goal 唤醒与用户输入同时触发）。

### 编号即 FIFO

`NNN` 全局分配一次（`max(existing) + 1`，零填充三位）。
**总是认领编号最小的** —— 不需要额外排序逻辑，优先级编码在文件名里。

### 依赖用字段表示

frontmatter 里写：

```yaml
depends_on: 003      # 必须先完成 003
stacks_on: 005       # 直接叠在 005 的产出之上
```

**分配前必须检查 `depends_on` 是否都在 `done/`** —— 否则会派出一个地基还没打的活。

### 任务文件格式

```markdown
---
id: 007
title: 修复登录重定向循环
type: bug
priority: P1
depends_on: 003
claimed_by:            # Orchestrator 分配时填写
---

## Summary
1-3 句：要什么、为什么。

## Scope
- 范围内：确切的改动
- 范围外：明确排除，防止漂移

## 验收标准（二元、可测）
- [ ] 每条都能客观判定 pass/fail
- [ ] `<仓库的真实测试命令>` 通过

## Result（Builder 填）
- commit：
- 改了什么：
- 验证输出：

## Blocked              ← 仅 blocked 项有此段
卡在哪 / 需要什么输入。
```

### 三条硬规则

**① Builder 不许改 Scope 和验收标准。**

> 如果任务有歧义、自相矛盾、或前提就是错的 → **移到 `blocked/` 附说明，然后取下一个任务**。

这条直防"agent 自己降低标准交差" —— 它只能**如实报告卡住**，不能偷偷把标准改低。

**② 完成 = 已验证。**

移进 `done/` 之前必须：勾掉每一条验收标准、填完 `## Result`（commit / 改了什么 / 验证输出）、
清理自己造的测试数据。

**③ 只 Orchestrator 碰目录。**

Builder 交付产物 + 在回复里报告状态，**不移动任务文件**（同「Git 归属」的理由）。

### 与 goal 的配合

每轮开始时 Orchestrator **读一眼 `tasks/queue/`**：

| 看到 | 说明什么 |
|---|---|
| `pending/` 空 + `claimed/` 空 | 全部完成 → 可以 `update_goal complete` |
| `pending/` 空 + `claimed/` 非空 | **在等子代理 → join，不要开新活** |
| `pending/` 非空 + 无运行中子代理 | 该派发了 |

**这直接解决"挂 goal 空转"** —— 空转的定义就是：
**没有可认领的任务，却仍在开新一轮。** 有了队列，每轮第一件事就是查它。

## 交接（Handoff）

工作在两个 agent 间传递时，交接消息必须含五要素：

1. **What was done** —— 改动/输出摘要
2. **Where artifacts are** —— 精确文件路径
3. **How to verify** —— 测试命令或验收标准
4. **Known issues** —— 未完成或有风险的部分
5. **What's next** —— 接收方的下一个明确动作

反例：*"Done, check the files."*
正例：*"Built auth module at `/shared/artifacts/auth/`. Run `npm test auth` to verify. Known issue: rate limiting not implemented yet. Next: reviewer checks error handling edge cases."*

## 评审门禁

跨角色评审防止质量漂移：

- **Builders review specs** —— "这可行吗？缺什么？"
- **Reviewers check builds** —— "符合规格吗？边界情况呢？"
- **Orchestrator reviews priorities** —— "现在做的是对的事吗？"

**跳过评审，质量会在 3-5 个任务内退化。每次都是。**

## Goal 自挂 + 轮内收束（DSH 默认运行形态）

**只要任务满足"多轮 + 委派"，就按这条走** —— 用本技能时**自动挂 goal** 是预期行为。

### 1. 判定：什么时候自动挂 goal

| 条件 | 动作 |
|---|---|
| 预计 ≥2 个委派批次，或需要跨轮推进 | `create_goal(objective=...)`，描述**可验证的终点**，不写步骤 |
| 单轮内能收束（1 批委派 + 汇总） | **不挂 goal**，直接单轮做完 |
| 用户在等一个即时答案 | **不挂 goal** |

goal 的 objective 要写成"达成什么"，不要写成"调用谁"。挂了 goal 之后
**不要**再向用户确认"要不要继续"，直接推进。

### 2. 铁律：一轮之内必须把子代理 join 干净

**这是解决「goal 不能等待」的唯一结构性答案。**

轮次边界只在"这一轮的工具调用全部结束、模型输出最终文本"时出现。
所以只要**在轮内把子代理收回来**，goal 就没有缝可钻：

```text
主窗口一轮的标准骨架：
  1. todo_write          写清本轮边界与验收标准
  2. 扇出                默认 subagent(run_in_background: false) × N
                         ⚠️ 同一轮发多个 = 真并行，且全部返回后才继续
                         （需脚本化编排/大批量汇总时才用 workflow）
  3. 填满空窗            ⚠️ 这一步只在用了异步(true)时才需要；
                         用默认(false) 时工具本身阻塞，不需要"填空窗"
                         做与子代理**不重叠**的独立工作：
                         读文件 / 起草骨架 / 建目录 / 查依赖 / 准备验证脚本
  4. 收敛                用默认(false) → 工具返回即已收敛，无需额外动作
                         用了异步(true)  → **无事后等待接口**，
                                          只能等推送通知（下一轮）
  5. 消费 + 交棒         写文件、更新任务状态、决定下一轮
```

> ⚠️ **实测校正（两条）**：
>
> **① `subagent(run_in_background: false)` 本身就是阻塞 + 并行。**
> 实测同一轮发 2 个、每个内部 sleep 20 秒：两者 start 相差 0.64s、
> end 相差 0.65s，**总耗时 20s 而非 40s** —— 真并行，且全部完成才返回。
> 所以**默认就该用它**，不需要 `workflow` 来"实现并行"。
>
> **② `job_output` 不能用于子代理。**
> 实测 `job_output(<subagent-id>, wait: true)` 返回 `Error: unknown job` ——
> 子代理 id 与 job id 是两套命名空间。
> **异步子代理没有事后等待接口**，完成时由 runtime 推通知。
> **不要写"用 job_output 等子代理"——那条路不存在。**

**第 3 步的定位**：它是为**异步模式**准备的（`run_in_background: true`）。
如果用默认的 `false`，工具本身阻塞，主窗口没有"空窗"要填 ——
此时把独立工作**放到扇出之前**做，才是正确顺序。

### 3. 按场景选形态（实测校正版）

| 场景 | 用什么 | 能否本轮拿到结果 |
|---|---|---|
| **并行 + 要结果**（绝大多数） | **`subagent(run_in_background: false)` × N** | ✅ **能**（工具返回即全部完成） |
| 大批量（>5）+ 脚本化/结构化汇总 | `workflow(...)` | ✅ 能（前台阻塞） |
| 不需要本轮结果 | `subagent(run_in_background: true)` | ❌ 靠推送通知到下一轮 |
| 本轮本质就是"等结果" | `create_goal(..., max_goal_rounds=1)` | 直接取消续跑语义 |

```text
要并行 + 本轮要结果   →  run_in_background: false × N   ← 默认首选
大批量 + 要脚本编排    →  workflow
不要本轮结果          →  run_in_background: true（结果下一轮到）
```

**关键**：`workflow` **不是**唯一的并行手段，只是"需要脚本化编排"时的选择。
单纯要并行拿结果，**同一轮发多个 `false` 就够了**。

### 4. 写权唯一：等待期间的行为边界

| 子代理在做什么 | 可以 | **不可以** |
|---|---|---|
| 核实代码 | 读代码、写文档、规划、起草 | **改它要核实的代码** |
| 核实某个端口/实例 | 用**别的端口**起独立实例 | **重启/改它正在用的那个** |

**违反的代价**：子代理的结论会与代码状态对不上（它测的是改前，你报的是改后）。
"这次刚好没影响" 不算纪律 —— 那是运气。

### 5. 自检（每轮收尾前）

- [ ] 本轮扇出的每个子代理，都拿到结果或显式处置了吗？
- [ ] 我在子代理跑的时候，有没有碰它正在核实的东西？
- [ ] 本轮最终文本之前，有没有"等通知"这种未兑现的意图？
      （有 → 说明该 join 而没 join，回去 join）
- [ ] 跨轮状态写进文件了吗？

### 6. 别无限等

子代理跑过 ~5-6 轮无产出就该处置：

1. `interrupt_agent <id>` 停掉它
2. **自己跑一遍可独立执行的验证脚本**收尾
3. 如实记录「独立复核未回，以下为自查证据」→ 再判断目标是否达成

## 常见陷阱

- **派发时没写清产物路径** —— 工作产出了却找不到。永远在委派提示词里给出精确输出路径
- **没有评审步骤 = 质量漂移** —— "小改动，跳过评审"，做三次你就会累积错误
- **agent 不报进度** —— 沉默造成协调盲区。要求它 start / blocker / handoff / completion 四个节点都报
- **没确认能力就派活** —— 给没有浏览器权限的 agent 派浏览器测试
- **Orchestrator 亲自干活** —— 你一开始"顺手快点做掉这一件"，就失去了对其余部分的监督视野
- **等待时空烧轮次** —— 见上面「Goal 自挂 + 轮内收束」

## 委派提示词模板（给 Builder 用）

子智能体**看不到父会话**，提示词必须自包含。把 build 的执行纪律一并带上：

```text
任务：<一句话目标>
任务文件：tasks/queue/claimed/<NNN-slug>.md  ← 先读它，Scope 与验收标准以它为准
产物路径：<精确路径>
完成标准：<可验证的命令/信号>

执行纪律（相对 build 技能目录）：
0. ⛔ 不要执行任何 git 命令（add / commit / reset / checkout 都不许），
   也不要移动 tasks/queue/ 下的文件。这些由 Orchestrator 独占。
   你只写文件、跑测试、报告结果。
1. 读 epoch-loop.md —— 用 epoch 循环推进：原子改进 → 真实验证 →
   通过则**报告**本轮改动；失败则换思路重试（不原样重试），并写明失败原因
2. 读 incremental-implementation.md —— 按薄垂直切片实现，每片测试后再进下一片
3. 每片按 test-driven-development.md —— 先写失败测试，再实现，再验证

⛔ 不许修改任务文件里的 Scope 或验收标准。
   如果任务有歧义、自相矛盾、或前提是错的 —— 停下来如实报告，
   不要自己把标准改低来"完成"它。

交付时必须给出：
  - 改了哪些文件（精确路径）
  - 怎么验证的（真实命令 + 真实输出摘要）
  - 已知问题 / 未完成部分
  - 是否发生过失败与重试（如实，不隐瞒）
```

> 注意第 0 条用的是「报告本轮改动」而不是「commit 本轮改动」——
> 子代理没有 commit 权限，它只负责把改动**落盘**并**说清楚**。

## DSH 等待语义速查（实测校正）

| 工具 | 是否阻塞当前轮 | 能否本轮拿到结果 | 适用 |
|---|---|---|---|
| **`subagent(run_in_background: false)`** | ✅ **阻塞** —— 不返回直到跑完 | ✅ **能** | **默认首选**；同一轮发多个 = 真并行 |
| `workflow(...)` | ✅ 前台阻塞 —— 脚本跑完才返回 | ✅ 能 | 大批量 + 脚本化/结构化汇总 |
| `subagent(run_in_background: true)` | ❌ 不阻塞，立即返回 id | ❌ **不能**（靠推送通知，下一轮） | 不需要本轮结果时 |
| ~~`job_output(job_id, wait: true)`~~ | ⚠️ 阻塞，但**只对 job id** | — | **实测对子代理无效**（`Error: unknown job`） |
| `send_message(agent_id, ...)` | 不阻塞（仅投递） | — | 中途 steer；也可唤醒 idle 子代理 |
| `interrupt_agent(agent_id)` | 立即返回（请求取消） | — | 超时兜底 |

### 实测记录（本机验证，勿凭推断覆盖）

```text
① 同一轮发 2 个 subagent(run_in_background: false)，各 sleep 20s：
     A start=14:14:07.978 end=14:14:27.995
     B start=14:14:08.620 end=14:14:28.645
   → start 差 0.64s / end 差 0.65s / 总耗时 20s（非 40s）
   → 结论：默认模式天然并行，且全部完成后才返回

② subagent(run_in_background: true) 返回：
     "started subagent 4d5d7a4f-..."
   → 只给 id，无结果；结果随后由 runtime 推通知

③ job_output("cf1c9d11-...", wait:true) 其中 id 来自 subagent：
     Error: unknown job cf1c9d11-...
   → 结论：subagent id ≠ job id，job_output 不能用于子代理
```

**关键区分**：`job_output` 的 id 来自"**启动了后台作业的那个工具**"
（例如 `pwsh(run_in_background: true)`）；而 `subagent` 返回的是 **subagent id**，
**两者不通用**。

> **要并行又要在本轮拿到结果 → 同一轮发多个 `run_in_background: false`。**
> 不要用 `true` 然后再想办法"等" —— 那个"等"不存在。

**没有"跳过本轮"的信号** —— 这正是必须在轮内 join 的原因。

## 与其他技能的分工

| | 本文件 | `myagents-router` |
|---|---|---|
| 层面 | **方法论**：角色 / 生命周期 / 交接协议 / 评审门禁 | **路由**：把一句用户意图分派到 4 个子技能 |
| 形态 | 无状态 playbook，跨项目通用 | 有状态（`.task/<MMDD_slug>/` 4 份文档） |
| 角色数 | 多角色（Orchestrator / Builder / Reviewer / Ops） | 单角色 UserProxy |

**选哪个**：要**设计一支团队或定协作规范** → 用本文件。
要**执行一件已对齐的具体任务** → 走 `myagents-router` → `task-implement`。

> ⚠️ 方法论有意分歧，别互相覆盖：本文件要求「Orchestrator 不亲自干活」（保持监督视野）；
> 而 `task-implement` 要求 UserProxy **亲自处理**强耦合改动（因为它没有团队可指挥）。
> 按当前实际有无团队择一执行。

## 一句话

> **goal 负责"跨轮不忘记"，轮内 join 负责"轮内不空转"。**
> 两者同时用才成立；只挂 goal 不 join，就是轮次空烧的根源。

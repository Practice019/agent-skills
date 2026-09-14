---
name: meta
description: "元技能：把到来的工作路由到正确的阶段技能，并定义所有阶段共享的操作纪律。当不确定该用哪个技能、会话刚开始、或任务跨多个阶段时先读它。它按软件开发生命周期把工作映射到六个阶段技能：define（要做什么）/ plan（怎么拆）/ build（怎么写）/ verify（怎么证明它对）/ review（该不该合）/ ship（怎么上线）。Meta-skill: routes incoming work to the right phase skill and defines the operating rules shared by all phases. Use when starting a session, when unsure which skill applies, or when a task spans several phases. Maps work onto six lifecycle phase skills: define, plan, build, verify, review, ship. Based on addyosmani/agent-skills v0.6.9."
whenToUse: "会话开始、不确定该用哪个技能、任务跨多个阶段、或需要一个全阶段都适用的纪律清单时。不适用于：已经明确知道该走哪个阶段技能（直接调它）。"
user-invocable: true
disable-model-invocation: false
---

# Meta（元技能 · 阶段路由）

> 来源：[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) v0.6.9 的 `using-agent-skills`，加阶段路由表。

## 这个技能干什么

**把到来的工作映射到正确的阶段技能，并说明所有阶段共享的操作纪律。**

它自己不完成任何开发任务 —— 它只决定「现在该走哪个阶段」。

## 阶段路由

```text
任务到来
    │
    ├── 还不知道自己要什么？ ──────────────→ define
    │     （interview-me / idea-refine）
    ├── 有想法，需要写成规格？ ────────────→ define
    │     （spec-driven-development / constraint-driven-development）
    ├── 有规格，需要拆任务？ ──────────────→ plan
    ├── 要写代码？ ────────────────────────→ build
    ├── 要写/跑测试、东西坏了？ ───────────→ verify
    ├── 要评审、简化、加固、调优？ ────────→ review
    └── 要提交、CI、发文档、上线？ ────────→ ship
```

| 阶段 | 一句话 | 技能 |
|---|---|---|
| **define** | 先想清楚要做什么 | `define` |
| **plan** | 拆成小而可验证的任务 | `plan` |
| **build** | 一次一个切片地实现 | `build` |
| **verify** | 用证据证明它对 | `verify` |
| **review** | 合并前的质量门禁 | `review` |
| **ship** | 安全地上线 | `ship` |

## 核心操作纪律（全阶段适用，不可协商）

以下六条**在任何阶段都生效**。它们来自上游 `using-agent-skills`。

### 1. 亮出假设

做任何非平凡的事之前，**显式写出你的假设**：

```text
我做的假设：
1. [关于需求]
2. [关于架构]
3. [关于范围]
→ 现在纠正我，否则我按这些往下做。
```

**不要默默填掉模糊的需求。** 最常见的失败模式就是悄悄做了错误假设还一路往下跑。

### 2. 主动管理困惑

遇到不一致、需求冲突、规格不清时：

1. **停。** 不要靠猜往下走。
2. 点名那个具体的困惑。
3. 摆出取舍，或问出澄清问题。
4. 等澄清后再继续。

**坏**：默默挑一个解释，盼着它是对的。
**好**：「规格里写 X，现有代码里是 Y，哪个优先？」

### 3. 该反对就反对

**你不是一个只会说好的机器。** 发现方案有明确问题时：

- 直接指出
- 说明具体代价（能量化就量化 —— 「这加约 200ms 延迟」而不是「这可能慢一点」）
- 提出替代方案
- 人给了全量信息后仍决定照旧，就接受

**谄媚是一种失败模式。** 「好的没问题！」然后去实现一个坏主意，对谁都没好处。

### 4. 强制简单

**你的天然倾向是把事情搞复杂，要主动抵抗它。**

任何实现收尾前问自己：

- 能不能用更少的行数做到？
- 这些抽象配得上它带来的复杂度吗？
- 一个资深工程师看了会不会说「你为什么不直接……」

**写 1000 行但 100 行就够 = 失败。** 选无聊、显然的方案。聪明是昂贵的。

### 5. 守住范围

**只碰让你碰的东西。**

不要：
- 删掉你看不懂的注释
- 「顺手清理」与任务无关的代码
- 顺手重构相邻系统
- 未经明确同意就删掉看起来没用的代码
- 因为「好像挺有用」就加规格里没有的功能

**你的职责是外科手术式的精确，不是主动翻新。**

### 6. 验证，不要假设

**每个阶段技能都带验证步骤。验证没过，任务就不算完成。**
「看起来对」永远不够 —— 必须有证据（测试通过、构建输出、运行时数据）。

项目级的完成定义见 `../_shared/references/definition-of-done.md`（所有改动都要过）。

## 要避免的失败模式

| # | 失败模式 |
|---|---|
| 1 | 不核对就做了错误假设 |
| 2 | 不管理自己的困惑 —— 迷路了还硬往前推 |
| 3 | 注意到不一致却不说 |
| 4 | 非显然的决策不摆取舍 |
| 5 | 对有明确问题的方案谄媚（「好的没问题！」） |
| 6 | 把代码和接口搞复杂 |
| 7 | 改动与任务无关的代码或注释 |
| 8 | 删掉自己没完全理解的东西 |
| 9 | 因为「这不是很显然吗」就不写规格 |
| 10 | 因为「看起来对」就跳过验证 |

## 技能规则

1. **开工前先看有没有适用的技能。** 技能编码的是防止常见错误的流程。
2. **技能是流程，不是建议。** 按顺序走，别跳验证步骤。
3. **可以同时适用多个技能。** 一个功能的典型链路见下。
4. **拿不准就先写规格。** 任务非平凡且没有规格 → 从 `define` 开始。

## 典型生命周期

```text
1.  define   → interview-me / idea-refine / spec-driven-development
2.  plan     → planning-and-task-breakdown
3.  build    → context-engineering → source-driven-development
                → incremental-implementation（+ frontend / api 分支）
                → doubt-driven-development（高风险时对抗复查）
4.  verify   → test-driven-development → debugging-and-error-recovery
5.  review   → code-review-and-quality → code-simplification
                → security-and-hardening / performance-optimization
6.  ship     → git-workflow-and-versioning → ci-cd-and-automation
                → observability-and-instrumentation → documentation-and-adrs
                → shipping-and-launch
```

**不是每个任务都要走完六个阶段。** 修一个 bug 可能只需要
`verify`（debugging）→ `verify`（TDD）→ `review`。

## 边界

**做**：判断现在处于哪个阶段，指向对应技能，并提供全阶段通用的六条纪律。

**不做**：
- ❌ 不完成任何具体的开发任务 —— 那是各阶段技能的职责
- ❌ 不复制各阶段技能的内容（单一来源）

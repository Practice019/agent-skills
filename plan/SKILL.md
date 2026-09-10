---
name: plan
description: "Plan 阶段：把已确认的规格拆成小而可验证的任务，画出依赖顺序、标出可并行组、插入检查点，产出 tasks/plan.md。当需求已明确或已有 SPEC/PRD、准备写代码之前需要任务拆解、排期、依赖排序、并行划分、验收标准设计时使用（对应 /plan）。任务太大不知从哪开始、要多人或多 agent 并行、要跟人沟通范围时也用本技能。 Plan phase: turn a confirmed spec into small verifiable tasks — dependency order, parallelizable groups, checkpoints, and tasks/plan.md. Use when requirements are settled (or a SPEC/PRD exists) and task breakdown, sequencing, parallelism, or acceptance-criteria design is needed before writing code (equivalent to /plan). Also use when a task is too large to start, when multiple people or agents will work in parallel, or when scope must be communicated."
whenToUse: "上游 define 已产出规格（或需求已被复述确认）、下游 build 即将动手之间的拆解环节。不适用于：单文件小改动、规格里已自带清晰任务列表、纯探索性调研。"
user-invocable: true
disable-model-invocation: false
---

# Plan（计划阶段）

> 对应 `/plan`。核心理念：**Small, atomic tasks**。
> 上游 `define`（要做什么）→ 本技能（怎么拆、什么顺序）→ 下游 `build`（开始写代码）。

## 目标与边界

**做**：

- 把规格拆成 S/M 粒度的可验证任务，每个任务自带验收标准与验证方式
- 画依赖图、定实现顺序、标出可安全并行的任务组
- 每 2–3 个任务插一个检查点
- 产出 `tasks/plan.md`（跨会话持久）+ 用会话 todo 工具跟踪（本轮可见）

**不做**：

- ❌ 不写实现代码、不改业务文件（Plan 阶段是**只读**，唯一可写的是 `tasks/`）
- ❌ 不做需求澄清与规格补全（那是 `define`）
- ❌ 不执行任务、不部署、不发版（那是 `build` / `ship`）

## 前置检查（Gate）

开工前必须确认这三条，任一不满足就先补齐，不要硬拆：

1. **规格存在且明确** —— `SPEC.md` / PRD / 用户口述且已复述确认。没有 → 回 `define`。
2. **已读过相关代码** —— 知道现有目录结构、命名约定、已有模式。
3. **验收命令已知** —— 知道本仓库的测试 / 构建 / lint 命令原文（不是"跑一下测试"）。

## 工作流程

### 1. 只读侦察

读规格 + 相关代码，记录：现有约定、组件依赖、风险点、未知项。

> **此阶段禁止写业务代码。** 计划的输出是文档，不是实现。

### 2. 读详细方法

```text
read planning-and-task-breakdown.md   # 相对本技能目录
```

该文件给出完整方法：依赖图推导、垂直切片、任务结构模板、检查点写法、并行化边界、反模式清单。**本文件只给执行骨架，细节以它为准。**

### 3. 定模块与接缝（有架构改动时）

```text
read codebase-design.md   # 相对本技能目录
```

只要这次改动涉及**新模块、接口重划、或"这块要能测"**，先用深模块词汇（Module / Interface / Implementation / Depth / Seam / Adapter）把接口和接缝定下来，再切任务。接口没定就切任务 = 任务描述里塞满设计决策，必然漂移。

- 找深化机会 → 另读 `DEEPENING.md`
- 想比较两种接口方案 → 另读 `DESIGN-IT-TWICE.md`

纯增量改动（加个字段、改个文案）可跳过本步。

### 4. 画依赖图

按"底层先建"的顺序：数据模型 → 类型/接口 → 服务端逻辑 → API → 客户端 → UI。
把"谁阻塞谁"写出来，而不是凭感觉排。

### 5. 垂直切片

每个任务端到端交付一条**能跑通的路径**。

- ❌ 横向：任务1 写完整个数据库 → 任务2 写完所有 API → 任务3 写完所有 UI
- ✅ 垂直：任务1 用户能注册（表+API+页面）→ 任务2 用户能登录（…）→ 任务3 用户能建任务（…）

### 6. 写任务

每条任务必须包含：

```markdown
## Task [N]: [一句话标题]

**描述**：这段工作达成什么（一段话）。

**验收标准**：
- [ ] [具体、可测的条件，最多 3 条]
- [ ] [具体、可测的条件]

**验证方式**：
- [ ] 测试通过：`<仓库的真实测试命令>`
- [ ] 构建通过：`<仓库的真实构建命令>`
- [ ] 手动确认：[要看到什么]

**依赖**：[Task 编号，或 None]

**预计改动文件**：
- `src/path/to/file.ts`

**规模**：[XS / S / M / L]
```

### 7. 排序与检查点

1. 依赖先满足（地基在前）
2. 每个任务结束时系统仍处于**可运行**状态
3. 高风险任务前置（fail fast）
4. 每 2–3 个任务插一个检查点

```markdown
## Checkpoint: Task 1–3 之后
- [ ] 测试全绿
- [ ] 构建无错
- [ ] 核心用户流端到端可走通
- [ ] 人工确认后再继续
```

### 8. 落盘 + 同步

- 写 `tasks/plan.md`（目录不存在则创建）—— 跨会话、抗压缩的持久记忆
- 用 `todo_write` 把任务列表写进当前会话 —— 本轮可见、可跟踪进度
- 若项目指定了外部 tracker（GitHub Issues / Jira / Linear / beads），`tasks/plan.md` 里只保留**有序索引**（ID 或链接），不要两处都维护同一份清单

### 9. 人工确认

把计划交给用户过一遍，确认后才进入 `build`。**不要跳过确认直接开工。**

## 任务规模红线

| 规模 | 文件数 | 处理 |
|---|---|---|
| XS | 1 | ✅ |
| S | 1–2 | ✅ 最佳区间 |
| M | 3–5 | ✅ 最佳区间 |
| L | 5–8 | ⚠️ 尽量再拆 |
| XL | 8+ | ❌ 必须拆 |

**继续拆细的信号**（命中任一条就拆）：

- 预估超过一个专注会话（≈2 小时）
- 验收标准写不出 3 条以内
- 跨两个以上独立子系统（如 auth 与 billing）
- 标题里出现"和 / 并且"（说明是两件事）

## 输出模板

```markdown
# Implementation Plan: [功能/项目名]

## 概述
[一段话说明要做什么]

## 架构决策
- [决策 1 + 理由]
- [决策 2 + 理由]

## 任务清单

### 阶段 1：地基
- [ ] Task 1: ...
- [ ] Task 2: ...

### Checkpoint：地基
- [ ] 测试通过、构建干净

### 阶段 2：核心功能
- [ ] Task 3: ...

### Checkpoint：核心功能
- [ ] 端到端流程可走通

## 风险与对策
| 风险 | 影响 | 对策 |
|------|------|------|

## 待决问题
- [需要人确认的问题]
```

## 完成自检（进入 build 前必须全过）

- [ ] 每个任务都有验收标准
- [ ] 每个任务都有验证方式（真实命令或明确的手动步骤）
- [ ] 依赖已识别且排序正确
- [ ] 没有 XL 任务
- [ ] 没有任务改动超过 ~5 个文件
- [ ] 主要阶段之间都有检查点
- [ ] 已写入 `tasks/plan.md`，并同步到会话 todo 列表
- [ ] 用户已确认计划

## 常见坑

| 坑 | 后果 | 对策 |
|---|---|---|
| 边拆边写代码 | 计划被实现细节绑架，越写越乱 | Plan 阶段严格只读 |
| 任务写成"实现该功能" | 无法判定是否完成 | 强制写验收标准 |
| 横向切片 | 中途没有可运行状态，问题堆积到集成期 | 垂直切片 |
| 没有检查点 | 错误累积到后期才暴露 | 每 2–3 任务插 checkpoint |
| 把设计决策塞进任务描述 | 规格漂移，任务变形 | 设计决策单独放"架构决策"段 |
| 只在脑内规划 | 跨会话/压缩后丢失 | 必须落盘 `tasks/plan.md` |
| 两处维护任务清单 | 清单不一致 | 只留一个权威来源，另一处放索引 |

## 关联资源

按需 `read`，不要全部加载。下列路径**相对本技能目录**解析（技能加载时会注入 `Base directory for this skill: ...`，以它为基准拼接——`read` 不展开 `~`）：

- `planning-and-task-breakdown.md` — 完整方法（**必读**）
- `codebase-design.md` — 深模块词汇（Module/Interface/Depth/Seam）与接缝设计；涉架构改动时读
- `DEEPENING.md` — 按依赖类别找深化机会
- `DESIGN-IT-TWICE.md` — 并行设计两版接口再比较
- `../_shared/references/definition-of-done.md` — 项目级"完成"的定义
- `../_shared/references/testing-patterns.md` — 验收标准怎么写才可测
- `../_shared/references/security-checklist.md` — 拆任务时补安全横切要求
- `../_shared/references/performance-checklist.md` — 有性能要求时
- `../_shared/references/accessibility-checklist.md` — 有 UI 时
- `../_shared/references/observability-checklist.md` — 需要日志/指标/追踪时
- `../_shared/references/orchestration-patterns.md` — 多 agent 并行编排时

> 加载方式：本 harness 用 `read` 读取上述路径（没有 `skill_load` 工具）；这些子文件不注册为独立技能。

---
name: plan
description: "Plan 阶段：把已确认的规格拆成小而可验证的任务，产出 tasks/plan.md。核心是依赖图、垂直切片（不是按层横切）、每 2-3 个任务一个检查点、以及每个任务都带二元可测的验收标准与验证方式。对应 /plan。Plan phase: turn an agreed spec into small, verifiable tasks. Dependency graph, vertical slices (not horizontal layers), checkpoints every 2-3 tasks, and binary testable acceptance criteria per task. Produces tasks/plan.md. Use when a spec exists and you need an implementation plan. Based on addyosmani/agent-skills v0.6.9."
whenToUse: "规格已明确（SPEC.md / docs/SPEC.md / spec/* 之一存在）、需要拆任务排序依赖、或需要一份可勾选的实现清单时。不适用于：需求还没定（先走 define）、已经有一份能直接执行的清单。触发词：拆任务、排期、依赖图、垂直切片、tasks/plan.md。"
user-invocable: true
disable-model-invocation: false
---

# Plan（规划阶段 · 路由）

> 来源：[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) v0.6.9 的
> `planning-and-task-breakdown`。本文件是**路由层**，原文是**本技能目录下的子文件**，
> 用 `read` 按相对路径读取。
>
> 另有 `zoom-out.md`（陌生代码全局地图）与 `codebase-design.md`（模块与接缝设计，
> 附 `DEEPENING.md` / `DESIGN-IT-TWICE.md`）两条**本地**路由——上游没有对应物，
> 不随上游升级变动。将来上游升级只覆盖 `planning-and-task-breakdown.md`。

## 这个阶段干什么

**把已确认的规格，拆成小而可验证的任务。** 产出 `tasks/plan.md`。

> ⚠️ 内嵌子文件**没有注册成独立技能**，用 `read <文件名>` 读（相对本技能目录）。

## 路由表

| 你要做的事 | 读 |
|---|---|
| **拆任务、定依赖、写验收标准** | `planning-and-task-breakdown.md` |
| **要进陌生代码、先拿全局地图** | `zoom-out.md` |
| **要设计代码库结构 / 模块边界** | `codebase-design.md`（另见 `DEEPENING.md`、`DESIGN-IT-TWICE.md`） |
| 全项目的完成定义（每个改动都要过） | `../_shared/references/definition-of-done.md` |
| 前端任务的可访问性清单 | `../_shared/references/accessibility-checklist.md` |
| 涉及安全边界的任务 | `../_shared/references/security-checklist.md` |

## 前置检查（Gate）

开工拆任务前，四条必须满足，缺一条先补齐：

1. **规格存在且明确** —— `SPEC.md` / `docs/SPEC.md` / `spec/*` 之一。没有 → 回 `define`。
2. **相关代码已摸清** —— 知道现有目录结构、命名约定、已有模式。
3. **验收命令已知** —— 本仓库的测试 / 构建 / lint 命令原文（不是「跑一下测试」）。
4. **能力已盘点** —— 这次改动要用到的技能/资源从哪来，缺的已标出。

## 三条核心原则

**① 垂直切片，不是按层横切**

```text
❌ 横向：Task1 建全部表 / Task2 写全部 API / Task3 做全部 UI
   → 中途没有任何可运行状态，问题全堆到集成期

✅ 垂直：Task1 登录（表 + API + UI 一小条）/ Task2 登出 / ...
   → 每个任务结束时系统仍可运行
```

**② 每个任务都带二元可测的验收标准**

「实现登录」不算。要能判真假的：「用正确凭据 POST /login 返回 200 + Set-Cookie」。

**③ 每 2-3 个任务插一个检查点**

检查点是**停下来把该验的验完**，不是停下来等人签字（见 `meta` 的「验证，不要假设」）。

## 产出

```text
tasks/plan.md   ← 唯一产物
```

必须包含：概述、架构决策（含理由）、任务清单（编号 + 验收标准 + 验证方式 + 依赖）、
检查点、风险与对策。

## 任务清单格式（一条任务一行，便于扫描）

```markdown
- [ ] **T1** <标题> · 规模 S · 依赖 — ｜ 验收：<二元可测> ｜ 验证：`<命令>`
- [ ] **T2** <标题> · 规模 M · 依赖 T1 ｜ 验收：<二元可测> ｜ 验证：`<命令>`
```

> ⛔ **勾选框只用于任务**，且格式固定为 `- [ ] **T<n>**`。
> 检查点写成**引用块**（`> **Checkpoint：…**`），**不要**写成同款勾选框 ——
> 下游（`build`）靠扫描「编号最小的未勾选 `T<n>`」决定下一个做什么，
> 检查点混进去就会被当成任务。

## 规模口径

| 规模 | 文件数 | 处置 |
|---|---|---|
| S | 1-2 | ✅ 最佳 |
| M | 3-5 | ✅ 可以 |
| L | 5-8 | ⚠️ 尽量再拆；要留就必须写明为什么 |
| XL | 8+ | ❌ **必须拆**（无例外） |

## 完成自检（进 build 前全过）

- [ ] 每个任务都有验收标准（二元、可测）
- [ ] 每个任务都有验证方式（真实命令或明确的手动步骤）
- [ ] 依赖已识别且顺序正确
- [ ] 没有 XL 任务；L 任务都写了保留理由
- [ ] 每 2-3 个任务有一个检查点
- [ ] 已写入 `tasks/plan.md`
- [ ] 规格里的「不做什么」已反映为范围边界

## 边界

**做**：拆任务、排序依赖、写验收标准与验证方式、定检查点与规模。

**不做**：
- ❌ **不写实现代码** —— 那是 `build`
- ❌ 不重新定义需求 —— 那在 `define`
- ❌ **不发明规格里没有的东西** —— 有歧义就问，别猜
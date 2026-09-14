---
name: build
description: "Build 阶段：按任务清单增量地写出可运行的代码 —— 一次一个薄垂直切片，每片测试通过再往下。六条分支：incremental-implementation（切片主循环）/ test-driven-development（先写失败测试）/ context-engineering（把上下文摆对）/ source-driven-development（照官方文档写，不靠记忆）/ frontend-ui-engineering（UI 含无障碍）/ api-and-interface-design（接口契约）。另有 doubt-driven-development 用于非平凡决策的对抗复查。对应 /build。Build phase: implement tasks incrementally, one thin vertical slice at a time, each proven before moving on. Routes to incremental-implementation, test-driven-development, context-engineering, source-driven-development, frontend-ui-engineering, api-and-interface-design. Use when implementing code from a plan. Based on addyosmani/agent-skills v0.6.9."
whenToUse: "有 tasks/plan.md 或明确任务、要写代码、要加测试、要改 UI/接口时。不适用于：需求还没定（先走 define）、任务还没拆（先走 plan）。触发词：写代码、实现、增量、切片、TDD、改接口、做页面、改组件。"
user-invocable: true
disable-model-invocation: false
---

# Build（构建阶段 · 路由）

> 来源：[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) v0.6.9 的
> `incremental-implementation` / `test-driven-development` / `context-engineering` /
> `source-driven-development` / `frontend-ui-engineering` / `api-and-interface-design` /
> `doubt-driven-development`。
> 本文件是**路由层**，七份原文都是**本技能目录下的子文件**，用 `read` 按相对路径读取。

## 这个阶段干什么

**按任务清单，一次一个薄垂直切片地把代码写出来。** 每片都要被证据证明能跑，再往下走。

> ⚠️ 内嵌子文件**没有注册成独立技能**，用 `read <文件名>` 读（相对本技能目录）。

## 路由表

| 情况 | 读 |
|---|---|
| **切片主循环**（默认入口） | `incremental-implementation.md` |
| 写/改行为逻辑（要测试驱动） | `test-driven-development.md` |
| 感觉上下文不够、要摆对上下文 | `context-engineering.md` |
| 用第三方库/框架，怕凭记忆写错 | `source-driven-development.md` |
| 做 UI / 页面 / 组件 | `frontend-ui-engineering.md` |
| 设计/改 API、模块边界、契约 | `api-and-interface-design.md` |
| **非平凡决策，想对抗复查一次** | `doubt-driven-development.md` |

## 每个切片的主循环

```text
1. 读这个任务的验收标准
2. 摆好相关上下文（现有代码 / 模式 / 类型）
3. 先写一条会失败的测试（RED）
4. 写最少的代码让它过（GREEN）
5. 跑受影响范围的测试，确认没回归
6. 跑构建，确认能编译
7. 提交（一个任务一个 commit，便于回滚）
8. 在 tasks/plan.md 里把那一项勾上
```

> ⛔ **验证范围只由 diff 决定** —— 改了什么就跑相关的，**不跑全量套件**。
> 全量是人在最后那次端到端里自己决定要不要跑的事，不是这里的例行步骤。
>
> ⛔ **不要 `git add -A` 盲提。** 只暂存这个任务碰到的文件 + 它自己的状态更新，
> 这样任何一点都是干净的回滚点。

## 什么时候先读哪个

```text
要写代码
  │
  ├── 第三方库/框架不熟？ ──→ source-driven-development（先查官方文档）
  ├── 上下文不清楚？ ───────→ context-engineering
  ├── 是 UI？ ─────────────→ frontend-ui-engineering
  ├── 是接口/契约？ ────────→ api-and-interface-design
  └── 其余 ────────────────→ incremental-implementation（+ test-driven-development）
                                  │
                                  └── 这个决策非平凡/风险高？ ──→ doubt-driven-development
```

## 什么时候停

遇到下面任一种，**停下来处理，别硬推**：

| 情况 | 转去 |
|---|---|
| 测试过不去 / 构建坏了且没明显修法 | `verify`（debugging-and-error-recovery） |
| 规格有歧义，或需要规格没覆盖的决策 | 回问，别猜 |
| 高风险 / 不可逆（权限、破坏性迁移、支付、删数据、动密钥） | `doubt-driven-development` + 明确签字 |

## 边界

**做**：写实现代码、写测试、改 UI/接口、一个任务一个提交、回写任务清单。

**不做**：
- ❌ 不改需求 —— 那在 `define`
- ❌ 不重新拆任务 —— 那在 `plan`
- ❌ **不替人做主观验收**（好不好用、对不对）—— 那是 `verify` + 人
- ❌ 不做合并前评审 —— 那是 `review`

> ★ 共享纪律见 `meta`。本阶段最吃重的是 **「守住范围」** 和 **「强制简单」** ——
> 顺手改无关代码、以及过度设计，都发生在这一阶段。
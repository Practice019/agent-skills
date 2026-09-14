---
name: define
description: "Define 阶段：写代码之前先想清楚『要做什么』。四条路径 —— 需求还没影（interview-me 反问出真实意图）、有模糊想法（idea-refine 结构化发散收敛）、要落成规格（spec-driven-development 先规格后代码）、要把质量标准写下来（constraint-driven-development 把评审口味变成可执行红线）。产出 SPEC.md / 约束配置，不含任何实现。Define phase: clarify WHAT to build before any code. Four routes — interview-me (surface the real intent), idea-refine (structured divergent/convergent refinement), spec-driven-development (spec before code), constraint-driven-development (turn review taste into executable gates). Use when requirements are vague, when starting a new project or feature, or when there is no written spec. Produces a spec, not an implementation. Based on addyosmani/agent-skills v0.6.9."
whenToUse: "需求模糊、新项目/新功能起步、没有书面规格、或要把质量标准固化成门禁时。不适用于：规格已明确（走 plan）、只是修一个已知 bug（走 verify）。"
user-invocable: true
disable-model-invocation: false
---

# Define（定义阶段 · 路由）

> 来源：[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) v0.6.9 的
> `interview-me` / `idea-refine` / `spec-driven-development` / `constraint-driven-development`。
> 本文件是**路由层**，四份原文都是**本技能目录下的子文件**，用 `read` 按相对路径读取。

## 这个阶段干什么

**写代码之前，先想清楚「要做什么」。** 产出是**规格**，不是实现。

> ⚠️ 本技能内嵌的子文件**没有注册成独立技能**，`skill` 工具加载不到。
> 一律用 `read <文件名>` 读取（相对本技能目录）。

## 路由表

| 你现在的情况 | 读 | 一句话 |
|---|---|---|
| **还不知道自己要什么** | `interview-me.md` | 通过反问把真实意图问出来 |
| **有模糊想法，想看几种可能** | `idea-refine.md` | 结构化发散 + 收敛，把想法磨清楚 |
| **要把它写成规格** | `spec-driven-development.md` | 先规格后代码 |
| **要把质量标准写下来** | `constraint-driven-development.md` | 把「评审口味」变成可执行门禁 |

> ★ **拿不准从哪开始 → 先 `interview-me.md`。**
> 最常见的失败是「需求模糊却直接开写」—— 假设做错了，后面全是返工。

## 典型顺序

```text
interview-me              → 问出真实意图（还没想清时）
    ↓
idea-refine               → 把想法磨成几个可选方向（想法还模糊时）
    ↓
spec-driven-development   → 写成规格 + 验收标准
    ↓
constraint-driven-development → 把质量红线固化成可执行检查（可选，团队级）
```

**不是每一步都要走。** 需求已经很清楚 → 直接 `spec-driven-development.md`。

## 规格该包含什么

用 `spec-driven-development.md` 的模板。最低限度要有：

- **要构建什么** —— 一段话
- **验收标准** —— **二元、可测**（「能登录」不算，要能判真假）
- **不做什么** —— 范围边界，防止蔓延
- **已知约束** —— 技术栈 / 兼容性 / 性能要求

## 典型规格落点

```text
SPEC.md            仓库根
docs/SPEC.md       或这里
spec/*             或这里
```

> ⚠️ **只认这三个位置。** README 或随便一份文档**不算规格** ——
> 下游（`plan` / `build`）会按这三个路径去找，找不到就停。

## 边界

**做**：澄清需求、探索方案、写规格、固化质量红线。

**不做**：
- ❌ **不写实现代码** —— 那是 `build`
- ❌ 不拆任务 —— 那是 `plan`
- ❌ **不发明需求** —— 规格里没有的东西，问，别猜

> ★ 共享纪律（亮出假设 / 管理困惑 / 该反对就反对 / 强制简单 / 守住范围 / 验证不假设）
> 见 `meta` 技能。**其中「亮出假设」在本阶段最吃重** ——
> 假设错了，后面每个阶段都在放大它。

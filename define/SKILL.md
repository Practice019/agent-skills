---
name: define
description: "Define phase: clarify what to build before writing code. Use when starting a new project/feature, requirements are vague, or the user wants a spec-first workflow (equivalent to /spec)."
---

# Define（定义阶段）

> 对应原版 `/spec`。
> 核心理念：Spec before code。

## 目标

在写代码之前，先把“要做什么、给谁做、为什么做、验收标准是什么”搞清楚。

## 工作流程

1. 如果需求很模糊，先读取 `interview-me.md`，用一次一问的方式澄清真实意图。
2. 如果只有一个粗略想法，读取 `idea-refine.md` 做发散/收敛，把它变成可执行的概念。
3. 需求清晰后，读取 `spec-driven-development.md`，输出 PRD / SPEC.md。
4. 与用户确认规格后再进入 Plan 阶段。

## 子模块

- `interview-me.md` — 澄清需求的访谈流程。
- `idea-refine.md` — 把模糊想法打磨成具体方案。
- `spec-driven-development.md` — 输出结构化 PRD/规格的流程。

## 注意

- 不要跳过访谈直接写方案。
- 规格必须经过用户确认，才能进入下一阶段。

---
name: plan
description: "Plan phase: break a spec into small verifiable tasks. Use after a spec exists and before implementation (equivalent to /plan)."
---

# Plan（计划阶段）

> 对应原版 `/plan`。
> 核心理念：Small, atomic tasks。

## 目标

把规格拆成可执行、可验证的小任务，并排好依赖顺序。

## 工作流程

1. 读取 `planning-and-task-breakdown.md`。
2. 阅读已有 SPEC / PRD 和相关代码。
3. 按依赖关系把工作拆成小任务，每个任务包含验收标准。
4. 输出任务计划，供用户确认后再进入 Build。

## 子模块

- `planning-and-task-breakdown.md` — 任务拆分与依赖排序流程。

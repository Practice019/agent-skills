---
name: review
description: "Review phase: quality gates before merge. Use when reviewing code, simplifying, hardening security, or optimizing performance (equivalent to /review, /code-simplify, /webperf)."
---

# Review（审查阶段）

> 对应原版 `/review`、`/code-simplify`、`/webperf`。
> 核心理念：Improve code health。

## 目标

在合并之前，从正确性、可读性、架构、安全、性能五个维度把关代码质量。

## 工作流程

1. 先读取 `code-review-and-quality.md`，做五轴审查。
2. 如果代码复杂难维护，读取 `code-simplification.md` 进行简化。
3. 如果涉及用户输入/认证/数据/外部集成，读取 `security-and-hardening.md`。
4. 如果有性能要求或怀疑性能回退，读取 `performance-optimization.md`。

## 子模块

- `code-review-and-quality.md` — 五轴代码审查。
- `code-simplification.md` — 代码简化。
- `security-and-hardening.md` — 安全加固。
- `performance-optimization.md` — 性能优化。

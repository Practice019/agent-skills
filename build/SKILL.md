---
name: build
description: "Build phase: implement incrementally with tests, context, and source verification. Use when writing code for a planned task (equivalent to /build)."
---

# Build（构建阶段）

> 对应原版 `/build`。
> 核心理念：One slice at a time。

## 目标

用“薄垂直切片 + 测试驱动 + 小步提交”的方式实现功能，保证每一步都可运行、可验证。

## 工作流程

1. 先读取 `context-engineering.md`，确保当前上下文足够。
2. 读取 `incremental-implementation.md`，按薄切片方式实现。
3. 每个切片都按 `test-driven-development.md` 执行：先写失败测试，再实现，再验证。
4. 按任务类型读取对应子模块：
   - 涉及 API/模块边界 → `api-and-interface-design.md`
   - 涉及前端 UI → `frontend-ui-engineering.md`
   - 需要权威资料 → `source-driven-development.md`
   - 高风险/不确定决策 → `doubt-driven-development.md`
5. 如果失败，读取 `../verify/debugging-and-error-recovery.md` 系统排查。
6. 完成一个切片后提交，再进入下一个。

## 子模块

- `incremental-implementation.md` — 增量实现主流程。
- `test-driven-development.md` — 测试驱动开发。
- `context-engineering.md` — 上下文工程。
- `source-driven-development.md` — 基于官方文档开发。
- `doubt-driven-development.md` — 对抗性复查。
- `frontend-ui-engineering.md` — 前端 UI 工程。
- `api-and-interface-design.md` — API 与接口设计。

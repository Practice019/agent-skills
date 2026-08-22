---
name: verify
description: "Verify phase: prove behavior in real runtime and recover from failures. Use when testing, debugging, or verifying browser behavior (equivalent to /test)."
---

# Verify（验证阶段）

> 对应原版 `/test`。
> 核心理念：Tests are proof。

## 目标

用测试和真实运行数据证明代码可用，而不是“感觉应该可以”。

## 工作流程

1. 如果涉及浏览器行为，读取 `browser-testing-with-devtools.md`，用 DevTools MCP 做真实运行时验证。
2. 如果需要系统化排查失败，读取 `debugging-and-error-recovery.md`。
3. 如果还需要 TDD 细节，读取 `../build/test-driven-development.md` 作为补充。

## 子模块

- `browser-testing-with-devtools.md` — 浏览器真实环境验证。
- `debugging-and-error-recovery.md` — 系统化 Debug 与恢复。

## 注意

- 测试失败时先保留现场，再按 Debug 流程走。

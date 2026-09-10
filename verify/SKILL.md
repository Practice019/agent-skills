---
name: verify
description: "Verify 阶段：在真实运行环境里证明行为正确，并在失败时恢复（对应 /test）。要测试、要系统化调试、要验证浏览器行为，或用户直接贴出报错堆栈 / traceback / panic / 崩溃日志时使用。 Verify phase: prove behavior in real runtime and recover from failures. Use when testing, debugging, or verifying browser behavior, or when the user pastes a stack trace, traceback, panic, backtrace, or crash log (equivalent to /test)."
---

# Verify（验证阶段）

> 对应原版 `/test`。
> 核心理念：Tests are proof。

## 目标

用测试和真实运行数据证明代码可用，而不是“感觉应该可以”。

## 工作流程

1. 如果涉及浏览器行为，读取 `browser-testing-with-devtools.md`，用 DevTools MCP 做真实运行时验证。
2. 如果需要系统化排查失败，读取 `debugging-and-error-recovery.md`。
3. **如果用户直接贴出一段报错堆栈 / traceback / panic / backtrace / 崩溃日志**，读取 `stack-trace-triage.md`：先按语言识别表定位探针，再给根因、最小复现与补丁目标。
4. 如果失败顽固、复现困难或属于性能回归，转 `diagnose` 技能（顶层，独立入口）——它要求先造一条"只对这个 bug 变红"的紧凑回路，比本阶段的流程更硬。
5. 如果还需要 TDD 细节，读取 `../build/test-driven-development.md` 作为补充。

## 子模块

- `browser-testing-with-devtools.md` — 浏览器真实环境验证。
- `debugging-and-error-recovery.md` — 系统化 Debug 与恢复。
- `stack-trace-triage.md` — 堆栈/回溯排障（Python / JS-TS / Go / Rust / 语言未知 五形态探针 + 统一输出契约）。

## 注意

- 测试失败时先保留现场，再按 Debug 流程走。
- **分工**：本技能管"怎么验证、怎么从失败里恢复"；`diagnose` 管"硬 bug 的系统化定位纪律"；`stack-trace-triage.md` 管"已有堆栈、要快速定位根因"。三者入口不同，别混用。

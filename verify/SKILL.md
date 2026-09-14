---
name: verify
description: "Verify 阶段：在真实运行环境里证明行为正确，失败时系统化恢复。三条分支：test-driven-development（用测试证明）/ browser-testing-with-devtools（浏览器/DOM/console/network 运行时验证，含截图看视图）/ debugging-and-error-recovery（坏了怎么复现定位修复防复发）。另含 stack-trace-triage 用于拿到报错堆栈时快速定位根因。对应 /test。Verify phase: prove behavior in a real runtime and recover from failure. Routes to test-driven-development, browser-testing-with-devtools, debugging-and-error-recovery. Use when testing, debugging, verifying browser behavior, or when a stack trace is pasted. Based on addyosmani/agent-skills v0.6.9."
whenToUse: "要证明功能可用、要跑测试、东西坏了要排、要看浏览器实际行为、或拿到报错堆栈/traceback/panic/崩溃日志时。不适用于：还没写代码（先走 build）。触发词：测试、跑测试、验证、坏了、报错、调试、堆栈、traceback、复现、浏览器、截图。"
user-invocable: true
disable-model-invocation: false
---

# Verify（验证阶段 · 路由）

> 来源：[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) v0.6.9 的
> `test-driven-development` / `browser-testing-with-devtools` / `debugging-and-error-recovery` /
> `stack-trace-triage`。
> 本文件是**路由层**，原文是**本技能目录下的子文件**，用 `read` 按相对路径读取。

## 这个阶段干什么

**用测试和真实运行数据证明代码可用，而不是「感觉应该可以」。** 坏了就系统化恢复。

> ⚠️ 内嵌子文件**没有注册成独立技能**，用 `read <文件名>` 读（相对本技能目录）。

## 路由表

| 你要做的事 | 读 |
|---|---|
| **用测试证明行为正确**（要写/跑测试） | `test-driven-development.md` |
| **浏览器真实环境验证**（DOM / console / network / 截图看视图） | `browser-testing-with-devtools.md` |
| **东西坏了，要系统化排错** | `debugging-and-error-recovery.md` |
| **拿到一段报错堆栈 / traceback / panic / 崩溃日志** | `../_shared/references/../verify/stack-trace-triage.md` 见下 |

> 注：上游的 `stack-trace-triage` 在本库中位于 `verify/` 之外时，按
> `skills/stack-trace-triage/SKILL.md` 查找；若未搬运，则不引用。

## 三条路径的顺序

```text
1. 涉及浏览器行为？ ──→ browser-testing-with-devtools（真实运行时，含截图看视图）
2. 要系统化排查失败？ ─→ debugging-and-error-recovery（复现 → 定位 → 修 → 防复发）
3. 要证明它能用？ ────→ test-driven-development（先失败测试，再让它过）
```

## 核心纪律

**① 验证范围只由 diff 决定**

```text
git diff --name-only → 映射到包 → 反查谁依赖它
跑：受影响包 ∪ 反向依赖包
```

⛔ **不跑全量套件。** 全量是人在最后那次端到端里自己决定要不要跑的事。

> ⚠️ 影响面是**算出来的**，所以可能算漏。反查时特别当心这几类静态图看不见的依赖：
> 靠**字符串 / 反射 / DI 容器**建立的、monorepo 里**路径别名**解析不到的、
> **测试夹具包**引用方向反了的。
> **算的时候逐条检查 —— 这就是「不跑全量」的对价。**

**② 证据，不是感觉**

「看起来对」永远不够。必须有：测试通过 / 构建输出 / 运行时数据。

**③ 失败时先保留现场**

别急着回滚把证据清掉。先记录，再按 `debugging-and-error-recovery.md` 走。

## 浏览器验证：截图看视图

本环境**可以自己截图并看图**（已实测）：

```bash
# 无依赖：Chrome 无头截图
"C:\Program Files\Google\Chrome\Application\chrome.exe" \
  --headless --disable-gpu --hide-scrollbars \
  --window-size=1440,900 --screenshot=out.png <URL 或 file:// 路径>

# 需要交互/等渲染（SPA、点击、滚动）→ playwright
```

然后 **`read_image(out.png)` 自己看**。

> ⛔ **视觉验证是本技能能做的事，不该推给人。**
> 真的截不了才如实写进「请人跑一次端到端」的清单。
> **把「没跑」写成「跑过了」是最严重的错误。**

## 边界

**做**：跑测试、真实运行验证、截图看视图、系统化排错、从失败里恢复。

**不做**：
- ❌ 不写新的实现（那是 `build`）—— 除非是为了修 bug
- ❌ 不做合并前评审（那是 `review`）
- ❌ **不代替人做主观判断**（好不好用、顺不顺）—— 那只有人能判

> ★ **本技能管「怎么验证、怎么从失败恢复」；`diagnose` 管「硬 bug 的系统化定位纪律」** ——
> 失败顽固、复现困难、或属性能回归时，转 `diagnose`。
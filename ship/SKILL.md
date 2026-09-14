---
name: ship
description: "Ship 阶段：把通过 review 的改动安全送上生产 —— 六条分支：git-workflow-and-versioning（原子提交 + 干净历史）/ ci-cd-and-automation（每次改动自动门禁）/ observability-and-instrumentation（日志 / 指标 / 追踪）/ documentation-and-adrs（写「为什么」不只是「是什么」）/ deprecation-and-migration（平稳下线老系统）/ shipping-and-launch（上线清单 / 监控 / 回滚）。交付前人跑端到端。对应 /ship。Ship phase: get reviewed changes safely to production. Six routes — git-workflow-and-versioning (atomic commits, clean history), ci-cd-and-automation (automated gates), observability-and-instrumentation (logs/metrics/traces), documentation-and-adrs (the why, not the what), deprecation-and-migration (retire old systems safely), shipping-and-launch (pre-launch checklist, monitoring, rollback). A human runs the end-to-end once at the very end. Use when promoting reviewed changes to production. Based on addyosmani/agent-skills v0.6.9."
whenToUse: "代码通过 review、准备合并/发布/上线时。不适用于：还在改（先走 build）、东西坏了要查（先走 verify）。触发词：发布、上线、提交、merge、CI、回滚、deprecate、写文档。"
user-invocable: true
disable-model-invocation: false
---

# Ship（发布阶段 · 路由）

> 来源：[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) v0.6.9 的
> `git-workflow-and-versioning` / `ci-cd-and-automation` /
> `observability-and-instrumentation` / `documentation-and-adrs` /
> `deprecation-and-migration` / `shipping-and-launch`。
> 本文件是**路由层**，六份原文都是**本技能目录下的子文件**，用 `read` 按相对路径读取。

## 这个阶段干什么

**把通过 review 的改动安全送上生产。** 收尾动作：原子提交 → CI 跑过 → 文档 + 观测 → 让人跑一次端到端 → 正式发布。

> ⚠️ **全程唯一一次人工验证在这里**：所有 diff 影响面、L3 机器判定都过了之后，
> **人跑一次端到端**（见 `verify` 的"浏览器验证 / 主观判断"那条）。
> 这一步只能人做 —— 不要假装跑了。

## 路由表

| 你要做的事 | 读 |
|---|---|
| 提交 / 分支 / 原子 commit / 干净历史 | `git-workflow-and-versioning.md` |
| CI/CD 流水线 / 自动化门禁 | `ci-cd-and-automation.md` |
| 日志 / 指标 / 追踪 / 告警 | `observability-and-instrumentation.md` |
| 写文档 / ADR（"为什么"而不是"是什么"） | `documentation-and-adrs.md` |
| 下线老功能 / 迁移用户 | `deprecation-and-migration.md` |
| **上线清单 / 监控 / 回滚计划** | `shipping-and-launch.md` |

## 上线主流程

```text
1. 读 git-workflow-and-versioning.md        → 原子 commit + 干净历史
2. 读 ci-cd-and-automation.md             → 每次改动自动门禁
3. 读 observability-and-instrumentation.md → 日志 / 指标 / 追踪 / 告警
4. 读 documentation-and-adrs.md            → 写「为什么」不只是「是什么」
5. （如果是下线/迁移）deprecation-and-migration.md
6. shipping-and-launch.md                 → 上线清单 + 监控 + 回滚
7. 交付前门禁（见 verify 与 build）—— 人跑一次端到端
8. 发布
```

**不是每步都要走。** 一个内部 CLI 工具 → 大概只需要 1 + 2 + 6。
一个面向用户的 API → 1 + 2 + 3 + 4 + 6 + 7。

## 边界

**做**：原子提交、走 CI、加观测、写文档、设回滚、人跑端到端、发布。

**不做**：
- ❌ **不写新的功能代码** —— 那是 `build`
- ❌ **不替人做主观验收** —— 那是 `verify` + 人（端到端那一次）
- ❌ **不跳过端到端** —— 即便所有自动化都过；「全绿 ≠ 用户能用对」

> ★ 共享纪律见 `meta`。本阶段最吃重的是 **「守门而不是冲」** ——
> 任何看起来「已经可以了」的判断都要被端到端 + 回滚计划拦住。
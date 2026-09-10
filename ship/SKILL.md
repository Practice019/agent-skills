---
name: ship
description: "Ship 阶段：带着信心部署——生产发布、CI/CD、废弃下线、文档、正式上线（对应 /ship）。当准备发版或上线时使用。 Ship phase: deploy with confidence. Use when preparing production release, setting up CI/CD, deprecating, documenting, or launching (equivalent to /ship)."
---

# Ship（发布阶段）

> 对应原版 `/ship`。
> 核心理念：Faster is safer。

## 目标

上线前确保版本控制、CI/CD、监控、文档、回滚方案都到位。

## 工作流程

1. 读取 `git-workflow-and-versioning.md`，确保提交与版本管理规范。
2. 读取 `ci-cd-and-automation.md`，确认流水线质量门禁。
3. 如果涉及下线/迁移，读取 `deprecation-and-migration.md`。
4. 如果涉及架构决策或文档，读取 `documentation-and-adrs.md`。
5. 读取 `observability-and-instrumentation.md`，确认日志、指标、追踪、告警。
6. 最后读取 `shipping-and-launch.md`，执行上线检查清单并准备回滚方案。
7. 如果是**把本地项目发布到 npm / GitHub**（打 tag、Release、topics、自动化发版），读 `../push-project/SKILL.md`（独立顶层技能）——它的第 0 步是强制确认发布目标，按目标只执行对应章节。

## 子模块

- `git-workflow-and-versioning.md` — Git 工作流与版本管理。
- `ci-cd-and-automation.md` — CI/CD 与自动化。
- `deprecation-and-migration.md` — 废弃与迁移。
- `documentation-and-adrs.md` — 文档与 ADR。
- `observability-and-instrumentation.md` — 可观测性与埋点（日志、RED 指标、OpenTelemetry 追踪、告警）。
- `shipping-and-launch.md` — 发布与上线清单。

## 相关技能

- `../push-project/SKILL.md` — npm/GitHub 具体发布流程（含 `scripts/release-github.ps1`）；保持独立顶层技能可按名直接调用。

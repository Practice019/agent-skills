---
name: meta
description: "Meta skill for discovering and routing to the right agent-skill category. Use when starting a session, when unsure which skill applies, or when you need the shared operating rules for this skill pack."
---

# Meta（元技能）

> 对应原版 `using-agent-skills`。

## 目标

当你不知道当前任务应该走哪个分类流程时，先用这个入口做判断。

## 工作流程

1. 读取 `using-agent-skills.md`，了解整个 skill 包的分类和触发规则。
2. 根据当前任务判断所属阶段：
   - 需求不清晰 → `define`
   - 已有规格需要拆任务 → `plan`
   - 开始写代码 → `build`
   - 验证/调试 → `verify`
   - 合并前审查 → `review`
   - 上线发布 → `ship`
3. 加载对应分类入口（`skill_load define` / `skill_load build` 等）。

## 子模块

- `using-agent-skills.md` — 全局使用规则与 Skill 发现方法。

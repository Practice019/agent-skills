---
name: review
description: "Review 阶段：合并前的质量门禁 —— 不由子代理做的主脑自查 + 四条分支：code-review-and-quality（五轴评审：correctness / readability / architecture / security / performance）/ code-simplification（保持行为不增复杂度）/ security-and-hardening（OWASP 防护、输入验证、最小权限）/ performance-optimization（先度量再优化）。代码 review 是主脑读本技能自跑；对抗性独立第二意见（评审档子代理）可在交付前派一次。对应 /review。Review phase: pre-merge quality gate. The main brain reads this skill and runs the review itself (not delegated to subagents); four routes — code-review-and-quality (5-axis), code-simplification, security-and-hardening, performance-optimization. An optional adversarial second-opinion subagent (评审档) may be dispatched once before delivery, but the gate itself is the main brain's call. Use before merging. Based on addyosmani/agent-skills v0.6.9."
whenToUse: "代码已写、测试已过、准备合并前的质量把关时。不适用于：还在改代码（先走 build）、东西坏了要查（先走 verify）。触发词：评审、code review、自查、合并前、安全加固、性能优化、简化。"
user-invocable: true
disable-model-invocation: false
---

# Review（评审阶段 · 路由）

> 来源：[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) v0.6.9 的
> `code-review-and-quality` / `code-simplification` / `security-and-hardening` /
> `performance-optimization`。
> 本文件是**路由层**，四份原文都是**本技能目录下的子文件**，用 `read` 按相对路径读取。

## 这个阶段干什么

**合并前的质量门禁。** 主脑读这四份子文件，按五条轴过一遍。**不派子代理做代码 review**（审查是判断不是读文件 → 但本技能是路由，所以路由后读 + 自己评是 OK 的，**主脑自己跑这个判断**）。

> ⚠️ **可派但不必须派**：交付前可以派一个**评审档**子代理做一次独立第二意见（与本技能的读 + 自查并行）—— 那是对抗性独立视角，**不是** code review 本身。
> code review 门禁 = **主脑读这些文件 + 主脑自己评**。主脑既是作者又是验收者，主脑必须用流程化检查来对冲同作者盲区。

## 路由表

| 情况 | 读 |
|---|---|
| **常规五轴评审**（correctness / readability / architecture / security / performance） | `code-review-and-quality.md` |
| 代码太复杂、想清掉不必要的复杂度 | `code-simplification.md` |
| 涉及安全边界（认证 / 输入 / 数据出口） | `security-and-hardening.md` |
| 性能回归 / 公开性能指标 | `performance-optimization.md` |

## 五个必须过的轴

每条都用一句问句自查（详细检查项在子文件里）：

1. **正确**（correctness）—— 它做对了吗？测试覆盖了边界吗？
2. **可读**（readability）—— 别人能 5 分钟内看懂这段在干嘛吗？
3. **架构**（architecture）—— 这段属于它该在的层吗？抽象配得上复杂度吗？
4. **安全**（security）—— 有输入验证吗？权限最小吗？密钥/数据出口安全吗？
5. **性能**（performance）—— 关键路径变慢了吗？N+1 / 大循环 / 不必要的拷贝？

**项目级硬要求**（任何改动都要过）：见 `../_shared/references/definition-of-done.md`。

## 主脑怎么做这次评审

```text
1. 读 code-review-and-quality.md（5 轴检查表）
2. 逐轴对照 diff
3. 触发具体子文件：
   · 太复杂       → code-simplification.md
   · 涉及安全边界 → security-and-hardening.md
   · 性能回归     → performance-optimization.md
4. 列问题清单（按严重度：安全 > 正确 > 性能 > 可读 > 架构）
5. 修或回滚
6. 提交（一个修复一个 commit）
```

> ⛔ **不要"我觉得差不多"就过。** 同作者对同段代码的盲区是结构性的；
> 流程化检查是对冲，不是替代 —— 真的复杂的部分，**派评审档子代理做一次独立第二意见**（交付前一次）。

## 边界

**做**：读四份子文件、按五轴自查、必要时派独立第二意见、列问题清单、修或回滚。

**不做**：
- ❌ **不写新的实现**（除非是为了修 review 发现的 bug）—— 那是 `build`
- ❌ **不替人做主观判断**（好不好用、对不对） —— 那是 `verify` + 人
- ❌ **不派子代理做 code review**（见上方 ⚠️）—— 那是**主脑**读 + **主脑**评

> ★ 共享纪律见 `meta`。本阶段最吃重的是 **「主动反对」** 与 **「强制简单」** ——
> 发现问题要直接讲；代码越简单越容易过五轴。
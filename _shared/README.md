# `_shared/` — 跨技能共享资源

本目录**不是技能**：它没有 `SKILL.md`，DSH 的技能扫描器不会注册它（扫描规则为「一层子项是 `.md`，或两层时第二段为 `SKILL.md`」）。

## 目录

```text
_shared/
├── README.md              ← 本文件
├── validate-skills.cjs    ← 技能库校验器（只读，不修改任何文件）
└── references/            ← 7 个跨技能共享清单
```

## 怎么引用

从任意技能目录出发，用**相对路径**（`read` 工具不展开 `~`；技能加载时 harness 会注入 `Base directory for this skill: ...`）：

| 引用方位置 | 写法 |
|---|---|
| `<技能>/SKILL.md` | `../_shared/references/security-checklist.md` |
| `<技能>/<模块>.md` | `../_shared/references/security-checklist.md` |
| `<技能>/support/<模块>/<文件>.md` | `../../../_shared/references/security-checklist.md` |

## 单一来源裁决（2026-09-09）

这 7 个文件此前被复制到 7–10 个位置（共 57 份 / 474 KB），并已出现版本漂移。现统一到本目录，权威版本判定依据如下：

| 文件 | 原副本数 | 版本差异 | 取用版本 |
|---|---|---|---|
| `accessibility-checklist.md` | 9 | 仅行尾（CRLF vs LF），内容一致 | `build/references/` |
| `definition-of-done.md` | 7 | 无差异 | `build/references/` |
| `observability-checklist.md` | 7 | 无差异 | `build/references/` |
| `orchestration-patterns.md` | 8 | 仅行尾，内容一致 | `build/references/` |
| `performance-checklist.md` | 10 | 仅行尾，内容一致 | `build/references/` |
| `security-checklist.md` | 10 | **内容差异**：`build/references/` 版多出 `Threat Modeling (Start Here)`、`Install-Script Gate`、`AI / LLM Security`、`OWASP Top 10 for LLMs` 四节 | `build/references/`（超集） |
| `testing-patterns.md` | 8 | **内容差异**：`build/references/` 版使用新版 Playwright 选择器（`getByRole` / `getByLabel`），`build/support/` 版是旧的 `page.fill('[name=...]')` | `build/references/`（更新） |

## 校验器

```powershell
node "$env:USERPROFILE\.dsh\skills\_shared\validate-skills.cjs"
```

检查项：frontmatter 可解析 / `name` 为 kebab-case 且与目录名一致 / 无 CRLF / 「指示 agent 去读」的仓库内引用可解析 / 无 `read ~/` / 无含用户名的绝对路径。退出码 `0` = 全绿。

校验器内置的「非仓库引用」豁免（技能指示 agent 去读**用户项目**或**运行时**里的东西，仓库内本就不存在）：
`DESIGN.md`、`tasks/`、`SPEC.md`、`PRD*`、`src/`、`tests/`、`docs/`、`package.json`、`agent-workspace\`、`$VAR` 形式。

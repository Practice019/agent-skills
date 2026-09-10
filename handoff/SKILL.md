---
name: handoff
description: "将当前对话压缩为交接文档，供下一个 Agent 无缝接续工作 Compact the current conversation into a handoff document for another agent to pick up. Use when user wants to hand off work, summarize progress, or prepare context for a new session."
user-invocable: true
---


# Handoff

## What to do

Write a handoff document summarising the current conversation so a fresh agent can continue the work.

**File path**: Save to `docs/handoff-<timestamp>.md`. If `docs/` doesn't exist, save to the project root instead. Get the timestamp with `pwsh`: `Get-Date -Format 'yyyyMMdd-HHmmss'`（POSIX 环境才是 `date +%Y%m%d-%H%M%S`）。

Before writing, use Read to scan for existing artifacts (PRDs, ADRs, open issues, recent diffs) so you can reference rather than duplicate them.

Do not duplicate content already captured in other artifacts. Reference them by relative path or URL instead.

If the user passed arguments, treat them as a description of what the next session will focus on — use that to weight the "Next steps" section accordingly.

## Handoff document structure

```markdown
# Handoff: <brief description of what was worked on>

## Current state
What was accomplished in this session. Key decisions made, code written, problems solved.
Be specific but concise — bullet points preferred. Include file paths changed if relevant.

## Next steps
What the next session should tackle, in priority order.
If user provided a focus argument, lead with that.

## Relevant artifacts
Links or paths to artifacts that provide context — don't inline their content here:
- `docs/prd-*.md` — PRD if one exists
- `docs/adr/*.md` — relevant ADRs
- Issue URLs — open tickets
- Branch / PR — if a diff exists

## Suggested skills
Skills the next session should load. For each, one line explaining why:
- `diagnose` — if there is an unresolved bug to investigate
- `build`（其 `test-driven-development.md`）— if the next task is implementing a feature with tests
- `to-issues` — if a plan needs to be broken into tickets
- `define`（其 `grilling.md`）— if a design decision still needs to be resolved
- `plan`（其 `zoom-out.md`）— if the next session will enter unfamiliar code
- `handoff` — if the session will need to hand off again
Only list skills relevant to the actual next steps; omit the rest.
```

## Tools

- **Read**: Scan existing artifacts before writing, to avoid duplicating content
- **Write**: Write the handoff document to disk
- **Bash**: Get the current timestamp (`date +%Y%m%d-%H%M%S`) for the filename

---

## DSH 工具映射（本副本补充）

| 上游 | DSH |
|---|---|
| Read | `read` |
| Write / Edit | `write` / `edit` |
| Bash | `pwsh` |
| Grep / Glob | `grep` / `glob` |

时间戳在 Windows 上用 `Get-Date -Format 'yyyyMMdd-HHmmss'`；`date +%Y%m%d-%H%M%S` 在本机 PowerShell 里不可用。

保存位置：优先 `docs/handoff-<timestamp>.md`；项目里没有 `docs/` 就放项目根目录。写之前先扫已有产物（PRD / ADR / issue / 最近 diff），**引用**而不是复制它们的内容。

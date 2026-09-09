---
name: github-cli
description: "用 gh CLI 操作 GitHub：PR 状态与 CI 检查、issue 创建与筛选、workflow run 日志、gh api 查询与 jq 过滤。当用户要查 PR/CI 状态、提 issue、看构建日志、跑 GitHub API 查询时使用。 GitHub operations via `gh` CLI: issues, PRs, CI runs, code review, API queries. Use when: (1) checking PR status or CI, (2) creating/commenting on issues, (3) listing/filtering PRs or issues, (4) viewing run logs. NOT for: complex web UI interactions requiring manual browser flows (use browser tooling when available), bulk operations across many repos (script with gh api), or when gh auth is not configured."
whenToUse: "用户提到 PR、pull request、issue、CI、workflow、run logs、gh、GitHub API、代码评审，或给出 owner/repo 并要求查看/创建 GitHub 侧对象时。"
metadata:
  provenance:
    origin: openclaw-derived
    license: MIT
    upstream_url: https://github.com/openclaw/openclaw
    upstream_skill: github
    ported_from: opensquilla-bundled-skills
---

# GitHub CLI

Use the `gh` CLI to interact with GitHub repositories, issues, PRs, and CI.

## DSH runtime notes

- `gh` is **not** bundled with DSH. Before running anything, confirm it exists:
  `pwsh: Get-Command gh -ErrorAction SilentlyContinue`. If it is missing, stop and tell the
  user the exact install command instead of inventing output:
  - Windows: `winget install --id GitHub.cli`
  - macOS: `brew install gh`
  - Debian/Ubuntu: `sudo apt install gh`
- Auth is per-machine: `gh auth status` first. If it reports "not logged in", ask the user to run
  `gh auth login` themselves (it is interactive) — do not attempt to script the login.
- DSH runs commands through `pwsh`. The snippets below are POSIX-style; on Windows use
  `pwsh -Command` with the same flags, and prefer `--repo owner/repo` over relying on cwd.
- For bulk or cross-repo work, generate a script that calls `gh api` rather than looping the
  model over many `gh` calls.
- When a request needs real browser interaction (web UI flows, screenshots, clicking), use the
  `browser-harness` skill instead — `gh` cannot drive the web UI.

## Setup

```bash
# Authenticate (one-time)
gh auth login

# Verify
gh auth status
```

## Common Commands

### Pull Requests

```bash
# List PRs
gh pr list --repo owner/repo

# Check CI status
gh pr checks 55 --repo owner/repo

# View PR details
gh pr view 55 --repo owner/repo

# Create PR
gh pr create --title "feat: add feature" --body "Description"

# Merge PR
gh pr merge 55 --squash --repo owner/repo
```

### Issues

```bash
# List issues
gh issue list --repo owner/repo --state open

# Create issue
gh issue create --title "Bug: something broken" --body "Details..."

# Close issue
gh issue close 42 --repo owner/repo
```

### CI/Workflow Runs

```bash
# List recent runs
gh run list --repo owner/repo --limit 10

# View specific run
gh run view <run-id> --repo owner/repo

# View failed step logs only
gh run view <run-id> --repo owner/repo --log-failed

# Re-run failed jobs
gh run rerun <run-id> --failed --repo owner/repo
```

### API Queries

```bash
# Get PR with specific fields
gh api repos/owner/repo/pulls/55 --jq '.title, .state, .user.login'

# List all labels
gh api repos/owner/repo/labels --jq '.[].name'

# Get repo stats
gh api repos/owner/repo --jq '{stars: .stargazers_count, forks: .forks_count}'
```

## JSON Output

Most commands support `--json` for structured output with `--jq` filtering:

```bash
gh issue list --repo owner/repo --json number,title --jq '.[] | "\(.number): \(.title)"'
gh pr list --json number,title,state,mergeable --jq '.[] | select(.mergeable == "MERGEABLE")'
```

## Templates

### PR Review Summary

```bash
# Get PR overview for review
PR=55 REPO=owner/repo
echo "## PR #$PR Summary"
gh pr view $PR --repo $REPO --json title,body,author,additions,deletions,changedFiles \
  --jq '"**\(.title)** by @\(.author.login)\n\n\(.body)\n\n📊 +\(.additions) -\(.deletions) across \(.changedFiles) files"'
gh pr checks $PR --repo $REPO
```

### Issue Triage

```bash
# Quick issue triage view
gh issue list --repo owner/repo --state open --json number,title,labels,createdAt \
  --jq '.[] | "[\(.number)] \(.title) - \([.labels[].name] | join(", ")) (\(.createdAt[:10]))"'
```

## Notes

- Always specify `--repo owner/repo` when not in a git directory
- Use URLs directly: `gh pr view https://github.com/owner/repo/pull/55`
- Rate limits apply; use `gh api --cache 1h` for repeated queries
- Quote `--jq` expressions in `pwsh` with single quotes so the shell does not expand `$` or `\`
- If a command fails, report the exact `gh` stderr text; do not paraphrase a plausible failure

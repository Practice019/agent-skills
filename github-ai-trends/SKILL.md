---
name: github-ai-trends
description: "生成 GitHub AI 热门项目趋势排行榜报告 Generate GitHub AI trending project reports as formatted text leaderboards. Fetches top-starred AI/ML/LLM repos by daily, weekly, or monthly period and renders a styled leaderboard. Use when the user asks for AI project trends, GitHub trending, AI leaderboard, or wants to see popular AI repos."
user-invocable: true
---

# GitHub AI Trends

Generate formatted leaderboard of trending AI projects on GitHub, output directly to chat.

## Usage

Run the script and paste its stdout as the reply:

```bash
python scripts/fetch_trends.py --period weekly --limit 20
```

## Parameters

- `--period`: `daily` | `weekly` | `monthly` (default: weekly)
- `--limit`: Number of repos (default: 20)
- `--token`: GitHub token for higher rate limits (or set `GITHUB_TOKEN` env)
- `--json`: Output raw JSON instead of formatted text

## How It Works

1. Searches GitHub API for AI-related repos (by keywords + topics) pushed within the period
2. Deduplicates and sorts by star count
3. Outputs a formatted markdown leaderboard ready for chat display

## Notes

- Without a GitHub token, API rate limit is 10 requests/minute. With token: 30/minute.
- No pip dependencies, uses only stdlib.
- Output is markdown formatted for direct chat display.

---

## DSH 运行说明（本副本补充）

- **解释器**：用 `python`，不要用 `python3`（本机是 Store 占位程序）。零 pip 依赖。
- **Token 注入**：token 在 `$env:USERPROFILE\.dsh\secrets\github.token`。

~~~powershell
$env:GITHUB_TOKEN = (Get-Content "$env:USERPROFILE\.dsh\secrets\github.token" -Raw).Trim()
python scripts/fetch_trends.py --period weekly --limit 20
~~~

- 脚本路径相对**本技能目录**：`scripts/fetch_trends.py`。
- 输出是 markdown 排行榜，直接把 stdout 作为回复贴给用户。

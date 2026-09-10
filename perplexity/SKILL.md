---
name: perplexity
description: "用 Perplexity API 做带引用的 AI 网络搜索：单条或批量查询、返回 grounded 答案与引用（需 PERPLEXITY_API_KEY；本机当前未配置）。 Search the web with AI-powered answers via Perplexity API. Returns grounded responses with citations. Supports batch queries."
user-invocable: true
---

# Perplexity Search

AI-powered web search that returns grounded answers with citations.

## Search

Single query:
```bash
node scripts/search.mjs "what's happening in AI today"
```

Multiple queries (batch):
```bash
node scripts/search.mjs "What is Perplexity?" "Latest AI news" "Best coffee in NYC"
```

## Options

- `--json`: Output raw JSON response

## Notes

- Requires `PERPLEXITY_API_KEY` environment variable
- Responses include citations when available
- Batch queries are processed in a single API call

---

## DSH 运行状态（本副本补充）

> ⚠️ **未配置密钥：当前不可用。** 本机没有 `PERPLEXITY_API_KEY`，直接跑 `scripts/search.mjs` 会以
> `Error: PERPLEXITY_API_KEY environment variable not set` 退出。**缺 key 时不要调用本脚本**，
> 改用 DSH 原生的 `web_search` / `tavily_search`（同样带引用），并在回复里如实说明未走 Perplexity。

**启用步骤（拿到 key 后）**：

1. 到 <https://www.perplexity.ai/settings/api> 生成 key（形如 `pplx-...`）
2. 存成单行文件：`$env:USERPROFILE\.dsh\secrets\perplexity.key`
3. 调用时临时注入：

~~~powershell
$env:PERPLEXITY_API_KEY = (Get-Content "$env:USERPROFILE\.dsh\secrets\perplexity.key" -Raw).Trim()
node scripts/search.mjs "查询一" "查询二"
~~~

- 脚本路径相对**本技能目录**：`scripts/search.mjs`（上游用外部专用的 baseDir 占位符拼路径，已替换为相对路径）。
- 一次可传多条 query，同一请求内批量处理；`--json` 输出原始响应。
- 密钥不写进本文件，运行时从文件读。

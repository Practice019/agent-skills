---
name: cli-anything-hub
description: "发现并安装面向 agent 的专业软件 CLI：实时目录、分类检索、一键安装（cli-hub），覆盖 3D/图像/AI/办公/视频等。 Discover agent-native CLIs for professional software. Access the live catalog to find tools for creative workflows, productivity, AI, and more."
user-invocable: true
---

# CLI-Hub Meta-Skill

CLI-Hub is a marketplace of agent-native command-line interfaces that make professional software accessible to AI agents.

## Quick Start

```bash
# Install the CLI Hub package manager
pip install cli-anything-hub

# Browse all available CLIs
cli-hub list

# Search by category or keyword
cli-hub search image
cli-hub search "3d modeling"

# Install a CLI
cli-hub install gimp

# Show details for a CLI
cli-hub info gimp
```

## Live Catalog

**URL**: [`https://clianything.cc/SKILL.txt`](https://clianything.cc/SKILL.txt)

The catalog is auto-updated and provides:
- Full list of available CLIs organized by category
- One-line `cli-hub install` commands for each tool
- Complete descriptions and usage patterns

**Note**: The file is served as `.txt` but contains markdown formatting for easy parsing.

## What Can You Do?

CLI-Hub covers a broad range of software and codebases, empowering agents to conduct complex workflows via CLI:

- **Creative workflows**: Image editing, 3D modeling, video production, audio processing, music notation
- **Productivity tools**: Office suites, knowledge management, live streaming
- **AI platforms**: Local LLMs, image generation, AI APIs, research assistants
- **Communication**: Video conferencing and collaboration
- **Development**: Diagramming, browser automation, network management
- **Content generation**: AI-powered document and media creation

Each CLI provides stateful operations, JSON output for agents, REPL mode, and integrates with real software backends.

## How It Works

`cli-hub` is a lightweight wrapper around `pip`. When you run `cli-hub install gimp`, it installs a separate Python package (`cli-anything-gimp`) with its own CLI entry point (`cli-anything-gimp`). Each CLI is an independent pip package — `cli-hub` simply resolves names from the registry and tracks installs.

## How to Use

1. **Install cli-hub**: `pip install cli-anything-hub`
2. **Find your tool**: `cli-hub search <keyword>` or `cli-hub list -c <category>`
3. **Install**: `cli-hub install <name>` (installs the `cli-anything-<name>` pip package)
4. **Run**: `cli-anything-<name>` for REPL, or `cli-anything-<name> <command>` for one-shot
5. **JSON output**: All CLIs support `--json` flag for machine-readable output

## Example Workflow

```bash
# Install the hub
pip install cli-anything-hub

# Find what you need
cli-hub search video

# Install it
cli-hub install kdenlive

# Use it with JSON output
cli-anything-kdenlive --json project create --name my-project
```

## More Info

- Live Catalog: https://clianything.cc/SKILL.txt
- Web Hub: https://clianything.cc
- Repository: https://github.com/HKUDS/CLI-Anything

---

## DSH 安装状态（本副本补充）

**已安装**：`uv tool install cli-anything-hub` → 版本 0.4.1，可执行文件 `cli-hub`（隔离环境，未污染 anaconda）。

~~~powershell
cli-hub --version      # cli-hub 0.4.1
cli-hub list           # 实时目录
cli-hub search image
cli-hub install <name> # 装的是独立 pip 包 cli-anything-<name>
~~~

> ⚠️ **第三方安装需人工确认**：`cli-hub install <name>` 会按目录解析结果实际安装 pip 包。这些包由第三方维护，
> 不是 DSH 组件。**安装前先向用户说明将要装的包名与用途并取得同意**，不要自动安装或批量安装。

- 上游写的 `pip install cli-anything-hub` 在本机可用，但推荐 `uv tool install`（隔离、可用 `uv tool uninstall` 卸载）。
- 实时目录：<https://clianything.cc/SKILL.txt>；上游仓库：<https://github.com/HKUDS/CLI-Anything>。

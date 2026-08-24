---
name: graphify
description: "用 graphify 把任意项目文件夹（代码/文档/论文/图片）构建成可查询的知识图谱，生成交互式网页、Obsidian 笔记库与审计报告，并支持图谱查询。当用户要求分析项目结构、生成知识图谱、做代码架构可视化、或查询已有图谱（graphify-out/）时使用。"
whenToUse: "用户给出一个本地项目目录并要求：生成知识图谱、分析项目架构/模块边界、做代码结构可视化、把代码库变成 AI 可检索的图谱、或对已生成的 graphify-out/ 图谱做查询/路径/解释。"
user-invocable: true
disable-model-invocation: false
---

# graphify 知识图谱技能

## 目标与边界

**做**：用本地 graphify 工具把项目文件夹变成可查询的知识图谱，产出 `graphify-out/`（交互式 HTML、Obsidian 库、GRAPH_REPORT.md、graph.json），并能对图谱做查询（query / path / explain）。

**不做**：
- ❌ 不做逐行代码讲解（图谱是"大图景"结构分析）
- ❌ 不依赖 Claude/LLM 做语义提取（本技能走 AST-only 结构提取，0 token）
- ❌ 不修改被分析项目的源代码

## 前置条件

- graphify 已安装在 `D:\project_GIT\graphify`，其虚拟环境为 `D:\project_GIT\graphify\.venv\Scripts\python.exe`
- 本技能自带的流水线脚本：`run_graphify.py`（与本 SKILL.md 同目录）
- 若 venv 缺失或 import 失败，用以下命令重建（注意：**不要装 graspologic**，它在 Python 3.13 上会因 gensim 构建失败；聚类已改用 networkx Louvain）：

```powershell
python -m venv D:\project_GIT\graphify\.venv
D:\project_GIT\graphify\.venv\Scripts\python.exe -m pip install networkx tree-sitter "tree-sitter-python" "tree-sitter-javascript" "tree-sitter-typescript" "tree-sitter-go" "tree-sitter-rust" "tree-sitter-java" "tree-sitter-c" "tree-sitter-cpp" "tree-sitter-ruby" "tree-sitter-c-sharp" "tree-sitter-kotlin" "tree-sitter-scala" "tree-sitter-php"
D:\project_GIT\graphify\.venv\Scripts\python.exe -m pip install -e D:\project_GIT\graphify --no-deps
```

## 工作流程

### 1. 构建图谱（主体流水线，分两阶段）

**工作目录 = 用户要分析的项目目录**（产物 `graphify-out/` 和临时 `.graphify_*.json` 都会生成在那里）。

**Phase 1 —— 检测 + AST 提取 + 建图 + 聚类 + 分析：**

```powershell
& 'D:\project_GIT\graphify\.venv\Scripts\python.exe' '<技能目录>\run_graphify.py' phase1 '<项目绝对路径>'
```

（`<技能目录>` 即本 SKILL.md 所在目录；脚本会把 `graphify-out/GRAPH_REPORT.md`、`graphify-out/graph.json` 和 `.graphify_analysis.json` 写好，并打印每个社区的节点清单。）

Phase 1 结束后，**必须为社区写语义化标签**：阅读打印的 COMMUNITY OVERVIEW，为每个 `community N` 写一个 2-5 字中文名（如 "配置系统"、"SQLAlchemy ORM 模型"、"SQL 生成节点"），保存为 JSON（键为字符串数字）：

```json
{"0": "数据仓库与检索客户端", "1": "元数据仓库", "2": "ORM 模型与映射器"}
```

**Phase 2 —— 用标签重生成报告 + Obsidian 库 + HTML + manifest/成本记录：**

```powershell
& 'D:\project_GIT\graphify\.venv\Scripts\python.exe' '<技能目录>\run_graphify.py' phase2 '<项目绝对路径>' '<标签文件路径>'
```

### 2. 查询图谱（分析完成后）

在项目目录下运行，用 venv 的 python：

**query（BFS 默认 / DFS 追踪链路）**：加载 `graphify-out/graph.json`，按问题关键词找 1-3 个最匹配节点，BFS 3 层或 DFS 6 层展开子图，用节点/边/confidence/source_location 回答——只依据图谱内容回答，图里没有就直说，**绝不虚构边**。

**path（两概念最短路径）**：`networkx.shortest_path`，解释每一跳的含义。

**explain（解释单个节点）**：列出该节点及其全部连接（relation + confidence + source 文件），写 3-5 句白话解释。

可用以下通用片段（替换 QUESTION/MODE/NODE_A/NODE_B）：

```python
import json, networkx as nx
from networkx.readwrite import json_graph
from pathlib import Path
G = json_graph.node_link_graph(json.loads(Path('graphify-out/graph.json').read_text()), edges='links')
# 按 label 匹配节点 → nx.bfs_tree / nx.dfs_tree / nx.shortest_path → 打印节点+边+关系+置信度
```

### 3. 增量更新（--update）

对同一项目再次分析时，`run_graphify.py` 会重新 detect 全部文件。若只想重提取变更文件，可直接改调 `graphify.detect.detect_incremental` + 重跑 AST；日常使用直接重跑 phase1+phase2 即可（AST 是确定性的、免费且快）。

### 4. 可选高级用法

- `--watch` 自动监听：`python -m graphify.watch <目录> --debounce 3`（代码变更即时重建，文档/图片变更会写 needs_update 提示）
- git 钩子：`graphify hook install`（每次 commit 后自动重建）
- MCP 服务：`python -m graphify.serve graphify-out/graph.json`（供其他 agent 查询）

## 输出模板

产物固定生成在项目目录下的 `graphify-out/`：

```
graphify-out/
├── graph.html       ★ 交互式图谱网页（浏览器直接打开）
├── obsidian/        221+ 篇笔记，可作为 Obsidian 库打开
├── GRAPH_REPORT.md  ★ 审计报告（God Nodes / Surprising Connections / Suggested Questions / Communities）
├── graph.json       持久化图谱（可跨会话查询）
├── manifest.json    增量更新清单
├── cost.json        token 成本记录（AST-only 为 0）
└── cache/           SHA256 缓存
```

汇报时向用户粘贴 GRAPH_REPORT.md 的 **God Nodes**、**Surprising Connections**、**Suggested Questions** 三节（不要全文），并指出 graph.html 的打开方式。

## 注意事项

- **AST-only 局限**：本技能跳过语义提取（docs/papers/images 的概念提取需要 Claude/LLM）。因此图谱回答"结构问题"（谁依赖谁、模块边界、调用链），不回答"业务语义"问题。检测到 docs/images 时要在汇报中说明这一局限。
- **聚类回退**：Python 3.13 上 graspologic 无法安装，脚本已用 networkx Louvain（`louvain_communities`）替代 Leiden，社区编号与原始实现可能不同——这是预期的。
- **路径处理**：项目路径可能含中文/括号（如 `【海量资源：kebaiwan.net】`），统一用 `Path` 对象和 PowerShell 引号包裹，避免转义问题。
- **报告怪癖**：`GRAPH_REPORT.md` 中部分社区可能显示 "Nodes (0)"，这是报告生成器的显示问题，完整数据在 `graph.json` 与 `obsidian/` 中，不要据此判断社区为空。
- **诚实规则**：不虚构边；不确定的关系标注 AMBIGUOUS；图超过 5000 节点时不做 HTML 可视化（改用 Obsidian）。
- **临时文件**：运行会在项目目录留下 `.graphify_*.json` 中间文件，phase2 会自动清理；若中断可手动删除。

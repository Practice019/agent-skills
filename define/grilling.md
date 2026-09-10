# Grilling（方案拷问）

> 来自 mattpocock/skills（MIT）的 `grilling`，作为本技能（define）的子模块内嵌；相对本技能目录读取。
> 触发：用户说「拷问我」「grill me」「压力测试我的方案」「这个设计站得住吗」，或你已经拿到一个成形的方案/决定、但还没人挑战过它。

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask _now_ without guessing at answers you haven't heard yet. Ask the whole frontier in one round: number each question and give your recommended answer. Then wait for the user's answers before the next round.

Format a round like so:

```
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>

---

❓ **Q2** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

Each round the user answers reshapes the tree: settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one.

Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent to find it; don't ask the user for anything you could look up yourself. Don't block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the sub-agent to report; ask the rest of the frontier now. The _decisions_ are the user's: put each to them and wait.

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Do not act on it until the user confirms you have reached a shared understanding.

## DSH 适配（本副本补充）

| 上游写法 | DSH 对应 |
|---|---|
| dispatch a sub-agent | `subagent`（后台默认；需要结果再设 `run_in_background: false`）／需要继承当前会话上下文时用 `subagent_fork` |
| 查文件事实 | `read` / `grep` / `glob`（不要问用户能自己查到的东西） |
| 写盘 | `write` / `edit` |

几条本地约定：

- **事实自己查，决定交用户** —— 这是本技能与 `interview-me.md` 的分界线：`interview-me` 挖需求，本模块挖**决策的后果**。
- **一轮问完整个 frontier**，不要挤牙膏式一次一问；每个问题必须带你的推荐答案，否则等于把思考成本推回用户。
- **不落盘、不动手**：拷问的产出是"共识"，不是文档。用户确认达成共识后，再走 `spec-driven-development.md`。
- 与 `doubt-driven-development`（在 build 阶段）的分工：那里是**实施中**对非平凡决定做交叉质证；这里是**动手前**把方案整棵树走一遍。

---
name: python-code-standards
description: "Python 代码规范与风格总纲：命名、格式、类型标注、NEVER 红线、质量自检与 AI 反模式信号。当 AI 需要按企业级规范编写、修改或审查 Python 代码时加载本技能，完整规则在本技能目录 topics/ 子文件中，按本文索引读取。"
whenToUse: "写/改/审查 Python 代码，或需要让 AI 生成的代码符合统一代码规范时。"
---

# Python 代码规范与风格（总纲与索引）

> 来源：改编自 Anchor（MIT）· python-agents-rules · 面向 Python 栈与中文团队。

## 技能文件布局

本技能目录内的规则文件（相对本 SKILL.md 解析）：

```
python-code-standards/
├── SKILL.md                # 本文件：总纲 + 索引
└── topics/
    ├── 01-principles.md              # 质量底线原则
    ├── 02-code-style.md              # 代码风格（工具链/命名/类型/写法）
    ├── 03-project-structure.md       # 项目目录与模块结构
    ├── 04-linting-type-checking.md   # ruff/mypy/vulture 工具链与配置
    ├── 05-error-handling.md          # 错误处理写法
    ├── 06-quality-standards.md       # 代码质量标准大全（19 项自检清单）
    ├── 07-ai-anti-patterns.md        # AI 代码反模式检测
    └── 08-never-list.md              # 代码/注释/测试写法红线（NEVER）
```

**使用方式：先读本文件的索引与内联速览，再按任务读取对应的 topics 子文件全文。未命中的子文件不要读。**

## 目标与边界

**做**：提供 Python 代码"怎么写"的统一规范——命名、格式、类型、结构、惯用法、反模式、红线，以及 AI 代码审查信号。

**不做**：
- ❌ 不含工程流程规则（git/提交/PR/CI/部署/运维/安全/密钥/测试流程）——需要时另行约定
- ❌ 不替代 lint 工具本身——规则用 ruff/mypy/vulture 自动强制

## 内联速览（全文在对应 topics 子文件）

### 风格要点（全文：topics/02-code-style.md）

- 工具链：uv 管理包与环境；ruff check/format + mypy(strict) + vulture，规则固化在 `pyproject.toml`
- 命名：变量/函数 `snake_case`、类 `PascalCase`、常量 `SCREAMING_SNAKE`；**标识符一律英文**；注释/文档默认中文（【EDIT ME】国际化改 English-only）
- 类型：所有函数签名带类型提示；`list[str]` / `int | None` / `Self` / `match-case`；信任边界用 Pydantic
- 结构：函数 ≤50 行、模块 ≤500 行（不含测试）、类 ≤300 行；导入 stdlib→第三方→本地分组
- 写法：f-string；Google 风格 docstring（Args/Returns/Raises）；`with` 管理资源；dataclass/NamedTuple/TypedDict/class 按场景选型；I/O 用 async + `httpx.AsyncClient`；禁止 `print()`（用 logging）

### 代码红线（NEVER，摘录；全文：topics/08-never-list.md）

- **NEVER** 可变默认参数（`def f(x=[])`）、裸 `except:`、`except Exception: pass`、用户输入上 `eval/exec`、SQL 字符串插值、`subprocess(shell=True)` + 不可信输入
- **NEVER** 函数内 import 绕循环引用、只被引用一次的小 helper、`bool` 参数逼调用方写 `foo(False)`、`type()` 判断类型、全局可变状态
- **NEVER** 空洞测试（无断言）、依赖执行顺序的测试、注释显而易见操作、docstring 复述签名

### 质量自检速览（全文：topics/06-quality-standards.md）

无可变默认参数 / 无全局可变状态 / 无循环导入 / 无裸 except / SQL 参数化 / 输入校验 / 无 eval/exec / 上下文管理器管资源 / 类型提示齐全 / Google 风格 docstring / 注释写 WHY / 测试 AAA + 隔离 / 异常链式 `from e` / 自定义异常统一基类 / `join()` 而非 `+=` / 警惕 N+1 / 大序列用生成器。

### AI 反模式信号（全文：topics/07-ai-anti-patterns.md）

- **偷懒**：空洞测试、`Any` 泛滥、catch-n-log 吞错误、复制粘贴不理解、多余 helper、bool 参数
- **困惑**：过度防御代码、层层 null 检查、到处 try/except、往 god object 塞方法
- **膨胀**：注释讲变更不讲代码、过量测试、全量日志、过度参数化、为将来设计扩展点

## 索引与导航（按任务读取对应子文件）

| 场景 | 读取文件 |
|------|----------|
| 写/改代码、风格细节 | `topics/02-code-style.md`、`topics/06-quality-standards.md` |
| 质量底线原则 | `topics/01-principles.md` |
| 错误处理路径 | `topics/05-error-handling.md` |
| 新建模块/目录 | `topics/03-project-structure.md` |
| 提交前工具链检查 | `topics/04-linting-type-checking.md` |
| 审查（AI 写的）代码 | `topics/07-ai-anti-patterns.md`、`topics/06-quality-standards.md` |
| 确认底线红线 | `topics/08-never-list.md` |

## 注意事项

- 【EDIT ME】团队落地时调整：注释语言、line-length（88/100）、target-version、规模上限、项目结构要求
- 规则之间冲突时：**NEVER 红线（topics/08）优先于一切建议性规则**
- 本技能与 `D:\project_GIT\study_Langchain\python-agents-rules\`（仓库级 AGENTS.md + skills/）同源，修改时两边同步
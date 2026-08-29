# Python 代码风格（Python）

> 来源：改编自 Anchor（MIT）· python-agents-rules（Section 04）。

## 目标与边界

**做**：规定 Python 代码"长什么样"——命名、格式、类型、结构、写法。

**不做**：
- ❌ 不给强制命令与配置（见 `python-linting-type-checking`）
- ❌ 不列完整反模式（见 `python-code-quality-standards`、`python-code-never-list`）

## 语言要求（【EDIT ME】按团队约定设置）

- **代码标识符（变量/函数/类/常量）一律使用英文**——硬性要求
- **注释与文档字符串**：默认允许中文（本规范面向中文团队）；国际化团队改 English-only
- **用户可见文案**：按产品要求，默认中文

## 工具链（uv + ruff + mypy）

- 包与环境管理：`uv`（`uv sync` / `uv add` / `uv run`），`pyproject.toml` 是唯一配置源；禁止手写 `requirements.txt` 或 `setup.py`（除非发布 PyPI）
- 格式化/静态检查：`ruff`（`ruff check` + `ruff format`），规则在 `[tool.ruff]` 固化
- 类型检查：`mypy`（strict 模式）或 `basedpyright`
- 配置示例见 `python-linting-type-checking`

## Python 风格基线

- **格式化**：PEP 8，4 空格缩进；`line-length` 88 或 100 二选一，让 ruff format 与团队约定一致
- **命名**：`snake_case`（变量/函数）、`PascalCase`（类）、`SCREAMING_SNAKE`（常量）、`_leading_underscore`（私有）
- **导入**：stdlib → 第三方 → 本地，三组分组、组内字母序（ruff isort 自动检查）
- **类型标注**：所有函数签名带类型；现代语法 `list[str]`（PEP 585）、`int | None`（PEP 604）、`Self`（PEP 673）、`match/case`（PEP 634）替代长 if/elif 链
- **数据结构优先顺序**：`dataclass`（简单容器）→ `NamedTuple`（不可变轻量）→ `TypedDict`（JSON dict）→ class（有行为/封装）
- **字符串**：f-string 插值（不用 `%` 或 `.format()`）
- **文档字符串**：Google 风格（Args/Returns/Raises），模块/类/公开函数都要有
- **错误处理**：捕获具体异常、禁止裸 `except:`、`raise ... from e` 保留链式异常（见 `python-error-handling`）
- **异步**：I/O 密集用 `async/await`；HTTP 用 `httpx.AsyncClient`；禁止在 async 函数里同步阻塞
- **类型校验**：信任边界（外部输入）用 **Pydantic** 模型，不手写 if/else 迷宫
- **资源管理**：文件/连接/事务一律 `with` 上下文管理器；自定义资源用 `@contextmanager`

## 反风格红线（代码层面）

- 禁止 `print()` 调试输出——用 `logging`（结构化为佳）
- 函数 ≤50 行；模块 ≤500 行（不含测试）；类 ≤300 行；超出按内聚性拆分
- 禁止无意义注释（`# Increment counter by 1`）；注释只写 WHY
- 禁止代码中出现 emoji
- 其余红线见 `python-code-never-list`

## 注意事项

- 提交前完成 `python-linting-type-checking` 的清扫（ruff + mypy + vulture）再提交
- 与红线冲突时，红线（NEVER）优先

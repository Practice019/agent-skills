# Python Lint 与类型检查（风格强制工具链）

> 来源：改编自 Anchor（MIT）· python-agents-rules（Section 09）。

## 目标与边界

**做**：给出 Python 风格的自动化强制手段——一条命令可复现的清扫。

**不做**：
- ❌ 不规定风格细节本身（见 `python-code-style` / `python-code-quality-standards`）

## 提交前完整清扫（用 `uv run` 执行）

```bash
ruff check .                  # Lint（规则在 pyproject.toml 固化；--fix 自动修复）
ruff format .                 # Format（line-length 以 [tool.ruff] 配置为准）
vulture .                     # 死代码（未被调用的函数/未用导入）
mypy .                        # 类型检查（strict 模式；或 basedpyright）
```

**清扫必须证明**：无未用导入/变量/函数、无定义了却从未被调用的函数、无类型错误、无 lint 错误。

## 一次性配置（pyproject.toml，而不是每次传 flag）

```toml
[tool.ruff]
line-length = 100            # 【EDIT ME】与团队约定一致（88 或 100，二选一）
target-version = "py312"     # 【EDIT ME】团队最低支持版本
select = ["E", "F", "W", "I", "UP", "B", "SIM", "ANN", "S", "C4", "RUF"]
# E=pycodestyle 错误 F=pyflakes W=pycodestyle 警告 I=isort UP=pyupgrade
# B=bugbear SIM=simplify ANN=注解 S=bandit 安全 C4=flake8-comprehensions RUF=ruff 专属

[tool.ruff.lint.isort]
known-first-party = ["src"]  # 本地代码组

[tool.mypy]
python_version = "3.12"
strict = true
exclude = ["tests/", "migrations/"]
```

## vulture 有发现时

- 立即删除未用代码
- 不确定是否真死代码：`grep -r "function_name" .` 确认无引用再删
- 只保留有真实生产调用路径的代码；测试 helper、公开导出、`__init__.py` 重导出、console entry 是合法例外，加入白名单

## CI 强制

把以下命令加进项目 CI 检查步骤（具体 CI 平台按项目约定）：

```bash
uvx ruff check .
uvx ruff format --check .
uvx mypy .
uvx vulture . --min-confidence 80
```

## 注意事项

- **Do not commit until the sweep is clean**——lint 不过不许提交，这条对 AI 和人都生效
- 规则集 `select` 按团队口味增删（如去掉 `ANN` 强制注解）
- 配置进 `pyproject.toml` 随仓库版本化，保证确定性可复现

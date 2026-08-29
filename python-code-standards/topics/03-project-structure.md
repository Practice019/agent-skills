# Python 项目结构约定

> 来源：改编自 Anchor（MIT）· python-agents-rules（Section 05）。`research/`、`DEEPDIVE.md`、`TODO.md` 等标注为可选，按团队习惯取舍。

## 目标与边界

**做**：规定 Python 项目"代码放哪里"的统一结构。

**不做**：
- ❌ 不规定技术栈选型（那是团队决策）
- ❌ 不规定 lint 规则（见 `python-linting-type-checking`）

## 标准目录布局

```
project/
├── src/                    # 源代码
│   ├── api/               # API 路由/端点
│   ├── models/            # 数据模型/schema
│   ├── services/          # 业务逻辑
│   └── core/              # 配置、日志、异常基类
├── tests/                  # 全部测试（必须提交，禁止整体 gitignore）
│   ├── unit/              # 单元测试
│   └── integration/       # 集成测试
├── docs/                  # 架构文档/ADR
├── scripts/               # CLI/工具（版本控制）
├── docker/                # Dockerfile、compose
├── .env.example           # 环境变量模板（.env 本体禁止提交）
├── .gitignore             # 忽略生成物（缓存、构建输出）——不是 tests/ 本身
├── README.md              # 安装与使用
└── pyproject.toml         # 唯一配置源（依赖/工具链/打包）
```

**必选**：`src/`、`tests/`。**可选**：`docs/`、`research/`（研究型项目）、`scripts/`、`docker/`。`tests/` 始终提交，只忽略其下生成物（`tests/scripts/`、缓存）。

## 模块边界

- 模块 ≤500 行（不含测试），超出按"内聚的职责组"拆新模块——不要按字母序或随意拆分
- 每个模块/类单一职责；公开 API 集中在模块顶部（`__init__.py` 只在需要时重导出）
- 循环依赖必须重构，禁止函数内 import 绕圈（例外：`TYPE_CHECKING`）

## 鼓励：结构自文档

- 目录名即职责名：`api/` 只放路由、`services/` 只放业务逻辑、`models/` 只放数据模型
- 架构性决策（为什么这么分层、为什么拆两个服务）写进 `docs/` 的 ADR 或项目 README，不写进代码注释
- 【EDIT ME】团队已有目录规范时，以团队规范为准，本文件仅作兜底

## 注意事项

- 别为了"架构纯洁"堆目录——空壳目录不加，等有真实内容再建
- `research/`、`DEEPDIVE.md`、`TODO.md` 是 Anchor 原版要求，本规范标为可选，避免强加

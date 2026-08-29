# Python 代码质量底线原则

> 来源：改编自 Anchor（MIT）· python-agents-rules（Section 01）。

## 目标与边界

**做**：定义写 Python 代码不可妥协的底层原则。

**不做**：
- ❌ 不重复代码风格细节（见 `python-code-style`）
- ❌ 不给具体工具命令（见 `python-linting-type-checking`）

## 八条底线

1. **无死代码**：每个函数必须有生产路径调用；立即删除未用导入/变量/定义。例外：测试 helper、库公开导出、`__init__.py` 重导出、console entry point——加入 vulture 白名单而非删除
2. **无 stub**：函数/模块/端点必须有真实实现；`...` / `pass` 只允许用于抽象方法、`Protocol`、接口定义
3. **无静默失败**：`except Exception: pass` 必须注释 WHY 并先记日志（具体写法见 `python-error-handling`）
4. **测试先行**：每个模块有对应测试，测试通过再继续
5. **集成需证明**：组件构建后必须端到端验证，未验证不标记完成
6. **跨服务契约测试**：跨服务功能用集成测试锁定真实 HTTP 契约
7. **追溯调用**：标记完成前验证每个公开函数都有生产调用路径
8. **高效导航**：本技能是总览，细则按场景加载对应子技能（`python-code-style` 等）

## 注意事项

- 死代码判定用 vulture（见 `python-linting-type-checking`）；不确定时 `grep -r "名字" .` 搜引用后再删
- 这八条是"地板"：任何一行提交的代码都不得违反

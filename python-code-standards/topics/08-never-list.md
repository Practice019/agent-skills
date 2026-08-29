# Python 代码写法红线 — NEVER 清单

> 来源：改编自 Anchor（MIT）· python-agents-rules（Section 36，裁剪为代码/注释/测试部分）。
> 原版 36.2（Git）/36.3（GitHub）/36.4（财务）/36.5（身份）/36.9（提示注入）属工程流程/安全范畴，不在本技能。

## 目标与边界

**做**：给出"想都不要想"的代码写法亮线——通用指南太容易被合理化绕过，红线条条是底线。

**不做**：
- ❌ 不含完整风格细节（见 `python-code-style` / `python-code-quality-standards`）

## 36.1 Code NEVER

- **NEVER** 可变默认参数（`def f(x=[])`）——用 `None` + 新建，或 `field(default_factory=...)`
- **NEVER** 裸 `except:`——总是捕获具体异常类型
- **NEVER** `except Exception: pass`——静默失败被禁止；真非关键时注释 WHY 并先记日志
- **NEVER** 对任何用户输入用 `eval()` / `exec()` / `compile()`
- **NEVER** SQL 字符串插值——一律参数化查询
- **NEVER** `os.system()` 或 `subprocess` 带 `shell=True` 处理不可信输入
- **NEVER** 为了绕循环引用在函数内 import——重构模块结构（例外：`TYPE_CHECKING` 与延迟导入）
- **NEVER** 创建只被引用一次的小 helper——内联逻辑
- **NEVER** 加 `bool` 或含糊 `Optional` 参数逼调用方写 `foo(False)` / `bar(None)`——用 keyword-only 参数或分方法
- **NEVER** 用 `type()` 做类型判断——用 `isinstance()`
- **NEVER** 全局可变状态——封装进类或显式传参

## 36.6 Testing NEVER（测试代码的写法红线）

- **NEVER** 写依赖执行顺序的测试——每个测试必须独立可跑
- **NEVER** 用 `time.sleep()` 等异步操作——用正确同步手段
- **NEVER** 写空洞测试（无断言或断言永不会失败）
- **NEVER** 未跑全量测试就标记任务完成
- **NEVER** 因"改动很小"跳过测试——小改动引起大 bug

## 36.7 Documentation NEVER（注释与文档的写法红线）

- **NEVER** 注释显而易见的操作——`# Increment counter by 1` 放在 `counter += 1` 上面
- **NEVER** 写复述函数签名的 docstring——写 WHY，不写 WHAT

## 36.8 AI Agent NEVER（写代码时的行为红线）

- **NEVER** 能验证时靠猜——跑代码、查日志、读真实文件
- **NEVER** 假设库可用——先查 `pyproject.toml`
- **NEVER** 不检查现有依赖是否已提供该功能就加新依赖
- **NEVER** 修改生成代码（OpenAPI 客户端、protobuf stub、迁移文件）——重新生成
- **NEVER** 提交前跳过 lint/类型检查——`python-linting-type-checking` 的清扫是强制的
- **NEVER** 提交未测代码——跑测试套件、验证行为

## 注意事项

- 红线冲突时：NEVER 优先于一切建议性规则
- 完整正反例代码见 `python-code-quality-standards`

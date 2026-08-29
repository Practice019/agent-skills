# Python 错误处理模式

> 来源：改编自 Anchor（MIT）· python-agents-rules（Section 10）。

## 目标与边界

**做**：规定 Python 代码"怎么处理错误"——捕获、传播、记录。

**不做**：
- ❌ 不规定完整风格（见 `python-code-style`）
- ❌ 不规定重试/退避策略（那是调用外部资源时的约定）

## 核心模式

```python
# 好：具体异常 + 上下文
try:
    result = await client.post(url, json=data)
    result.raise_for_status()
except httpx.TimeoutException:
    logger.warning(f"Timeout calling {model}, retrying")
    raise RetryableError(f"Timeout for {url}") from None
except httpx.HTTPStatusError as e:
    logger.error(f"HTTP {e.response.status_code} from {url}")
    raise ApiError(f"Failed to call {url}") from e

# 坏：静默吞掉
except Exception:
    pass
```

## 规则

1. **捕获具体异常**——禁止裸 `except:`，`except Exception: pass` 必须注释 WHY 并先记日志
2. **保留异常链**：`raise ... from e`（PEP 3134）；`from None` 只用于"原因是有意噪声"（如超时重抛为可重试错误）
3. **并发异常**：Python 3.11+ 的 `asyncio.gather`/`TaskGroup` 抛 `ExceptionGroup`（PEP 654）——用 `except*` 或 `cancel_scope` 处理，别让组崩溃整个应用
4. **日志**：`except` 块内用 `logger.exception(...)` 捕获堆栈；级别 DEBUG=可重试、WARNING=降级、ERROR=致命
5. **返回值**：可选失败用 `None` + 类型标注，不用元组
6. **最小 try 块**：只包可能抛异常的语句；`else` 子句放只在不抛异常时运行的代码

## 自定义异常设计（与 python-code-quality-standards 一致）

```python
class AppError(Exception):
    """应用异常基类。"""
    def __init__(self, message: str, code: str | None = None):
        self.message = message
        self.code = code
        super().__init__(self.message)

class ValidationError(AppError): ...
class ResourceNotFoundError(AppError): ...
```

所有业务异常继承统一基类，便于上层统一处理与日志归类。

## 注意事项

- 吞异常前必须记日志；"非关键失败"也要写清为什么非关键
- 不要在每行都 try/except——那是"困惑"信号（见 `ai-code-anti-patterns`）

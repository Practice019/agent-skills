# Python 代码质量标准

> 来源：改编自 Anchor（MIT）· python-agents-rules（Section 27）。以下为完整规则正文。

## 目标与边界

**做**：给出 Python 代码质量的全套标准——惯用法、反模式、安全写法、性能模式、文档与测试质量、最终自检清单。

**不做**：
- ❌ 不重复风格要点（见 `python-code-style`）
- ❌ 不重复红线清单（见 `python-code-never-list`）

## 正文

## 27. Code Quality Standards

Best-in-class practices for writing production-quality Python code.

### 27.1 Python Idioms

#### Context Managers 鈥?Always Use Them for Resources

```python
# CORRECT - context manager handles cleanup
with open('/path/to/file', 'r') as f:
    content = f.read()

# With transaction
with conn.begin_transaction() as txn:
    do_stuff(txn)
    txn.commit()

# Custom context manager
from contextlib import contextmanager

@contextmanager
def managed_resource(name):
    resource = acquire_resource(name)
    try:
        yield resource
    finally:
        release_resource(resource)

# Usage
with managed_resource("cache") as cache:
    cache.get("key")

# WRONG - manual cleanup risks exceptions
try:
    f = open('/path/file', 'r')
    content = f.read()
finally:
    f.close()  # If read() throws, this doesn't run
```

#### Type Choices 鈥?dataclass vs NamedTuple vs TypedDict vs Class

```python
# Use dataclass for: simple data containers with automatic methods
from dataclasses import dataclass, field

@dataclass
class Point:
    x: float
    y: float

@dataclass
class InventoryItem:
    name: str
    unit_price: float
    quantity_on_hand: int = 0
    tags: list[str] = field(default_factory=list)  # NEVER use mutable default!

# Use NamedTuple for: immutable lightweight structs
from typing import NamedTuple

class Employee(NamedTuple):
    name: str
    id: int
    department: str = "Engineering"

# Use TypedDict for: dict with specific key types (JSON-like data)
from typing import TypedDict, Required, NotRequired

class Movie(TypedDict, total=True):
    title: Required[str]
    year: int  # Required when total=True
    director: NotRequired[str]

# Use class for: complex behavior, inheritance, encapsulation
class DatabaseConnection:
    def __init__(self, host: str, port: int):
        self._host = host
        self._port = port

    def connect(self) -> None:
        """Establish connection to database."""
        ...
```

#### List Comprehensions vs Loops vs Generators

```python
# Use list comprehension for: simple transformations/filtering
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]

# Use dict comprehension for: key-value transformations
squares_dict = {x: x**2 for x in range(10)}
filtered = {k: v for k, v in original.items() if v > 1}

# Use generators for: large sequences, memory efficiency, pipelining
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# Generator expression - O(1) memory for million items
million_squares = (x**2 for x in range(1_000_000))  # No memory used yet!

# Generator pipeline - memory efficient
def process_large_file(filepath):
    with open(filepath, 'r') as f:
        for line in f:
            yield parse_line(line)

# WRONG - loop when comprehension fits (less readable)
result = []
for x in items:
    if x > 0:
        result.append(x * 2)

# CORRECT
result = [x * 2 for x in items if x > 0]
```

---

### 27.2 Anti-Patterns 鈥?NEVER Do These

#### Mutable Default Arguments

```python
# WRONG - shared mutable default causes bugs
def append_to_list(item, items=[]):
    items.append(item)
    return items

append_to_list(1)  # Returns [1]
append_to_list(2)  # Returns [1, 2] 鈥?BUG!

# CORRECT - None + create new
def append_to_list(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items

# For dataclasses, use default_factory
from dataclasses import field

@dataclass
class Node:
    children: list['Node'] = field(default_factory=list)
```

#### Global State

```python
# WRONG - hidden mutable state
_counter = 0

def increment():
    global _counter
    _counter += 1

# CORRECT - encapsulate
class Counter:
    def __init__(self):
        self._count = 0

    def increment(self):
        self._count += 1

    @property
    def count(self):
        return self._count
```

#### Circular Imports

```python
# WRONG - circular dependency
# module_a.py
from module_b import something  # If module_b imports from module_a

# CORRECT - use TYPE_CHECKING for type hints
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from module_b import Something  # Only for type checking, not runtime

# Or use late imports inside functions
def some_function():
    from module_b import something  # Deferred import
    return something()
```

#### Using type() for Type Checking

```python
# WRONG
if type(obj) is type(1):
    obj.do_something()

# CORRECT - use isinstance()
if isinstance(obj, int):
    obj.do_something()

if isinstance(obj, (int, float)):
    handle_numeric(obj)
```

#### Bare except / Catching Exception

```python
# WRONG - catches everything including KeyboardInterrupt
try:
    do_something()
except:  # NEVER do this
    print("Error")

# CORRECT - catch specific exceptions
try:
    result = collection[key]
except KeyError:
    return key_not_found(key)
```

---

### 27.3 Security Constraints 鈥?MANDATORY

#### SQL Injection Prevention

```python
# WRONG - SQL injection vulnerable
query = f"SELECT * FROM users WHERE name = '{name}'"
cursor.execute(query)

# CORRECT - parameterized queries
cursor.execute("SELECT * FROM users WHERE name = %s", (name,))

# Using SQLAlchemy
from sqlalchemy import text

query = text("SELECT * FROM users WHERE name = :name")
result = session.execute(query, {"name": name})
```

#### Input Validation

```python
import re
from urllib.parse import urlparse

def validate_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def sanitize_filename(filename: str) -> str:
    # Remove path components and special characters
    return re.sub(r'[^a-zA-Z0-9.-]', '', filename)

def validate_url(url: str) -> bool:
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except ValueError:
        return False
```

#### NO eval()/exec() on User Input

```python
# WRONG - code injection vulnerability
user_input = "os.system('rm -rf /')"
result = eval(user_input)  # DANGEROUS!

# CORRECT - safe literal evaluation only
import ast

def safe_eval(expression: str):
    try:
        return ast.literal_eval(expression)  # Only parses literals
    except ValueError:
        raise ValueError(f"Invalid literal: {expression}")
```

#### File Path Traversal Prevention

```python
from pathlib import Path

def safe_read_file(base_dir: Path, user_path: str) -> str:
    requested_path = (base_dir / user_path).resolve()

    if not requested_path.is_relative_to(base_dir):
        raise ValueError("Access denied: path outside allowed directory")

    return requested_path.read_text()
```

#### Secure Password Handling

Prefer Argon2id (OWASP first choice); bcrypt only for legacy systems.

```python
from argon2 import PasswordHasher  # pip install argon2-cffi
import secrets

ph = PasswordHasher()

def hash_password(password: str) -> str:
    return ph.hash(password)  # Argon2id by default

def verify_password(password: str, hashed: str) -> bool:
    try:
        return ph.verify(hashed, password)
    except Exception:
        return False

def generate_token() -> str:
    return secrets.token_urlsafe(32)
```

---

### 27.4 Performance Patterns

#### String Concatenation 鈥?Use join(), Not + in Loops

```python
# WRONG - O(n虏) in loop
result = ""
for item in items:
    result += str(item)

# CORRECT - O(n)
result = "".join(str(item) for item in items)

# For building from parts
parts = ["Hello", name, "!"]
final = " ".join(parts)
```

#### Avoiding N+1 Query Patterns

```python
# WRONG - N+1 problem
users = session.query(User).all()
for user in users:
    print(user.posts.count())  # Query per user!

# CORRECT - eager loading
from sqlalchemy.orm import joinedload, selectinload

users = session.query(User).options(
    joinedload(User.posts)
).all()
for user in users:
    print(len(user.posts))  # No additional queries

# CORRECT - use subqueries for aggregations
from sqlalchemy import func

user_post_counts = session.query(
    User.id,
    func.count(Post.id).label('post_count')
).outerjoin(Post).group_by(User.id).all()
```

#### When to Use Generators

```python
# Use when: large dataset, streaming, don't need random access
def process_large_file(filepath):
    with open(filepath, 'r') as f:
        for line in f:  # One line at a time, O(1) memory
            yield parse_line(line)

# Generator expression - lazy evaluation
squares = (x**2 for x in range(1_000_000))  # No computation yet

# Pipeline - memory efficient chaining
def filter_even(numbers):
    return (x for x in numbers if x % 2 == 0)

def double(numbers):
    return (x * 2 for x in numbers)

result = filter_even(double(range(1_000_000)))  # O(1) memory
```

#### Avoiding Unnecessary Copies

```python
# WRONG - unnecessary copies waste memory
original = [1, 2, 3]
backup = original[:]  # Creates copy when you might not need it

# CORRECT - only copy when needed
def modify_list(lst):
    lst_copy = lst.copy()  # Explicit copy when required
    # modify copy, original unchanged

# For dicts
copy_dict = original_dict.copy()  # Shallow copy

# For deep copies of nested structures
import copy
deep_copy = copy.deepcopy(nested_structure)
```

---

### 27.5 Documentation Quality

#### Docstrings 鈥?Google Style for All Public APIs

```python
def calculate_area(width: float, height: float) -> float:
    """Calculate the area of a rectangle.

    Args:
        width: The width of the rectangle in units.
        height: The height of the rectangle in units.

    Returns:
        The area in square units.

    Raises:
        ValueError: If width or height is negative.
    """
    if width < 0 or height < 0:
        raise ValueError("Dimensions must be non-negative")
    return width * height

class DataProcessor:
    """Transforms raw input data into structured format.

    Handles edge cases like missing values, type mismatches,
    and provides consistent output regardless of input variations.

    Attributes:
        validation_mode: If True, raises on invalid data.
        default_value: Fallback for missing fields.
    """

    def process(self, data: dict) -> ProcessedData:
        """Process raw data dictionary."""
```

#### Comments 鈥?Explain WHY, Not WHAT

```python
# GOOD comment - explains WHY (not what code already says)
# We use depth-first search because it preserves path order
# needed for the undo system to work correctly
def find_path(graph, start, end):
    ...

# WRONG comment - states the obvious
# Increment counter by 1
counter += 1

# GOOD inline comment for non-obvious behavior
result = [x for x in items if x > 0]  # Filter out negatives/zero

# Use TODO/FIXME for temporary notes
# TODO: Remove this hack after fixing upstream bug
# FIXME: Race condition on concurrent access
```

---

### 27.6 Testing Quality

#### Arrange-Act-Assert Pattern

```python
def test_transfer_funds():
    # Arrange - set up test data
    source = Account(balance=100)
    destination = Account(balance=50)

    # Act - perform the action under test
    result = transfer_funds(source, destination, 25)

    # Assert - verify outcomes
    assert result is True
    assert source.balance == 75
    assert destination.balance == 75
```

#### Test Isolation 鈥?No Interdependencies

```python
# WRONG - tests depend on each other
global user_id
def test_create_user():
    global user_id
    user_id = create_user("Alice")

def test_update_user():  # Depends on test_create_user running first!
    update_user(user_id, name="Bob")

# CORRECT - each test is fully independent
def test_create_user():
    user = create_user("Alice")
    assert user.id is not None

def test_update_user():
    user = create_user("Bob")
    updated = update_user(user.id, name="Charlie")
    assert updated.name == "Charlie"
```

#### Mock vs Real vs Spy

```python
# Mock - completely replace dependency
from unittest.mock import Mock

def test_order_processor():
    mock_db = Mock()
    mock_db.save.return_value = True

    processor = OrderProcessor(db=mock_db)
    result = processor.process(Order(id=1))

    mock_db.save.assert_called_once()

# Spy - watch calls but use real implementation
def test_logger_calls_write():
    with patch('app.file_write') as mock_write:
        logger = Logger()
        logger.write("message")

        mock_write.assert_called_once_with("message")

# Real object - integration test
def test_database_connection():
    db = RealDatabaseConnection()  # Integration test
    db.connect()
    assert db.is_connected()
```

#### What Makes a Good Test

```python
# GOOD - clear name, tests one thing, readable
def test_user_creation_with_valid_data():
    """User can be created with valid name and email."""
    user = User(name="Alice", email="alice@example.com")
    assert user.name == "Alice"
    assert user.email == "alice@example.com"

# GOOD - edge case testing
def test_negative_dimensions_raise_value_error():
    """Negative width or height raises ValueError."""
    with pytest.raises(ValueError):
        calculate_area(-5, 10)

# BAD - too generic, tests too much
def test_stuff():
    result = do_something()
    assert result is not None
```

---

### 27.7 Error Handling Patterns

#### Specific Exception Catching

```python
# CORRECT - catch specific exceptions
try:
    result = process_data(data)
except ValueError as e:
    logger.error(f"Invalid data format: {e}")
except KeyError as e:
    logger.error(f"Missing required key: {e}")
except TimeoutError:
    logger.warning("Operation timed out, retrying")

# Best practice - minimal try block
try:
    value = collection[key]
except KeyError:
    return key_not_found(key)
else:
    return handle_value(value)  # Only runs if no exception
```

#### Exception Chaining 鈥?Preserve Tracebacks

```python
# CORRECT - explicit chaining with 'from'
try:
    validate_input(data)
except ValidationError as e:
    raise ConfigurationError(f"Failed to load config: {e}") from e

# CORRECT - implicit chaining (re-raise after handling)
try:
    config = load_config(path)
except FileNotFoundError:
    raise ConfigurationError(f"Config not found: {path}") from None

# WRONG - loses original traceback
try:
    do_something()
except SomeError:
    raise OtherError("Message")  # from e is missing!
```

#### Custom Exception Design

```python
class AppError(Exception):
    """Base exception for application errors."""
    def __init__(self, message: str, code: str = None):
        self.message = message
        self.code = code
        super().__init__(self.message)

class ValidationError(AppError):
    """Raised when input validation fails."""
    pass

class ResourceNotFoundError(AppError):
    """Raised when a requested resource is not found."""
    pass

# Usage
def get_user(user_id):
    user = db.find_user(user_id)
    if not user:
        raise ResourceNotFoundError(
            f"User {user_id} not found",
            code="USER_NOT_FOUND"
        )
```

#### Circuit Breaker Pattern

```python
import time
from enum import Enum

class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"

class CircuitBreaker:
    def __init__(self, failure_threshold=5, timeout=60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failures = 0
        self.last_failure_time = None
        self.state = CircuitState.CLOSED

    def call(self, func, *args, **kwargs):
        if self.state == CircuitState.OPEN:
            if self._should_attempt_reset():
                self.state = CircuitState.HALF_OPEN
            else:
                raise CircuitBreakerOpenError("Circuit is open")

        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise

    def _should_attempt_reset(self):
        return (time.time() - self.last_failure_time) >= self.timeout

    def _on_success(self):
        self.failures = 0
        self.state = CircuitState.CLOSED

    def _on_failure(self):
        self.failures += 1
        self.last_failure_time = time.time()
        if self.failures >= self.failure_threshold:
            self.state = CircuitState.OPEN
```

#### Retry with Exponential Backoff

```python
import time
import random

@exponential_retry(max_attempts=5, base_delay=0.5, max_delay=60)
def fragile_operation():
    pass  # Will retry with backoff on failure

def exponential_retry(max_attempts=3, base_delay=1, max_delay=60):
    def decorator(func):
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if attempt < max_attempts - 1:
                        delay = min(base_delay * (2 ** attempt), max_delay)
                        delay += random.uniform(0, 0.1 * delay)
                        time.sleep(delay)
            raise last_exception
        return wrapper
    return decorator
```

---

### 27.8 Code Quality Checklist

Before marking any code complete, verify:

- [ ] **No mutable default arguments** 鈥?Use `None` + create new, or `field(default_factory=...)`
- [ ] **No global mutable state** 鈥?Encapsulate in classes, pass as parameters
- [ ] **No circular imports** 鈥?Use `TYPE_CHECKING` or late imports
- [ ] **Use isinstance() not type()** 鈥?For type checking
- [ ] **No bare except** 鈥?Catch specific exceptions only
- [ ] **No eval()/exec()** 鈥?On any user input
- [ ] **SQL uses parameterized queries** 鈥?Never string interpolation
- [ ] **Input validated and sanitized** 鈥?Every external input
- [ ] **Context managers used** 鈥?For file/database/connection resources
- [ ] **Type hints on all public APIs** 鈥?Functions, classes, methods
- [ ] **Docstrings on all public APIs** 鈥?Google style with Args/Returns/Raises
- [ ] **Comments explain WHY** 鈥?Not what code already says
- [ ] **Tests follow AAA pattern** 鈥?Arrange, Act, Assert
- [ ] **Tests are isolated** 鈥?No interdependencies
- [ ] **Generators for large data** 鈥?Memory efficiency
- [ ] **String join() not + in loops** 鈥?Performance
- [ ] **No N+1 queries** 鈥?Use eager loading or subqueries
- [ ] **Exception chaining preserved** 鈥?Use `from e` when appropriate
- [ ] **Custom exceptions inherit from AppError** 鈥?Consistent hierarchy

---

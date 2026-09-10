# Stack Trace Triage（堆栈/回溯排障）

> 原顶层技能 `stack-trace-triage`，作为本技能（verify）的子模块内嵌；相对本技能目录读取。
> 适用：用户直接贴出一段 traceback / panic / backtrace / 崩溃日志，要先定位根因再谈验证。


Turn a pasted stack trace into four things the user can act on: what to check, how to reproduce it
minimally, where to patch, and how to verify the fix. No guessing at files that were not shown.

## Boundaries

**Do**:
- Read the trace the user supplied and base every item on it.
- Pick the language probe, then emit the single unified block below.
- Give a narrow, runnable reproducer and verification command.

**Do not**:
- Invent files, packages, line numbers, or dependencies that the request does not contain.
- Recommend destructive commands (`rm -rf`, `git reset --hard`, dropping databases, mutating
  production state).
- Rewrite unrelated code, or propose an "unsafe broad rewrite" as the fix.
- Claim a fix is verified before the verification command actually ran in this session.

## Step 1 — Identify the language

| Signal in the trace | Probe |
|---|---|
| `Traceback (most recent call last)`, `File "..."`, `pytest`, `ImportError`, `KeyError`, `NoneType` | Python |
| `at foo (file.js:12:3)`, a node_modules path, `TypeError: Cannot read properties of undefined`, `tsc` | JavaScript / TypeScript |
| `panic:`, `goroutine 1 [running]:`, `main.foo(...)`, `.go:12 +0x1a` | Go |
| `thread 'main' panicked at`, `RUST_BACKTRACE`, `called Option::unwrap()`, `.rs:12:5` | Rust |
| None of the above / mixed / stripped symbols | Generic |

If two rows match, follow the innermost frame's language and note the ambiguity in `CHECKS`.

## Step 2 — Emit the unified block

Return **only** this structure (fill the placeholders from the actual trace):

```
LANGUAGE_PROBE: python | javascript-typescript | go | rust | generic
CHECKS:
  - <root-cause check 1, tied to a frame/symbol in the trace>
  - <root-cause check 2>
REPRODUCER:
  - <minimal command or snippet that reproduces the failure>
PATCH_TARGETS:
  - <file:symbol or contract to harden>
VERIFY:
  - <command that proves the fix>
```

Every item must cite the trace: the frame, the symbol, the exception type, or the log line it came
from. If the trace is truncated, say which part is missing instead of filling it in.

## Step 3 — Language probe specifics

### Python

```
LANGUAGE_PROBE: python
CHECKS:
  - <exception contract or missing-key/None-handling check>
  - <import/module/package boundary check if relevant>
REPRODUCER:
  - <minimal pytest or python -c reproduction command/snippet>
PATCH_TARGETS:
  - <guard clause / TypedDict / pydantic/schema validation / exception wrapping target>
VERIFY:
  - <targeted pytest command or python syntax/import check>
```

Prefer `pytest -k <symbol>` and `python -m pytest <path>` shapes. Do not recommend destructive
commands.

### JavaScript / TypeScript

```
LANGUAGE_PROBE: javascript-typescript
CHECKS:
  - <async boundary / undefined property / JSON parsing / module-resolution check>
  - <TypeScript type-contract check if .ts/.tsx appears>
REPRODUCER:
  - <minimal node/npm/vitest/jest/ts-node reproduction command or snippet>
PATCH_TARGETS:
  - <optional chaining / schema validation / discriminated union / error wrapping target>
VERIFY:
  - <npm test/vitest/jest/tsc command>
```

Pick JavaScript or TypeScript commands from the trace context. If the context does not identify a
package manager, use generic `npm test -- <pattern>` or `npx tsc --noEmit` as examples.

### Go

```
LANGUAGE_PROBE: go
CHECKS:
  - <nil pointer / error-return / goroutine boundary check>
  - <package or interface contract check>
REPRODUCER:
  - <minimal go test ./... -run <Name> command or snippet>
PATCH_TARGETS:
  - <nil guard / explicit error handling / interface assertion target>
VERIFY:
  - <go test command>
```

Prefer narrow `go test ./path -run TestName` commands when the trace exposes a package or symbol.
Do not suggest mutating production state.

### Rust

```
LANGUAGE_PROBE: rust
CHECKS:
  - <panic/unwrap/expect/Option/Result handling check>
  - <trait/lifetime/thread boundary check if relevant>
REPRODUCER:
  - <minimal cargo test command or snippet>
PATCH_TARGETS:
  - <replace unwrap/expect / map_err / explicit Result propagation target>
VERIFY:
  - <cargo test command>
```

Prefer narrow `cargo test <name>` commands when the trace exposes a symbol. Do not recommend unsafe
broad rewrites.

### Generic (language unknown)

```
LANGUAGE_PROBE: generic
CHECKS:
  - <schema/contract check>
  - <boundary check>
REPRODUCER:
  - <minimal language-neutral reproduction shape>
PATCH_TARGETS:
  - <defensive parsing / null handling / error propagation target>
VERIFY:
  - <safe command or manual check>
```

## Step 4 — Verify for real

Run the `VERIFY` command in the session before telling the user the fix works. Report the actual
exit code and output tail. If the toolchain is not installed, say so and stop — do not present an
unrun command as evidence.

## Notes

- A trace without line numbers is still usable: reason from symbol names and error types, and mark
  anything inferred as inferred.
- When the user asks for a patch as well as a diagnosis, apply the smallest change that makes
  `VERIFY` pass, and keep unrelated refactors out of it.

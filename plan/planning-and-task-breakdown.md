# Planning and Task Breakdown

## Overview

Decompose work into small, verifiable tasks with explicit acceptance criteria. Good task breakdown is the difference between an agent that completes work reliably and one that produces a tangled mess. Every task should be small enough to implement, test, and verify in a single focused session.

## When to Use

- You have a spec and need to break it into implementable units
- A task feels too large or vague to start
- Work needs a deliberate order (what must come before what)
- You need to communicate scope to a human
- The implementation order isn't obvious

**When NOT to use:** Single-file changes with obvious scope, or when the spec already contains well-defined tasks.

## The Planning Process

### Step 1: Enter Plan Mode

Before writing any code, operate in read-only mode:

- Read the spec and relevant codebase sections
- Identify existing patterns and conventions
- Map dependencies between components
- Note risks and unknowns

**Do NOT write code during planning.** The output is a plan document saved to `tasks/plan.md` and a task list recorded in the task list target (see Output Files; default: a section in `tasks/plan.md`), not implementation.

### Step 2: Identify the Dependency Graph

Map what depends on what:

```
Database schema
    │
    ├── API models/types
    │       │
    │       ├── API endpoints
    │       │       │
    │       │       └── Frontend API client
    │       │               │
    │       │               └── UI components
    │       │
    │       └── Validation logic
    │
    └── Seed data / migrations
```

Implementation order follows the dependency graph bottom-up: build foundations first.

### Step 3: Slice Vertically

Instead of building all the database, then all the API, then all the UI — build one complete feature path at a time:

**Bad (horizontal slicing):**
```
Task 1: Build entire database schema
Task 2: Build all API endpoints
Task 3: Build all UI components
Task 4: Connect everything
```

**Good (vertical slicing):**
```
Task 1: User can create an account (schema + API + UI for registration)
Task 2: User can log in (auth schema + API + UI for login)
Task 3: User can create a task (task schema + API + UI for creation)
Task 4: User can view task list (query + API + UI for list view)
```

Each vertical slice delivers working, testable functionality.

### Step 4: Write Tasks

Each task has **two shapes** — a scannable one-line entry in the task list, plus an
optional detail block beneath it:

```markdown
- [ ] **T3** Short descriptive title · Size M · Depends on T1

      **Description:** One paragraph explaining what this accomplishes.

      **Acceptance criteria:**
      - [Specific, testable condition]
      - [Specific, testable condition]

      **Verification (per task: L1 and L2 only — L3 is a ONE-TIME pre-delivery gate):**
      - **L1 every round:** [focused compile/typecheck + related tests]
      - **L2 on sub-problem done:** [affected packages ∪ reverse deps] + build
        (changes to semantics/contracts: skip the narrowing, run the full suite)
      - **L3 / full regression are NOT listed here** — they run ONCE before delivery
        (see the "pre-delivery gate" in `../build/SKILL.md`). List this task's
        non-functional items in Acceptance criteria instead.

      **Dependencies:** [T-numbers, or "None"]

      **Files likely touched:**
      - `src/path/to/file.ts`

      **Estimated scope:** [S: 1-2 files | M: 3-5 files | L: 5-8 files | XL: 8+ — must be split further]
```

> ⛔ **The only checkbox that means "this task is not done yet" is the `- [ ] **T<n>**` line.**
> `build` finds the next epoch by scanning for the **lowest-numbered unchecked `- [ ] **T<n>**`**.
> Sub-items under a task, checkpoints, open questions, and self-check lists also use
> checkboxes — **they are not tasks**, and the scan must exclude them (otherwise it
> will try to "start" a checkpoint).

### Step 5: Order and Checkpoint

Arrange tasks so that:

1. Dependencies are satisfied (build foundation first)
2. Each task leaves the system in a working state
3. Verification checkpoints occur after every 2-3 tasks
4. High-risk tasks are early (fail fast)

Add explicit checkpoints to the plan document:

```markdown
> **Checkpoint: after T1–T3** — all must hold, then **get human confirmation before continuing**
> - [ ] All tests pass
> - [ ] Application builds without errors
> - [ ] Core user flow works end-to-end
> - [ ] **Human confirmed** — do not continue until this one holds
```

> ⚠️ Checkpoints are **blockquotes, not headings with sibling checkboxes** — see the scan rule above.
> A checkpoint is never a task that `build` can start.

## Task Sizing Guidelines

| Size | Files | Scope | Example |
|------|-------|-------|---------|
| **XS** | 1 | Single function or config change | Add a validation rule |
| **S** | 1-2 | One component or endpoint | Add a new API endpoint |
| **M** | 3-5 | One feature slice | User registration flow |
| **L** | 5-8 | Multi-component feature — **prefer splitting; keep as one task only with a written reason** | Search with filtering and pagination |
| **XL** | 8+ | **Too large — must be broken down, no exceptions** | — |

**XL (8+ files) must be split — no exceptions.** **L (5-8) should be split too**, but it may
stay as a single task **only if you write down why it cannot be split**. An agent performs
best on S and M tasks.

**When to break a task down further:**
- It would take more than one focused session (roughly 2+ hours of agent work)
- You cannot describe the acceptance criteria in 3 or fewer bullet points
- It touches two or more independent subsystems (e.g., auth and billing)
- You find yourself writing "and" in the task title (a sign it is two tasks)

## Output Files

- **Plan document:** Save the implementation plan to `tasks/plan.md`. This is always a markdown file — design decisions, risks, and open questions don't map cleanly onto individual tracker issues.
- **Task list:** Record each task in the **task list target** (defined below).

Create the `tasks/` directory if it does not exist.

### Task List Target

The task list target is where tasks and checkpoints are recorded. It is defined once, here; every other reference in this skill defers to it.

- **Default: a section inside `tasks/plan.md`.** That is the single file `build` reads — it takes the **lowest-numbered unchecked `- [ ] **T<n>**`** as the next epoch. There is no separate task file.
- **External tracker = optional mirror, never a substitute.** If the project's agent rules (`AGENTS.md`, etc.) or the user designate an issue tracker (e.g. GitHub Issues, Jira, Linear, `bd`/beads), map the Step 4 structure onto the tracker's fields (acceptance criteria and verification in the item body, dependencies via the tracker's linking mechanism, `bd dep add` / "blocked by", etc.) — but **`tasks/plan.md` still carries the authoritative `- [ ] **T<n>**` checklist**, and the tracker mirrors it. Record the mapping in `tasks/plan.md`.

> ⛔ **绝不要让 tracker 成为任务存在的唯一地方。** `build` **只读 `tasks/plan.md`** ——
> 如果勾选框只活在 Jira 里，`build` 就**没有输入**：它扫不到 `- [ ] **T<n>**`，
> 于是判定「全部完成」然后收工。**这不是报错，是静默地少做。**

> ⛔ **不要另建 `tasks/todo.md`。** 清单文件一旦分裂，`build` 每轮开头读到的
> 就是另一份、或根本不存在的那一份 —— 而且**不报错，只空转**，
> 正是本工作流最想治的病。**任务清单的单一权威 = `tasks/plan.md`。**

When using an external tracker, note it in `tasks/plan.md` (e.g. "Tasks tracked in Linear project FOO") so downstream steps and future sessions know where to look, and keep the plan document's Task List section as an ordered index of tracker item IDs or links rather than a duplicate checklist.

## Plan Document Template

```markdown
# Implementation Plan: [Feature/Project Name]

## Overview
[One paragraph summary of what we're building]

## Architecture Decisions
- [Key decision 1 and rationale]
- [Key decision 2 and rationale]

## Task List

> ⚠️ Checkboxes are **only** for tasks, and the format is fixed: `- [ ] **T<n>**`.
> Checkpoints are blockquotes. (See the scan rule in Step 4.)

### Phase 1: Foundation
- [ ] **T1** ... · Size S · Depends on —
- [ ] **T2** ... · Size M · Depends on T1

> **Checkpoint: Foundation** — tests pass, builds clean → **get human confirmation before continuing**

### Phase 2: Core Features
- [ ] **T3** ... · Size M · Depends on T2
- [ ] **T4** ... · Size M · Depends on T2

> **Checkpoint: Core Features** — end-to-end flow works → **get human confirmation before continuing**

### Phase 3: Polish
- [ ] **T5** ... · Size S · Depends on T4
- [ ] **T6** ... · Size S · Depends on T4

> **Checkpoint: Complete** — all acceptance criteria met, ready for review

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| [Risk] | [High/Med/Low] | [Strategy] |

## Open Questions
- [Question needing human input]
```

When tasks live in an external tracker, keep the Task List section above as an ordered index of tracker item IDs or links instead of a duplicate checklist.

## Sequencing: What Can Be Reordered

Single writer, so this is not about parallelism — it is about **order and batching**:

- **Independent (any order):** feature slices that don't share files, tests for already-implemented features, documentation
- **Must be sequential:** database migrations, shared state changes, dependency chains
- **Needs its contract first:** features that share an API contract — define the contract, then implement either side

Knowing what is independent lets you **batch** related work together (fewer context switches),
and lets you **reorder around a blocked item** instead of stalling on it.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll figure it out as I go" | That's how you end up with a tangled mess and rework. 10 minutes of planning saves hours. |
| "The tasks are obvious" | Write them down anyway. Explicit tasks surface hidden dependencies and forgotten edge cases. |
| "Planning is overhead" | Planning is the task. Implementation without a plan is just typing. |
| "I can hold it all in my head" | Context windows are finite. Written plans survive session boundaries and compaction. |

## Red Flags

- Starting implementation without a written task list
- Scattering tasks between `tasks/plan.md` and a second file (the list must have one authority)
- Tasks that say "implement the feature" without acceptance criteria
- No verification steps in the plan
- All tasks are XL-sized
- No checkpoints between tasks
- Dependency order isn't considered

## Verification

Before starting implementation, confirm:

- [ ] Every task has acceptance criteria
- [ ] Every task has a verification step
- [ ] Task dependencies are identified and ordered correctly
- [ ] Tasks are recorded in the task list target (default: a section in `tasks/plan.md`)
- [ ] No task touches more than ~5 files
- [ ] Checkpoints exist between major phases
- [ ] The human has reviewed and approved the plan

## See Also

Acceptance criteria are per-task and answer "did we build the right thing?". They sit on top of the project-wide Definition of Done, the standing bar every task clears before it counts as done. See `../_shared/references/definition-of-done.md`.

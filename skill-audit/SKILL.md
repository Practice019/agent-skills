---
name: skill-audit
description: "审计并修复整个 DSH 技能库：跑硬门禁与宽口径扫描（frontmatter / name / CRLF / 引用可解析 / 机器路径 / 重复内容 / description 质量），自动归类已知误报，再按 epoch 循环逐个原子修复并复验。当用户要求审查技能、检查 skill 规范、技能库体检、修复 skill、批量修技能、skill 有没有问题、清理技能库时使用。"
whenToUse: "用户说「审查我全部的 skill」「检查技能规范」「修复 skill」「技能库体检」「skill 是不是都规范了」「清理技能库」时；技能库有较大改动后也可定期自查。"
user-invocable: true
---

# 技能库审计与修复

对本机 DSH 技能库做**一次完整体检并修复**：两级扫描 → 分类裁决 → 原子修复 → 复验 → 报告。

## 目标与边界

**做**：
- 扫描技能库全部文件，找出真缺陷（断链、frontmatter 不合法、name 不合规、CRLF、机器路径、重复内容、description 过短）
- 区分「真缺陷」与「已知误报」，只修前者
- 按 epoch 循环逐个原子修复，每个修复都真实验证后才 commit
- 输出可核对的审计报告

**不做**：
- ❌ 不擅自删除技能、不擅自改技能语义（description 内容、工作流步骤）——灰色项先问用户
- ❌ 不自动 `git push`、不自动 `npm publish`
- ❌ 不把「同名不同内容」当重复删掉

## 本技能自带的两个工具

| 工具 | 覆盖 | 位置 |
|---|---|---|
| 硬门禁 | 只看 SKILL.md 的 6 项（frontmatter/name/CRLF/读引用/`~`/用户名路径） | `../_shared/validate-skills.cjs` |
| 宽口径审计 | 扫全部 `.md`：CRLF、显式相对引用、机器路径、重复内容、description 质量 | `scripts/audit-library.cjs` |

两个脚本都**用自身位置反推技能库根目录**，不需要硬编码路径；技能库整体移动后仍可用。

## 工作流程

### 阶段 0：建立安全基线（不可跳过）

```powershell
git -C <skills-root> status --short
git -C <skills-root> log --oneline -1
```

- **工作树必须 clean**；有未提交改动时先问用户是否先提交。
- **看到 ` D`（工作树删了文件）先问，不要 `git restore`**：未提交的删除可能是有意为之。实测踩过——把用户手删的 3 个技能当成事故恢复了，方向完全反了。
- 记录基线 commit，便于回退。

### 阶段 1：跑两级扫描

```powershell
node "<skills-root>\_shared\validate-skills.cjs"
node "<skills-root>\skill-audit\scripts\audit-library.cjs"
```

读**退出码**和汇总行（`passed/failed`、`ERROR/WARN/INFO`），不要只看有没有红字。

### 阶段 2：分类裁决

把 ERROR / WARN 分成三类，**不要跳过分拣**：

| 类别 | 判据 | 处置 |
|---|---|---|
| 真缺陷 | 引用指向不存在的仓库内文件；frontmatter 不合法；name 非 kebab 或与目录名不一致；SKILL.md 含 CRLF；本机真实用户名绝对路径 | 必须修 |
| 已知误报 | 命中下方「误报分类表」 | 记入报告，**不改** |
| 灰色 | description 过短、同名不同内容、第三方正文里的历史写法 | **先问用户**，不擅自改语义 |

### 阶段 3：修复（epoch 循环）

每个真缺陷 = 一个原子 commit：

1. **先改引用，后删文件**——避免中间态断链。
2. 每轮：改 → 复跑两级扫描 → 通过才 `git commit`。
3. 失败就 `git restore` 回退，**换思路重试，不要原样重试**。
4. commit message 写清「改了什么 + 用什么命令验证」。

### 阶段 4：复验

- `validate-skills.cjs` → `failed=0`
- `audit-library.cjs` → `ERROR=0`
- 顶层技能数与 catalog 条目数符合预期（除非本轮就是增删技能）

### 阶段 5：报告

用下方输出模板，**如实**写返工次数与未修项。

### 阶段 6：发布（可选，需用户明确同意）

CHANGELOG + `package.json` + tag。**不自动 push、不自动 npm publish。**

## 误报分类表（务必对照，别把误报改坏）

| 现象 | 为什么不是缺陷 |
|---|---|
| `DESIGN.md`、`tasks/`、`SPEC.md`、`src/`、`tests/`、`docs/` 引用不存在 | 指向**用户项目**产物，本就不在技能库内 |
| `agent-workspace\...`、`./logs/...`、`./scratch/${VAR}/...` | 运行时目录 / 带变量模板 |
| `../../../var/www/html/`、`/etc/passwd` | 攻击载荷里的**靶机**路径 |
| `C:\Users\Public`、`C:\Users\user`、`C:\Users\Administrator` | 靶机路径；**只查本机真实用户名**才算缺陷 |
| 代码块内的路由模板路径（如指向 tool-index 的相对路径） | 写给「新建技能」的模板，基准是子技能目录 |
| `CHANGELOG.md` / `CONTRIBUTING.md` / `README.md` 里的路径 | 变更说明 / 文档的描述性文字 |
| 规则说明里的 `read ~/` 反例 | 正在讲「禁止这样写」 |
| 同名但内容不同的文件（`00-index.md`、`信息收集.md`） | 不同目录各有其职；**只有 md5 相同才算重复** |
| `tool-index.md` 含 CRLF | 机器生成的索引，已 gitignore |

## 修复规范

### 路径引用
- 技能内引用一律**相对本技能目录**；跨技能用 `../<其他技能>/x.md`
- 禁止 `read ~/...`（`read` 不展开 `~`，会解析成 `<cwd>~/...` 直接 not found）
- 禁止本机真实用户名绝对路径，改用 `$env:USERPROFILE`

### 第三方技能（最小改动）
- 只改 frontmatter 与路径引用，**正文保持原样**，保住上游可同步性
- 交叉引用优于物理合并；合并会丢上游归属与许可证

### 共享文件去重
- 先按 md5 分组，**只有内容完全相同的才算重复**
- 两份内容不同时：**取超集**（或更新版），把另一份独有内容并入；不要随手选体积大的
- 顺序：先改引用 → 再删副本 → 复扫

## 输出模板

```text
## 技能库审计报告（<日期>）
规模: SKILL.md=<n>  顶层技能=<n>  catalog=<n>
硬门禁: validate-skills.cjs → passed=<n> failed=<n>
宽口径: audit-library.cjs → ERROR=<n> WARN=<n> INFO=<n>

真缺陷（已修）
| 位置 | 问题 | 修法 | 验证命令 |

灰色（待你拍板）
- <逐条>

已知误报（未改，分类计数）
- <分类>: <n>

返工记录
- 第 <k> 轮：<失败原因> → <换的思路>

版本: <是否发布 / tag>
```

## 常见坑

| 坑 | 后果 | 正确做法 |
|---|---|---|
| 只看 SKILL.md 就宣布「全绿」 | 漏掉内容文件的 CRLF / 断链 | 两级扫描都跑 |
| 不先 `git status` 就审计 | 在残缺技能库上得结论 | 阶段 0 强制做 |
| 把用户手删的文件 `git restore` 回来 | 方向反了，覆盖用户意图 | 见 ` D` 先问 |
| 把同名不同内容当重复删 | 删掉有意的区分 | 只按 md5 判重复 |
| 先删文件后改引用 | 中间态断链，复扫必失败 | 先改引用 |
| 用 `node -e "..."` 写校验逻辑 | PowerShell 剥离引号，语法报错 | 写成 `.cjs` 文件再跑 |
| 顺手 push / publish | 不可控 | 需用户明确同意 |

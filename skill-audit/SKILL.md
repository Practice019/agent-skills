---
name: skill-audit
description: "审计并修复整个 DSH 技能库：库级两级扫描（硬门禁 + 宽口径：frontmatter / name / CRLF / 引用可解析 / 机器路径 / 重复内容 / description 质量）加单技能纵深体检（frontmatter 残留键、description 双语、专有运行时残留、引用精度、技能内重复、嵌套注册性），自动归类已知误报，再按 epoch 循环逐个原子修复并复验。当用户要求审查技能、检查 skill 规范、技能库体检、修复 skill、批量修技能、skill 有没有问题、清理技能库时使用。 Audit and repair the entire DSH skill library: library-level hard gate plus wide scan, plus a per-skill deep check (leftover foreign frontmatter keys, bilingual description, foreign runtime residue, reference precision, intra-skill duplicates, nested-skill registration), auto-classify known false positives, then fix atomically one at a time in an epoch loop with re-verification. Use when the user asks to audit skills, check skill conventions, run a skill-library health check, repair skills, bulk-fix skills, or clean up the library."
whenToUse: "用户说「审查我全部的 skill」「检查技能规范」「修复 skill」「技能库体检」「skill 是不是都规范了」「清理技能库」时；技能库有较大改动后也可定期自查。"
user-invocable: true
---

# 技能库审计与修复

对本机 DSH 技能库做**一次完整体检并修复**：库级两级扫描 + 单技能纵深体检 → 分类裁决 → 原子修复 → 复验 → 报告。

## 目标与边界

**做**：
- 扫描技能库全部文件，找出真缺陷（断链、frontmatter 不合法、name 不合规、CRLF、机器路径、重复内容、description 过短）
- 对单个技能做纵深体检（frontmatter 残留键、description 双语、专有运行时残留、引用精度、技能内重复、嵌套注册性）
- 区分「真缺陷」与「已知误报」，只修前者
- 按 epoch 循环逐个原子修复，每个修复都真实验证后才 commit
- 输出可核对的审计报告

**不做**：
- ❌ 不擅自删除技能、不擅自改技能语义（description 内容、工作流步骤）——灰色项先问用户
- ❌ 不自动 `git push`、不自动 `npm publish`
- ❌ 不把「同名不同内容」当重复删掉

## 本技能自带的三个工具

| 工具 | 覆盖 | 位置 |
|---|---|---|
| 硬门禁（库级） | 只看 SKILL.md 的 6 项（frontmatter/name/CRLF/读引用/`~`/用户名路径） | `../_shared/validate-skills.cjs` |
| 宽口径审计（库级） | 扫全部 `.md`：CRLF、显式相对引用、机器路径、重复内容、description 质量 | `scripts/audit-library.cjs` |
| 单技能体检（纵深） | 逐个技能：frontmatter 残留键、description 双语与长度、专有运行时残留、引用精度、技能内重复、嵌套 SKILL.md、文件清单 | `scripts/audit-skill.cjs` |

三个脚本都**用自身位置反推技能库根目录**，不需要硬编码路径；技能库整体移动后仍可用。三者共用同一套误报口径（`NON_REPO` / `ARTIFACTS` / `BENIGN_TILDE`），改口径要三处同步。

## 工作流程

### 阶段 0：建立安全基线（不可跳过）

```powershell
git -C <skills-root> status --short
git -C <skills-root> log --oneline -1
```

- **工作树必须 clean**；有未提交改动时先问用户是否先提交。
- **看到 ` D`（工作树删了文件）先问，不要 `git restore`**：未提交的删除可能是有意为之。实测踩过——把用户手删的 3 个技能当成事故恢复了，方向完全反了。
- 记录基线 commit，便于回退。

### 阶段 1：跑三级扫描

```powershell
node "<skills-root>\_shared\validate-skills.cjs"
node "<skills-root>\skill-audit\scripts\audit-library.cjs"
node "<skills-root>\skill-audit\scripts\audit-skill.cjs"                # 全部顶层技能
node "<skills-root>\skill-audit\scripts\audit-skill.cjs" <skill-a> <技能b>   # 只体检指定技能
```

读**退出码**和汇总行（`passed/failed`、`ERROR/WARN/INFO`、`PASS/WARN/FAIL`），不要只看有没有红字。

单技能体检的输出约定：

- `[PASS]` 无问题；`[WARN]` 有建议项；`[FAIL]` 有必须修的 ERROR（退出码 1）。
- `·` 行是信息（含已归类的误报）；`!` 行是 WARN；`-` 行是 ERROR。
- 技能库刚做增删/移植时，**必须对新技能单独跑一次**（`audit-skill.cjs <name>`），库级扫描不会告诉你 description 是否双语、是否残留上游 frontmatter 键。

### 阶段 2：分类裁决

把 ERROR / WARN 分成三类，**不要跳过分拣**：

| 类别 | 判据 | 处置 |
|---|---|---|
| 真缺陷 | 引用指向不存在的仓库内文件；frontmatter 不合法；name 非 kebab 或与目录名不一致；SKILL.md 含 CRLF；本机真实用户名绝对路径；正文残留 `OPENSQUILLA`/`{baseDir}`/`{{ with.* }}`/`skill_exec` 等专有运行时调用（检测说明见「本技能自带的三个工具」） | 必须修 |
| 已知误报 | 命中下方「误报分类表」 | 记入报告，**不改** |
| 灰色 | description 过短或缺某一语言半句、上游 frontmatter 键残留、同名不同内容、嵌套 SKILL.md、第三方正文里的历史写法 | **先问用户**，不擅自改语义 |

### 阶段 3：修复（epoch 循环）

每个真缺陷 = 一个原子 commit：

1. **先改引用，后删文件**——避免中间态断链。
2. 每轮：改 → 复跑两级扫描 → 通过才 `git commit`。
3. 失败就 `git restore` 回退，**换思路重试，不要原样重试**。
4. commit message 写清「改了什么 + 用什么命令验证」。

### 阶段 4：复验

- `validate-skills.cjs` → `failed=0`
- `audit-library.cjs` → `ERROR=0`
- `audit-skill.cjs` → `FAIL=0`（WARN 逐条裁决后记入报告）
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
| `audit-skill.cjs` 报 `.ps1`/`.py`/`.json` 含 CRLF | `core.autocrlf=true` 下工作副本本就是 CRLF，仓库 blob 是 LF（用 `git ls-files --eol <path>` 核对 `i/lf w/crlf`）；故该脚本只对 `.md` 报 CRLF |
| `audit-skill.cjs` 报「正文引用旧运行时名」且命中行含 `DSH environment note` / `原文本` / `替换` | 那是解释「已替换成 DSH 写法」的说明性文字，脚本已自动降级为 INFO |
| 英文-only 技能报「description 缺中文半句」 | 第三方原样导入、用户明确要求保留英文原文的技能；属灰色项，**先问用户**再补 |

## 自检（证明体检器不是空转）

改过 `scripts/audit-skill.cjs` 或怀疑它漏检时，用一份故意做坏的夹具库验证它确实报错：

```powershell
# 夹具生成器（在临时目录里造 BadName / broken-refs / dup-check / nested-check / crlf-check）
node <fixture-dir>\make-fixture.cjs
node <fixture-dir>\fake-lib\skill-audit\scripts\audit-skill.cjs
```

期望：`FAIL` 命中非 kebab name、frontmatter 残留键、正文专有运行时残留、断链、裸文件名读引用、`read ~/`、本机用户名路径、SKILL.md CRLF；`WARN` 命中技能内重复与 description 缺半句；嵌套 SKILL.md 与说明性引用归 `INFO`；退出码 1。夹具库用完即删，**不要放进技能库**。

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
单技能: audit-skill.cjs → 体检=<n> PASS=<n> WARN=<n> FAIL=<n>

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
| 只看 SKILL.md 就宣布「全绿」 | 漏掉内容文件的 CRLF / 断链 | 库级两级扫描都跑 |
| 只跑库级扫描就宣布单技能合规 | 漏掉 description 缺半句、上游 frontmatter 键残留、技能内重复、嵌套 SKILL.md | 阶段 1 第三个脚本（`audit-skill.cjs`）也要跑 |
| 不先 `git status` 就审计 | 在残缺技能库上得结论 | 阶段 0 强制做 |
| 把用户手删的文件 `git restore` 回来 | 方向反了，覆盖用户意图 | 见 ` D` 先问 |
| 把同名不同内容当重复删 | 删掉有意的区分 | 只按 md5 判重复 |
| 先删文件后改引用 | 中间态断链，复扫必失败 | 先改引用 |
| 用 `node -e "..."` 写校验逻辑 | PowerShell 剥离引号，语法报错 | 写成 `.cjs` 文件再跑 |
| 体检器报一堆噪声就关掉它 | 真缺陷被淹没 | 先把已知误报写进分类表并降级为 INFO，再复跑 |
| 改了体检器不做夹具自检 | 静默漏检，越修越假绿 | 用「自检」一节的夹具库验证报错能力 |
| 顺手 push / publish | 不可控 | 需用户明确同意 |

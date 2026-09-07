---
name: skill-create
description: "在 DSH 中创建、校验、安装和发布本地 Skill 的完整协议与流程。涵盖 SKILL.md frontmatter 规范、命名规则、YAML 安全写法、目录位置、校验方法、常见踩坑（冒号空格/CRLF/引号）以及 skill_search/skill_load 验证流程。当用户想新建一个 skill、把流程沉淀为 skill、修复无法被 DSH 扫描到的 skill 时使用本技能。"
---

# Skill 制作协议与规范流程（Skill Authoring）

## 目标与边界

**做**：帮助用户按照 DSH 官方约定创建本地 Skill，确保它能被 `skill_search` 发现、被 `skill_load` 加载。

**不做**：
- ❌ 不深入某个具体 Skill 的业务内容
- ❌ 不替代 DSH 插件开发（那是 `dsh-plugin-development` 的职责）
- ❌ 不负责发布到插件市场

## 一、Skill 目录规范

DSH 会扫描以下位置（按优先级从高到低）：

| 位置 | 说明 |
|------|------|
| 项目级 `<project>/.dsh/skills/<name>/SKILL.md` | 只对当前项目可见 |
| 项目级 `<project>/.agents/skills/<name>/SKILL.md` | 只对当前项目可见 |
| 用户级 `~/.dsh/skills/<name>/SKILL.md` | 对所有项目可见 |
| 用户级 `~/.agents/skills/<name>/SKILL.md` | 对所有项目可见 |

推荐把通用技能放到：

```text
C:\Users\<用户名>\.dsh\skills\<skill-name>\SKILL.md
```

### ⚠️ 扫描深度限制：只扫一层，禁止嵌套

DSH 技能扫描器（`@deepseek-ai/dsh-skill-filesystem`）**只扫描技能根目录的一层子项**：

- 合法：`~/.dsh/skills/<skill-name>/SKILL.md`
- 非法：`~/.dsh/skills/<parent>/<skill-name>/SKILL.md`（嵌套超过 2 层深会被 `isPotentialSkillPath` 拒绝）

源码依据（`dsh-skill-filesystem/lib/index.js`）：

```js
function isPotentialSkillPath(root, path) {
    const segments = containedSegments(root.path, path);
    if (segments === void 0 || segments.length === 0 || segments.length > 2) return false;
    return segments.length === 1 ? segments[0]?.endsWith(".md") === true : segments[1] === "SKILL.md";
}
```

**结论**：子技能一旦嵌套进父文件夹，就会从 DSH 可用技能列表消失——这是硬限制。但可以**反过来利用**它：把整套子技能物理内嵌进路由技能文件夹（见第九节模式 B），子技能作为资源文件由路由表用相对路径调度，`read` 读取执行，套件收敛成单一入口。不要把它当普通"分类目录"用（那会让所有技能都失效）。

## 二、SKILL.md 文件格式

每个 Skill 是一个目录：

```text
<skill-name>/
└── SKILL.md
```

`SKILL.md` 必须包含：

1. YAML frontmatter（必须放在文件最顶部）
2. Markdown 正文

### 标准模板

```markdown
---
name: my-skill-name
description: "这个技能用来做什么，什么时候使用。"
whenToUse: "可选：更详细的使用时机。"
user-invocable: true
disable-model-invocation: false
---

# 技能标题

## 目标与边界

**做**：...

**不做**：
- ❌ ...

## 工作流程

### 1. ...

## 输出模板

...
```

## 三、frontmatter 字段规范

| 字段 | 必需 | 说明 |
|------|------|------|
| `name` | ✅ | 必须是小写 kebab-case |
| `description` | ✅ | 一句话描述，必须能被 YAML 正确解析 |
| `whenToUse` | ❌ | 更详细的使用时机 |
| `user-invocable` | ❌ | 是否允许用户手动调用，默认 `true` |
| `disable-model-invocation` | ❌ | 是否禁止模型自动调用，默认 `false` |
| `metadata` | ❌ | 任意结构化元数据 |

### name 命名规则

必须匹配：

```regex
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

合法示例：

```text
skill-create
project-tech-profile
windows-bash-workdir
dsh-plugin-development
```

非法示例：

```text
MySkill
my_skill
my skill
my-skill-1.0
```

### description 编写要求

1. 必须是一句话，清晰说明“何时使用、解决什么问题”
2. 建议包含可搜索关键词，方便 `skill_search` 命中
3. **必须保证 YAML 安全**：
   - 避免在未加引号的纯文本里出现 `: `（冒号 + 空格）
   - 推荐直接用双引号包裹整个值
   - 不要使用会破坏 YAML 的特殊字符

推荐写法：

```yaml
description: "分析一个项目的技术栈、架构分层、关键概念和学习路径。当用户给了一个本地目录或 GitHub 仓库并想快速建立宏观认知时使用。"
```

错误写法：

```yaml
description: Analyze a project: tech stack, architecture...
```

因为 `project: tech` 会被 YAML 当成嵌套映射，导致整个 Skill 被忽略。

## 四、正文编写规范

正文用 Markdown，建议包含：

1. **目标与边界**：做什么 / 不做什么
2. **工作流程**：步骤化，可执行
3. **输出模板**：固定结构，保证输出一致
4. **注意事项**：常见坑、边界条件、用户可追问点

保持内容“像操作手册”，不要写成代码讲解或项目报告。

## 五、校验流程（重要）

写完 Skill 后必须验证，否则可能被 DSH 静默忽略。

### 1. 校验 YAML frontmatter

在 DSH 的依赖里已经有 `yaml` 包，可以用 Node 快速校验：

```bash
cd /d/npm-global/node_modules/@deepseek-ai/dsh/node_modules
node -e "
const fs = require('fs');
const yaml = require('yaml');
const raw = fs.readFileSync('C:/Users/<用户名>/.dsh/skills/<skill-name>/SKILL.md', 'utf8');
const lines = raw.split('\n');
const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
const data = yaml.parse(lines.slice(1, end).join('\n'));
console.log('OK', data.name, data.description);
"
```

### 2. 校验行尾

DSH 的 YAML 解析对 CRLF 在某些写法下会报错，**建议统一使用 LF**。复制自 GitHub 的技能（尤其 Windows 下 git checkout）常常带 CRLF，安装后必须转换。

在 Windows 上可以用 Python 转换：

```python
from pathlib import Path
p = Path('C:/Users/<用户名>/.dsh/skills/<skill-name>/SKILL.md')
p.write_bytes(p.read_bytes().replace(b'\r\n', b'\n'))
```

### 3. 用 DSH 工具验证

在当前 DSH 会话中执行：

```text
skill_search <关键词>
skill_load <skill-name>
```

能搜到、能加载，才算成功。另外 DSH 会把新技能自动注入本会话的"可用技能目录"（system-reminder 中的 available_skills 列表）——看到新技能名出现即 watcher 扫描成功，是最快的验证信号。

### 4. 批量校验脚本（安装多个技能时用）

在 PowerShell 里用 `node -e "..."` 写内联 JS 有一个**引号陷阱**：PowerShell 传参给原生命令时会剥离双引号，导致 `require(fs)` 之类的 JS 语法错误。**不要把校验逻辑写进命令行，写成临时 `.js` 文件再运行**：

```js
// validate-skills.js —— 遍历 ~/.dsh/skills 下所有子目录，校验 frontmatter + 转 LF
const fs = require('fs');
const path = require('path');
const yaml = require('D:/npm-global/node_modules/@deepseek-ai/dsh/node_modules/yaml');

const skillsDir = 'C:/Users/<用户名>/.dsh/skills';
const names = fs.readdirSync(skillsDir); // 可按需过滤，如 .filter(n => n.startsWith('desktop-'))
let fail = 0;
for (const name of names) {
  const p = path.join(skillsDir, name, 'SKILL.md');
  if (!fs.existsSync(p)) { console.log('[MISSING] ' + name); fail++; continue; }
  let raw = fs.readFileSync(p, 'utf8');
  if (raw.includes('\r\n')) { raw = raw.replace(/\r\n/g, '\n'); fs.writeFileSync(p, raw); }
  const lines = raw.split('\n');
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
  if (end < 0) { console.log('[NO-FRONTMATTER] ' + name); fail++; continue; }
  try {
    const data = yaml.parse(lines.slice(1, end).join('\n'));
    const ok = data && data.name && data.description && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.name) && data.name === name;
    console.log((ok ? '[OK] ' : '[BAD] ') + name); if (!ok) fail++;
  } catch (e) { console.log('[YAML-ERROR] ' + name + ' : ' + e.message); fail++; }
}
console.log(fail === 0 ? 'ALL PASS' : 'FAILURES: ' + fail);
```

运行：`node validate-skills.js`，用完后删除临时脚本。`yaml` 包路径按实际安装位置调整（在 DSH 的 `node_modules` 里，也可以用全局 `node_modules/yaml`）。

## 六、常见失败原因排查

| 现象 | 原因 | 修复 |
|------|------|------|
| `skill_search` 搜不到 | frontmatter 缺少 `name` / `description` | 补全必填字段 |
| `skill_search` 搜不到 | YAML 解析失败 | 检查 `: `、引号、特殊字符 |
| `skill_search` 搜不到 | 文件名不是 `SKILL.md` | 改为 `SKILL.md` |
| `skill_load` 找不到 | 目录名与 `name` 不一致 | 保持一致 |
| 加载后行为不对 | 正文缺少明确流程 | 补全步骤、边界、模板 |
| 别的 Skill 覆盖了它 | 同名 Skill 优先级更高 | 换唯一名称或调整位置 |

## 七、发布与维护

- 本地 Skill 直接放在 `~/.dsh/skills/` 即可，无需额外注册
- 要分享给其他人：把整个 `<skill-name>/` 目录打包，或放进项目的 `.dsh/skills/` 随仓库分发
- 要发布到 DSH 插件市场：需要走插件开发流程（参见 `dsh-plugin-development`）
- 修改已有 Skill 后，DSH 的 watcher 通常会自动刷新；如果没生效，重启 DSH

## 八、批量安装外部技能（GitHub / 技能市场）

从 GitHub 仓库或技能市场（如 skills.cat）安装一整套技能的标准流程：

1. **先看仓库结构**：用网页读取工具打开仓库主页，确认技能存放位置。常见的两种结构：
   - `skills/<name>/SKILL.md`（每个技能一个子目录）→ 直接整目录复制
   - `<name>.md` 平铺 Markdown（如 `.codex/skills` 单文件结构）→ 每个文件转为 `~/.dsh/skills/<name>/SKILL.md`
2. **克隆仓库到临时目录**：`git clone --depth 1 <repo-url> .tmp-skills-repo`。注意 Windows 下 git 把进度写 stderr，PowerShell 会报 `NativeCommandError`——用 `Test-Path` 确认 `.git` 是否存在来判断成功，不要只看 exit code。
3. **提取并复制**：把 `skills/*` 下每个技能目录复制到 `~/.dsh/skills/<name>/`，保持 `SKILL.md` 文件名不变。目录名必须与 frontmatter 的 `name` 一致。
4. **批量校验**：运行第五节第 4 条的批量脚本，检查 frontmatter、name 合法性、CRLF→LF。
5. **确认扫描**：看本会话 system-reminder 的可用技能目录是否出现新技能名。
6. **清理临时目录**：删除克隆的仓库和校验脚本。

注意事项：

- 外部技能的 frontmatter 可能带 DSH 不认识的额外字段（如 `version`），DSH 会忽略，无需删除，校验时只需确认 `name` + `description` 存在。
- 外部技能可能带专属工具/脚本/资源文件（如 `scripts/`、`templates/`）。只复制 `SKILL.md` 及其正文引用的相对资源；DSH 的 Codex 专属插件清单（如 `.codex-plugin/`）不需要装。
- 正文里的仓库专属约定（如"本仓库只面向 Codex"）可以保留，不影响 DSH 使用；如需改成 DSH 术语，改动正文即可，frontmatter 不动。

## 九、技能套件组织：路由技能模式

当你要安装/管理**一整套相关技能**（如 13 个 desktop-* 技能）时，有两种模式可选。**首选模式 B（内嵌路由）**——DSH 只扫一层，正好利用这个限制把整个套件收敛成一个入口。

### 模式 B（推荐）：子技能物理内嵌进路由技能文件夹

所有子技能目录**移入**路由技能文件夹内部，DSH 只扫描路由表这一个 SKILL.md，路由表用相对路径调度子技能文件，agent 用 `read` 工具读取文件内容执行：

```text
~/.dsh/skills/desktop-router/
├── SKILL.md                      ← 唯一被 DSH 扫描的路由入口
├── desktop-taste/SKILL.md        ← 子技能不注册为独立技能，只是路由文件夹内的资源
├── desktop-design-read/SKILL.md
├── desktop-art-direction/SKILL.md
├── desktop-audit/SKILL.md
└── ...（13 个子技能全部同级内嵌）
```

关键点：

1. **入口唯一**：可用技能列表里只出现 `desktop-router` 一个名字，13 个子技能从列表消失（这是预期，不是安装失败）。
2. **路由表写路径**：路由表每行对应 `<子技能名>/SKILL.md` 相对路径，附职责速查与触发信号，让 agent 一眼选型。
3. **执行靠 read**：路由输出块必须给出 `next: read ~/.dsh/skills/desktop-router/<route>/SKILL.md`，agent 读取文件后按其中指令执行——**不要**写"用 skill 工具加载子技能"（子技能未注册，skill 工具加载不到）。
4. **职责速查表**：路由技能内保留完整清单表（子技能名、职责、典型触发信号），即使不读文件 agent 也知道该选谁。
5. **固定路由流程**：边界判断 → 关键维度判断 → 路由决策 → read 子技能文件执行。

这个模式的好处：套件整体就是一个文件夹，分发/备份/发布都只需拷一个目录；路由逻辑集中在 SKILL.md，改路由不动子技能。

### 模式 A（备选）：子技能扁平，各自独立注册

```text
~/.dsh/skills/
├── desktop-router/SKILL.md      ← 路由技能（唯一入口，只做路由判断）
├── desktop-audit/SKILL.md       ← 子技能保持扁平，各自被 DSH 注册
├── desktop-redesign/SKILL.md
└── ...
```

子技能全部出现在可用技能列表，agent 用 `skill` 工具直接加载。缺点：技能列表被 13 个名字刷屏；套件不内聚。

### 路由技能 SKILL.md 的结构（两种模式通用）

1. **目录结构说明**：如果是模式 B，先画目录树说明子技能内嵌位置。
2. **子技能职责速查表**：套件内每个子技能的 `name`、职责、典型触发信号。
3. **固定路由流程**：边界判断（是否属于本套件领域）→ 关键维度判断（平台/目标/证据）→ 路由决策 → 加载/读取对应子技能。
4. **主路由表**：用户诉求 → 对应子技能 → 不适用条件 → 产出物。
5. **路由输出格式**：固定的判断块模板（如 `route: <skill-name>` + `next: <加载方式>`）。
6. **注意事项**：模式 B 必须说明"子技能未注册，用 read 读文件"；子技能文件缺失时只记录路由需求、不假装已加载；与其他入口技能（如原套件自带入口）的优先级关系。

要点：路由技能只负责"选"，不展开专项规则；子技能只负责"做"，不重复路由。agent 遇到领域任务时先命中路由技能，由它决定读取/加载哪个子技能。

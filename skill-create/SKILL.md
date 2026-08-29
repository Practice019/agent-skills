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

DSH 的 YAML 解析对 CRLF 在某些写法下会报错，**建议统一使用 LF**。

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

能搜到、能加载，才算成功。

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

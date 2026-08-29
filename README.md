# 🧠 DSH Skills 技能库

本目录是 **DeepSeek Harness (DSH) 用户级技能库**（`~/.dsh/skills/`）。每个技能是一个
目录，内含 `SKILL.md`（YAML frontmatter + 使用流程），DSH 启动时自动扫描、随时可加载。

## 怎么用

不用记任何安装步骤——技能已就位。需要时直接说或输入：

```text
/skill <技能名>       # 例如 /skill push-project
```

也可以直接描述需求（如"把项目发布到 GitHub"），模型会自动路由到对应技能。
技能太多记不住？看下面这张表就够了。

## 技能总览

| 技能 | 一句话说明 |
|------|-----------|
| `meta` | 技能路由：不确定该用哪个技能时先问它 |
| `define` | 需求澄清、规格先行（对应 `/spec`） |
| `plan` | 把规格拆成可验证的小任务（对应 `/plan`） |
| `build` | 按计划增量实现 + 测试（对应 `/build`） |
| `verify` | 真实运行验证与调试恢复（对应 `/test`） |
| `review` | 合并前质量门禁：正确性/可读性/架构/安全/性能（对应 `/review`） |
| `ship` | 上线发布：CI/CD、版本管理、文档（对应 `/ship`） |
| `browser-harness` | CDP 直连 Chrome 操控浏览器：抓站、登录、爬数据、复刻网页 |
| `hallmark` | 反 AI 味设计：落地页、重设计、设计审计（Anti-AI-slop） |
| `dsh-plugin-development` | 在 DSH 上开发动态 Cordis 插件的完整指南（Plugin/Run/Host/Client/Slot UI/RPC） |
| `skill-create` | 创建、校验、安装和发布 DSH Skill 的协议与流程 |
| `push-project` | 把项目发布到 npm + GitHub：检查清单、token 引导、tag/Release、一键发版 |
| `python-code-standards` | Python 企业级代码规范：命名/格式/类型标注/NEVER 红线/反 AI 模式 |
| `reverse-skill-router` | 逆向/渗透/安全技能路由包：AI 自动路由 + 按需工具链自举 + 自动进化经验库（含 42 个专业子技能 + CTF 侧车） |
| `android-reverse-engineering` | APK/XAPK/JAR/AAR 反编译（jadx/Fernflower）、提取 API 端点、追踪 UI→网络调用链 |

## 目录结构

```text
~/.dsh/skills/
├── <skill-name>/
│   └── SKILL.md              # 入口：YAML frontmatter（name/description）+ 使用流程
└── README.md                 # 本文件：技能总览
```

## 新建技能

遵循 `skill-create/SKILL.md` 协议：建目录 `~/.dsh/skills/<kebab-case-name>/SKILL.md`，
frontmatter 必填 `name`（小写 kebab-case）与 `description`（双引号包裹、YAML 安全），
统一 LF 行尾（CRLF 会破坏 YAML 解析）。

## 第三方技能

以下技能来自社区仓库，各自保留上游许可证（随目录携带 LICENSE）：

| 目录 | 上游 | 许可证 |
|------|------|--------|
| `reverse-skill-router/` | [zhaoxuya520/reverse-skill](https://github.com/zhaoxuya520/reverse-skill) | MIT（核心路由包）+ GPL-3.0（`CTF-Sandbox-Orchestrator/` 侧车） |
| `android-reverse-engineering/` | [SimoneAvogadro/android-reverse-engineering-skill](https://github.com/SimoneAvogadro/android-reverse-engineering-skill) | Apache-2.0 |

## License

MIT

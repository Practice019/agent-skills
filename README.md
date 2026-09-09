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
| `plan` | 把规格拆成可验证的小任务：依赖图 / 垂直切片 / 检查点 / `tasks/plan.md`（对应 `/plan`） |
| `build` | 按计划增量实现 + 测试（对应 `/build`） |
| `verify` | 真实运行验证与调试恢复（对应 `/test`） |
| `review` | 合并前质量门禁：正确性/可读性/架构/安全/性能（对应 `/review`） |
| `ship` | 上线发布：CI/CD、版本管理、文档（对应 `/ship`） |
| `browser-harness` | CDP 直连 Chrome 操控浏览器：抓站、登录、爬数据、复刻网页 |
| `dsh-plugin-development` | 在 DSH 上开发动态 Cordis 插件的完整指南（Plugin/Run/Host/Client/Slot UI/RPC） |
| `skill-create` | 创建、校验、安装和发布 DSH Skill 的协议与流程 |
| `push-project` | 把项目发布到 npm + GitHub：**先确认发布目标（都发 / 只发 npm / 只发 GitHub）**，再走检查清单、token 引导、tag/Release、一键发版 |
| `model-training-mindset` | 用模型训练思维攻坚多步骤任务：epoch 循环 + checkpoint 回退，子问题逐级固化 |
| `autox-scripting` | AutoX.js 自动化脚本编写与调试：截图找色、坐标点击、Shizuku 权限、多线程、常见坑 |
| `reverse-skill-router` | 逆向/渗透/安全技能路由包：AI 自动路由 + 按需工具链自举 + 自动进化经验库（含 42 个专业子技能 + CTF 侧车） |
| `android-reverse-engineering` | APK/XAPK/JAR/AAR 反编译（jadx/Fernflower）、提取 API 端点、追踪 UI→网络调用链 |
| `docx-official` | 生成/读取/转换 Word（.docx）：写报告合同、抽文本结构、填模板 |
| `pdf-official` | 生成/读取/转换/填写 PDF：抽文本表格、合并裁剪水印、填 AcroForm、OCR |
| `pptx-official` | 生成/读取/转换 PowerPoint（.pptx）：写幻灯片路演稿、抽结构、填模板 |
| `xlsx-official` | 生成/读取/清洗 Excel/CSV：建模、加列、公式、图表、导出 |
| `arxiv` | arXiv 论文检索/阅读/引用/下载：搜主题作者分类、取摘要元数据、BibTeX、跟踪新投稿 |
| `deep-research` | 深度调研：并行子 agent 多源交叉验证，产出带引用的调研报告 |
| `super-research` | 自主研究引擎（8 模式）：实验循环调参、量化分析、对比评测、根因排查、论文复现 |
| `learn-everything` | 把 PDF/论文/书章/URL/主题变成结构化互动课程：分章学习与练习 |
| `research-paper-writing` | 学术论文撰写/改写/润色：Abstract→Conclusion，中译英、逐段打磨 |
| `design-blueprint` | 动手做视觉产物前先出结构化设计规格：DESIGN.md + 结构布局 + Decision Trace |
| `frontend-design` | 新建或改造 UI 的视觉设计指导：配色、排版、环境约束、风格改造 |
| `html-to-video-pipeline` | HTML/CSS/JS 页面可靠渲染成 MP4：无头浏览器录制 + ffmpeg |
| `modern-python-toolchain` | 用 uv + ruff + pyright 搭现代 Python 项目：依赖、环境、lint、格式化 |
| `data-analytics` | 定量分析工作流包（17 子技能）：数据质量、指标诊断、KPI、看板、报告 |
| `product-design` | 产品设计工作流包（9 子技能）：UX 研究、流程审计、视觉构思、设计 QA |
| `sales` | 销售工作流包（20 子技能）：会议准备、客户优先级、商机策略、预测 |
| `3d-creation` | Blender MCP 建模 3D 场景/特效，或 three.js/GSAP 做叙事性 3D 艺术网站（DSH 无 Blender MCP 时明确说明并停止） |
| `visualizer` | 用内联 SVG 画说明图：流程、架构、对比、概念、层级、因果链、空间关系 |

> **description 约定**：所有技能 `description` 为**中英双语**——`<中文一句话 + 中文触发词> <官方英文原文>`。
> 正文语言不强制统一：原有中文技能保持中文，导入的英文技能保持英文。

## 目录结构

```text
~/.dsh/skills/
├── <skill-name>/
│   └── SKILL.md              # 入口：YAML frontmatter（name/description）+ 使用流程
├── _shared/                  # 跨技能共享资源（不是技能：无 SKILL.md，不会被注册）
│   ├── references/           # 7 个共享清单的唯一权威版本
│   ├── validate-skills.cjs   # 技能库校验器（只读）
│   └── README.md             # 引用写法与单一来源裁决依据
└── README.md                 # 本文件：技能总览
```

校验整个技能库（frontmatter / name / CRLF / 引用可解析 / 无 `~` 与机器绝对路径）：

```powershell
node "$env:USERPROFILE\.dsh\skills\_shared\validate-skills.cjs"
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
| `docx-official/` `pdf-official/` `pptx-official/` `xlsx-official/` `frontend-design/` `html-to-video-pipeline/` | MiMoCode 内置技能库（`builtin_skills`） | 随目录携带 LICENSE |
| `arxiv/` `deep-research/` `super-research/` `learn-everything/` `research-paper-writing/` `design-blueprint/` `modern-python-toolchain/` `data-analytics/` `product-design/` `sales/` | MiMoCode 内置技能库（`builtin_skills`） | 上游未附许可证，本地自用 |
| `3d-creation/` `visualizer/` | MiMo Desktop 引擎配置技能（`engine-config/skills`） | 上游未附许可证，本地自用 |

## License

MIT

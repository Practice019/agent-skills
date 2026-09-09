# Changelog

本仓库所有版本变化（技能库为文档型发布，无代码依赖，回滚 = `git revert <tag>` 对应提交）。

## [1.6.0] - 2026-09-10

### Removed
- `hallmark`：反 AI 味设计技能（单文件 65.9 KB + 107 个资源文件，加载成本过高）——已删除
- `frontend-design`：与 `hallmark` 触发条件完全重叠的薄弱删节版——已删除
- `quicker-skill`：Quicker 动作开发技能（frontmatter 使用 CRLF 行尾，且含 30+ 脚手架文件）——已删除

### Changed
- `plan`：**完全重写**。从 24 行薄壳扩为完整入口技能
  - 补齐 frontmatter（`description` 含中文触发词、`whenToUse`、`user-invocable`、`disable-model-invocation`）
  - 新增「目标与边界」（明确 Plan 阶段只读、唯一可写 `tasks/`）、「前置检查 Gate」（规格存在 / 读过代码 / 验收命令已知）
  - 新增 8 步工作流程（只读侦察 → 读详细方法 → 依赖图 → 垂直切片 → 写任务 → 排序检查点 → 落盘同步 → 人工确认）
  - 新增任务规模红线表、单任务结构模板、`tasks/plan.md` 输出模板、完成自检清单、7 条常见坑表
  - 明确本 harness 无 `skill_load` 工具，改用 `read` 读取关联资源，并给出全部资源绝对路径
- `README.md`：移除上述 3 个技能行，更新 `plan` 说明

### Fixed
- `plan/planning-and-task-breakdown.md`：修正断链 `../../references/definition-of-done.md` → `references/definition-of-done.md`

## [1.5.0] - 2026-09-09

### Changed
- `push-project`：新增**强制发布目标确认**（工作流第 0 步）——进入技能后先问「npm + GitHub 都发 / 只发 npm / 只发 GitHub」，再按目标只执行对应章节
  - 新增章节路由表（目标 → 执行章节 / 跳过章节），npm 与 GitHub 章节顶部加执行条件标注
  - 新增补充规则：含糊表述必须提问、未确认的一侧绝不动、只发 GitHub 时 `npm version` 需先征得同意
  - 常见坑新增 2 行（"push 到 GitHub 却顺手 npm publish"、"发布一下两边都发"）；输出模板增加「发布目标」字段与 `⏭️ 本次未选择` 标注
  - frontmatter `description` / `whenToUse` 同步声明"使用前必须先确认发布目标"
- `feishu-cli`：修正 frontmatter `name`（`lark-cli` → `feishu-cli`），与目录名一致，避免技能扫描识别不一致

### Fixed
- 移除机器信息残留（真实用户名绝对路径 → `C:\Users\<用户名>`）：`dsh-plugin-development`（7 处）、`fun-code-reverse`（2 处）

## [1.4.0] - 2026-09-08

### Added
- `autox-scripting`：AutoX.js（Auto.js 分支）自动化脚本编写与调试：截图找色、坐标点击、Shizuku 权限、多线程、文件操作、常见坑
- `desktop-router`：macOS/Windows 桌面 UI/UX 任务路由：按路由表分发至 audit/redesign/native feel/layout/typography/motion/brand/art direction/visual draft/QA/DESIGN.md 等子技能
- `frontend-design`：独特且生产就绪的前端界面设计与实现（HTML/CSS/JS、React、Vue 等），强审美方向
- `model-training-mindset`：模型训练思维攻坚多步骤任务：epoch 循环 + checkpoint 回退，子问题逐级固化衔接
- `quicker-skill`：Quicker 动作（Roslyn v2 引擎）开发、部署与发布：JSON 配置、C# 逻辑代码、Markdown 简介、本地/云端构建

## [1.3.0] - 2026-09-07

### Added
- `fun-code-reverse`：趣味代码逆向收录技能
  - 工作流：接收输入（用户点名功能点）→ 定位剥噪 → 提炼核心片段 → 写复刻提示词 → 收录进 `D:\project_GIT\fun-code-collection`
  - 条目形态：「复刻提示词 + 核心片段（10~40 行原机制）」配套交付；不做生成验证——提示词单独复现等于抽卡，可靠性由两者配套构造性保证
  - 规则级自进化：`playbook.md` 通用经验库只收泛化规则（可泛化/可执行/非重复三重门槛），拒绝案例日志
  - 双副本同步约定：`.dsh` 为主副本，`.zcode` 为同步副本

## [1.2.0] - 2026-08-23

### Added
- `reverse-skill-router`：逆向/渗透/安全技能路由包（zhaoxuya520/reverse-skill，MIT + GPL-3.0 CTF 侧车）
  - 42 个专业子技能（APK/.NET/JS/IDA/radare2/恶意软件/渗透/固件/云/AD 等）
  - 路由总控 + ops/scripts/config/field-journal 基础设施
  - `CTF-Sandbox-Orchestrator/` 侧车（42 个 competition-* 子技能）已并入容器目录
- `android-reverse-engineering`：APK/XAPK/JAR/AAR 反编译与 API 端点提取（SimoneAvogadro 社区 skill，Apache-2.0）
  - 已适配 DSH：补 `name` frontmatter、移除 Claude Code 专有 `${CLAUDE_PLUGIN_ROOT}` 路径

### Changed
- README：技能总览新增 2 行，增加第三方技能归属与许可证说明

## [1.1.0] - 2026-08-23

### Added
- `graphify` 知识图谱构建技能与 `hallmark` 反 AI 味设计技能（后改名/整理）
- `browser-harness` 浏览器自动化技能（CDP 直连 Chrome）

## [1.0.0] - 2026-08-22

### Added
- 初始技能库：SDLC 六阶段（define/plan/build/verify/review/ship）+ meta 路由 + 领域技能（dsh-plugin-development / skill-create / push-project / python-code-standards）

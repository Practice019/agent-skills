# Changelog

本仓库所有版本变化（技能库为文档型发布，无代码依赖，回滚 = `git revert <tag>` 对应提交）。

## [1.12.0] - 2026-09-10

### Added
- `fun-code-reverse`（2 文件）：把用户点名的有趣代码**介绍清楚**并收录进 `fun-code-collection` 收藏库 —— 条目 README 讲透机制，配一个 **30 行内、单文件零依赖、可直接跑**的最小 demo；从原代码摘的 10~40 行关键片段留作「我没编」的佐证。三部件分工固定：讲解管「为什么妙」、片段管「我没编」、demo 管「你能跑」。不写复刻提示词——demo 本身就是可执行的说明书。同附 `playbook.md` 泛化经验库（P0~P6，含流程经济 5 条）
- `60fps-animation`（3 文件）：修卡顿动画 —— 把逐帧触发重排/重绘的动画属性（`width`/`height`/`top`/`left`/`box-shadow`/`filter`）改成 `transform`/`opacity`，含 FLIP、`height auto`、滚动与 hover 抖动的排查改法；附件 `references/patterns-and-profiling.md`
- `find-skills`（1 文件）：在开源技能生态里发现并安装技能（Skills CLI：`npx skills find` / `add` / `update`）

### Fixed
- `60fps-animation/SKILL.md` 与 `references/patterns-and-profiling.md` CRLF → LF（硬门禁 `CRLF 行尾` 失败项，修复后 `passed=175 failed=0`）
- `60fps-animation` description 补中文半句（库规范要求中英双语，原为纯英文；单技能体检由 WARN 转 PASS）

### Changed
- `README.md` 技能总览补齐 **10 个漏列技能**（本次新增 3 个 + 历史遗留 7 个：`feishu-cli` / `flow-canvas` / `github-cli` / `latex-compile` / `skill-audit` / `stack-trace-triage` / `video-post-production`），表内技能行 33 → 43，与顶层技能目录数一致
- `package.json` 版本 1.11.0 → 1.12.0

### Notes
- 发布目标：**只发 GitHub**（按 `push-project` 第 0 步确认），本次不含 `npm publish`，npm 侧仍停在 1.4.0
- 发版前三级扫描全过：硬门禁 `scanned=175 passed=175 failed=0`；宽口径 `ERROR=0 WARN=0 INFO=35`；单技能体检三个新技能 `PASS=3 WARN=0 FAIL=0`
- 技能库自检：顶层技能 43 / `SKILL.md` 175 / 956 文件 / 8.5 MB

## [1.11.0] - 2026-09-10

### Added
- `skill-audit/scripts/audit-skill.cjs`：**单技能规范体检器**（补上库级两级扫描之外的第二层纵深）。逐个技能检查：
  - frontmatter 上游/专有键残留（`entrypoint` / `assemble` / `description_zh` / `triggers` / `homepage` / `always` / `provenance` / `metadata.opensquilla`）
  - description 长度与中英双语（缺任一半句给 WARN，不擅自改语义）
  - 正文专有运行时残留（`OPENSQUILLA` / `{baseDir}` / `{{ with.* }}` / `{{ outputs.* }}` / `{{ inputs.* }}` / `skill_exec` / `publish_artifact` / `MIMO_*`）
  - 引用精度（显式相对引用 + 裸文件名读引用是否可解析）、本机用户名路径、`read` 不展开的 `~/` 错误写法
  - 技能内 md5 完全重复、嵌套 `SKILL.md`（DSH 只扫一层）、`user-invocable:false` + `disable-model-invocation:true` 不可调用组合
  - 文件清单 / 体量 / SKILL.md 行数
- `skill-audit/SKILL.md`：新增「本技能自带的三个工具」表、阶段 1 三级扫描命令与输出约定、阶段 4 `FAIL=0` 复验门、误报分类表 3 行、常见坑 3 行，以及「自检」一节（用故意做坏的夹具库证明体检器不空转）

### Changed
- `skill-audit` description 双语补入单技能体检能力（catalog 条目随之更新）
- 阶段 1 更名「跑三级扫描」，阶段 2 判据表补入「正文专有运行时残留」等真缺陷判据

### Notes
- 三个扫描器共用同一套误报口径（`NON_REPO` / `ARTIFACTS` / `BENIGN_TILDE`），**改口径要三处同步**
- 体检器只在 `.md` 上判 CRLF：`core.autocrlf=true` 下 `.ps1`/`.py` 工作副本本就是 CRLF 而仓库 blob 为 LF（`git ls-files --eol <path>` 可核对），对非 `.md` 报 CRLF 属噪声
- 已知误报自动降级为 INFO：DSH 环境说明里「引用」旧运行时名、`tool-index.*`、代码块内模板引用、规则说明里的 `~/` 反例
- 验证（夹具库，8 类缺陷全部命中）：`FAIL` 命中非 kebab name / frontmatter 残留键 / 专有运行时残留 / 断链 / 裸文件名读引用 / `read` 加 `~/` 的错误写法 / 本机用户名路径 / SKILL.md CRLF；`WARN` 命中技能内重复与 description 缺半句；嵌套 SKILL.md 与说明性引用归 `INFO`；退出码 1
- 技能库自检：`audit-skill.cjs` → 体检=40 PASS=40 WARN=0 FAIL=0；硬门禁 `passed=172 failed=0`；宽口径 `ERROR=0 WARN=0 INFO=35`
- 技能库 949 文件 / 660 `.md` / 172 `SKILL.md` / 顶层技能 40

## [1.10.0] - 2026-09-10

### Added
- 从 OpenSquilla 内置技能库（`AppData\Roaming\uv\tools\opensquilla\Lib\site-packages\opensquilla\skills\bundled`，75 个技能）移植 **4 个技能**（源侧 12 个技能收敛）：
  - `github-cli`（1 文件）：`gh` CLI 操作 GitHub —— PR/CI 状态、issue 增删查、workflow run 日志、`gh api` + `--jq` 查询（源：`github`，MIT）
  - `video-post-production`（10 文件）：短视频后期五件套 —— 编号分段拼接与 xfade 转场、SRT 烧录（libass + CJK）、静图转 Ken-Burns 短片、脚本转 SRT、片头/片尾卡 PNG（源：`video-merger` MIT-0 + `subtitle-burner`/`video-still-animator`/`srt-from-script`/`title-card-image` Apache-2.0）
  - `stack-trace-triage`（1 文件）：堆栈排障 —— 语言识别表 + Python/JS-TS/Go/Rust/未知 五段探针 + 统一输出契约（源：5 个 `stack-trace-*-probe`，Apache-2.0）
  - `latex-compile`（2 文件）：LaTeX 多遍构建（xelatex → bibtex → xelatex ×2）+ 日志尾部/页数/警告信号，可选 `--min-pages` / `--min-refs` 门禁（源：`latex-compile`，Apache-2.0）

### Changed
- `video-post-production` 按 `skill-create` 模式 B 组织：单一入口 `SKILL.md` + 内嵌 `scripts/` 与 `src/`（`merge.py` 依赖 `src/video_merger.py`，保持原相对布局）；OpenSquilla 专有环境变量改名 `VIDEO_FONTS_DIR` / `VIDEO_POST_FFMPEG_INSTALLER` / `VIDEO_POST_SKIP_PYTHON_CHECK`
- `latex-compile` 由上游「meta-paper-write 步骤」改写为通用编译器：不再重写输入 `.tex`、不再注入固定作者行、不再从同级 `abstract.tex`/`method.tex` 拼装正文；页数与引用门禁改为可选开关。保留四遍构建顺序、末遍才硬失败、页数解析与日志尾部策略
- `stack-trace-triage` 把 5 个 1 KB 同模板孤儿技能（父技能 `meta-stack-trace-investigator` 不在 bundle 内，且被标为不可调用）合并为 1 个可调用技能

### Notes
- 移植规范沿用 1.8.0/1.9.0 惯例：frontmatter 只留 `name`/`description`（双语）/`whenToUse`/`metadata`；`name` = kebab-case = 目录名；正文语言与上游一致（英文）；路径一律相对本技能目录；`provenance` 记录许可证与上游技能名；LF 行尾
- 源库 75 个技能中 **63 个有意不移植**：43 个依赖 OpenSquilla 专有运行时（`entrypoint`+Jinja、`{{ outputs.* }}` DAG、`tts`/`music_generate`/`voice_*`、`cron`/`memory`、`skill_exec`、能力租约、`import opensquilla`）、13 个与 DSH 已有技能等价（docx/xlsx/pptx/pdf-toolkit/web-search/multi-search-engine/deep-research/skill-creator/sub-agent 等）、7 个列为待拍板灰色项（`html-to-pdf`/`nano-banana-pro`/`seedance-2-prompt`/`ai-video-script`/`html-coder`/`weather`/`git-diff`，本轮按用户决定全部不做）
- 顶层技能 36 → 40；`SKILL.md` 168 → 172；技能库 948 文件 / 660 `.md`；catalog description 合计 24787 字符（中文 2656）
- 验证：`_shared/validate-skills.cjs` → `passed=172 failed=0`；`skill-audit/scripts/audit-library.cjs` → `ERROR=0 WARN=0 INFO=34`；4 个技能均出现在 `available_skills` 并按名加载成功
- 实机端到端验证：`build_srt.py` 生成时间码正确的 SRT；`render_title_card.py` 产出 CJK 片头卡 PNG（字形校验通过）。本机**未安装 ffmpeg/ffprobe**，`merge.py`/`burn.py`/`animate.py` 仅完成 CLI 与语法验证——使用时须先跑 `install.ps1` 或自装 ffmpeg ≥ 5.0

## [1.9.0] - 2026-09-09

### Added
- 从 MiMo Desktop 引擎配置技能库（`AppData\Roaming\Xiaomi MiMo\engine-config\skills`）移植 **2 个技能**：
  - `3d-creation`（6 文件 / 19.5 KB）：Blender MCP 建模 3D 场景与特效 + three.js/GSAP 叙事性 3D 艺术网站
  - `visualizer`（1 文件 / 9 KB）：内联 SVG 说明图（流程 / 架构 / 对比 / 概念 / 层级 / 因果链 / 空间关系）

### Fixed
- `3d-creation`：`name: 3D Creation` → `3d-creation`（DSH 要求 kebab-case 且与目录名一致），并补正式英文 description 半句
- `3d-creation`：加 DSH 运行时说明——DSH 无 Blender MCP，缺失时明确说明并停止；网站路径用 `browser-harness` 截图验证而非只信代码
- `visualizer`：加 DSH 运行时说明——内联 SVG 在 DSH Web GUI 渲染无保证，渲染不出就写 `.svg` 文件

### Notes
- 该目录另有 5 个技能**有意不移植**：`figma`（920 KB，强依赖 Figma MCP）、`imagegen`（依赖 `image_gen`/`image_edit`，需映射到 `doubao_ask`，留待后续）、`mimo-desktop-guide` / `mimo-skill-authoring` / `session-chat`（MiMo Desktop 专有，DSH 无对应概念或已被 `skill-create` 覆盖）
- 顶层技能 34 → 36；`SKILL.md` 166 → 168；catalog description 合计 22488 字符

## [1.8.0] - 2026-09-09

### Added
- 从 MiMoCode 内置技能库移植 **16 个通用技能**（description 双语，正文保留英文原文，专有运行时依赖已替换为 DSH 说明）：
  - 文档四件套：`docx-official` / `pdf-official` / `pptx-official` / `xlsx-official`
  - 研究与学习：`arxiv` / `deep-research` / `super-research` / `learn-everything` / `research-paper-writing`
  - 设计三件套：`design-blueprint` / `frontend-design` / `html-to-video-pipeline`
  - 工程与工作流大包：`modern-python-toolchain` / `data-analytics`（17 子技能）/ `product-design`（9 子技能）/ `sales`（20 子技能）
- 三个工作流大包根 `SKILL.md` 增加 **DSH 运行时说明**：无连接器 / 托管预览运行时，降级运行并明确说明缺哪个能力

### Changed
- **description 全面双语化**：格式 `<中文一句话 + 中文触发词> <官方英文原文>`，不设长度上限（与官方一致）
  - 7 个纯英文技能补中文：`build` / `define` / `review` / `ship` / `verify` / `meta` / `reverse-skill-router`
  - 9 个纯中文技能补英文：`dsh-plugin-development` / `push-project` / `model-training-mindset` / `skill-audit` / `plan` / `autox-scripting` / `feishu-cli` / `browser-harness` / `flow-canvas`
  - 正文语言**不统一**：已有中文保持中文，导入的英文保持英文
- `skill-create`：新增「语言规范（description 必须中英双语）」章节
- `frontend-design` 与 `design-blueprint`：双向加 Boundary 交叉引用
- `skill-audit/scripts/audit-library.cjs`：新增 `catalog description` 体量报告行（顶层技能数 / 合计字符 / 中文字符 / 平均）

### Fixed
- 扫描器误报收敛（`_shared/validate-skills.cjs` 与 `skill-audit/scripts/audit-library.cjs` 同步）：
  - 机器路径规则只对含用户名 / 主目录的绝对路径报错，跳过 `~/` 反例说明与 URL / 域名（如 `arxiv.org/abs/...`）
  - 运行期产物识别：树状清单行、`deliverable` / `artifact` / `output` / `产物` / `输出` / `生成` 行、创建动词紧邻的 `write` / `keep a \`X.md\`` 行
  - 点号配置文件（`.app.json`）不再被当作缺失引用
  - 只有**顶层**技能重名才报错：嵌套子技能（`workflows/index/SKILL.md`）重名无害，DSH 不注册
  - 非 `SKILL.md` 的第三方文档里未解析的裸文件名降级为 INFO（`SKILL.md` 仍为 ERROR）
- `pptx-official/SKILL.md`：`soffice_bridge.py` → `scripts/soffice_bridge.py`
- `data-analytics/workflows/create-data-context/references/automation.md`：裸文件名 → `../plugin-author-config/automation-config.md`
- 文档四件套中 4 处 MiMo 专有运行时（`MIMO_PYTHON` / `MIMO_SOFFICE` / `MIMO_NODE`）替换为 DSH 环境说明

### Notes
- 扫描范围仍是**只扫一层**：顶层技能 34 个（原 18 + 新增 16），嵌套子技能作为资源被引用
- 技能库体量 8.25 MB / 925 文件 / 166 个 `SKILL.md`；`catalog description` 合计 21285 字符
- 有意**不移植**：`mimocode-docs` / `evolve` / `memory-search` / `loop` / `mate` / `claude-code` / `codex` / `grok-build` / `compose-next`（MiMo 专有）；`playwright`、`skill-creator` 按用户决定跳过

## [1.7.0] - 2026-09-09

### Added
- `_shared/`：跨技能共享资源目录（**不是技能**——无 `SKILL.md`，DSH 不注册）
  - `_shared/references/`：7 个共享清单的**唯一权威版本**（accessibility / definition-of-done / observability / orchestration / performance / security / testing）
  - `_shared/validate-skills.cjs`：技能库校验器（只读）——frontmatter 可解析、`name` kebab-case 且与目录名一致、无 CRLF、读引用可解析、无 `read ~/`、无含用户名的绝对路径
  - `_shared/README.md`：引用写法与单一来源裁决依据
- `reverse-skill-router/RULES.md`：补回缺失的全局规则文件（源自上游 `RULES_zh.md`，剥离 `skills/` 前缀并适配本地路径），修复 17 个文件对它的引用
- `skill-create`：新增「路径引用规范（DSH 实测）」章节——`read` 不展开 `~`，技能内引用一律相对技能目录，跨技能用 `../<技能>/…`

### Changed
- 7 个阶段技能（build / define / plan / review / ship / verify / meta）：共享清单引用统一指向 `../_shared/references/`，**删除 59 个重复副本**（-474.2 KB）；全库 8.65 MB → 6.65 MB
- `meta`、`skill-create`：`skill_load` / `skill_search`（本 harness 不存在）→ 按名加载的 `skill` 工具 + 观察 `available_skills` 的验证法
- `plan`（9 处）、`desktop-router`（3 处）、`skill-create`（1 处）：`~` 路径改为相对技能目录
- `android-reverse-engineering` ↔ `reverse-skill-router`（`apk-reverse/`、`mobile-reverse/`）：建立交叉引用（不物理合并，保留上游归属）
- `reverse-skill-router/tool-index.{md,json}`：机器特定生成物，加入 `.gitignore`

### Fixed
- **17 处 `../../references/*.md` 断链**：该写法解析到从不存在的 `skills/references/`，现统一为 `../_shared/references/`
- `reverse-skill-router/SKILL.md`：操作先例库表 `precedent-*.md`、`case-init.ps1` 裸名 → 补 `field-journal/`、`scripts/` 前缀
- `reverse-skill-router/firmware-pentest`：`patterns-hardware.md`（不存在）→ `reverse-engineering/platforms-hardware.md`
- 机器相关绝对路径：`python-code-standards`（同源仓库路径去绝对化）、`fun-code-reverse`（收录目标标注为本机可配置项）

### Verified
- `validate-skills.cjs`：119 个 `SKILL.md` 全部通过；共享清单引用 25/25 可解析；7 个共享文件名全库仅存 `_shared` 一份

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

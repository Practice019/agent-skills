# 🧠 Agent Skills 通用技能库

**通用 Agent 技能集合**：把软件开发生命周期（SDLC）方法论沉淀为可检索、可加载的 Skill
（`SKILL.md` + YAML frontmatter），让 Agent 按阶段路由到对应流程执行。
以 **DeepSeek Harness (DSH)** 为参考载体（安装于 `~/.dsh/skills/`），
方法论本身与具体平台无关，可移植到其他支持 Skill 协议的 Agent 平台。

## 技能总览

### 工作流阶段（SDLC）

| 阶段 | 入口 | 定位 |
|------|------|------|
| 🧭 meta | `meta/SKILL.md` | 任务路由：判断任务属于哪个阶段，加载对应分类 |
| 📐 define | `define/SKILL.md` | 需求澄清：规格先行（对应 `/spec`） |
| 🗺 plan | `plan/SKILL.md` | 规格拆解为可验证任务（对应 `/plan`） |
| 🔨 build | `build/SKILL.md` | 薄切片增量实现 + TDD（对应 `/build`） |
| 🔬 verify | `verify/SKILL.md` | 真实运行验证与调试恢复（对应 `/test`） |
| 🧐 review | `review/SKILL.md` | 合并前质量门禁：正确性/可读性/架构/安全/性能 |
| 🚀 ship | `ship/SKILL.md` | 上线发布：CI/CD、版本管理、文档（对应 `/ship`） |

### 独立领域技能

| 技能 | 定位 |
|------|------|
| `dsh-plugin-development` | DSH 动态 Cordis 插件开发完整指南（Plugin/Package/Run、Host/Client、Slot UI、RPC、动态 Tool、版本与审批） |
| `skill-create` | DSH 技能制作协议：frontmatter 规范、命名、YAML 安全、校验流程 |
| `push-project` | 项目发布到 npm + GitHub：发布前检查、token 引导、tag/Release/topics、自动化发版 |
| `project-tech-profile` | 项目技术画像：技术栈/架构/关键概念/学习路径 |
| `browser-harness` | 浏览器自动化手册（CDP 直连 Chrome）：抓站/登录/爬数据/复刻网页，含 grab_page/crawl_site/login_form 封装工具与实战坑 |

## 目录结构约定

```text
~/.dsh/skills/
├── <skill-name>/
│   ├── SKILL.md              # 入口：YAML frontmatter + 目标 + 路由
│   ├── *.md                  # 子模块方法论
│   ├── references/*.md       # 共享检查清单（跨技能复用）
│   └── support/<sub>/...     # 子模块专属覆盖层
```

设计要点：

- **薄入口 + 深方法论**：`SKILL.md` 只做目标声明与任务路由，细节在子模块
- **references 复用**：安全/性能/可访问性/测试等 6 份检查清单跨阶段共享（DRY）
- **support 覆盖层**：子模块专属版本同名覆盖全局 references（继承 + 局部重写）
- **YAML frontmatter**：`name`（kebab-case）+ `description`（YAML 安全写法）是 DSH 发现技能的唯一入口

## 安装与使用

技能目录直接放入支持 Skill 协议的 Agent 平台扫描路径即可（以 DSH 为例，优先级从高到低）：

1. 项目级 `<project>/.dsh/skills/<name>/SKILL.md`
2. 用户级 `~/.dsh/skills/<name>/SKILL.md`（本仓库即此形态）

DSH 的 watcher 会自动刷新；会话中可用 `skill_search` / `skill_load` 加载。

```text
skill_search build        # 搜索
skill_load build          # 加载
```

## 新建技能

遵循 `skill-create/SKILL.md` 协议：

1. 建目录 `~/.dsh/skills/<kebab-case-name>/SKILL.md`
2. frontmatter 必填 `name`（小写 kebab-case）与 `description`（双引号包裹、YAML 安全）
3. 正文：目标与边界 → 工作流程 → 常见坑 → 输出模板
4. 校验：Node + `yaml` 包解析 frontmatter；统一 LF 行尾

## License

MIT

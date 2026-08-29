# Changelog

本仓库所有版本变化（技能库为文档型发布，无代码依赖，回滚 = `git revert <tag>` 对应提交）。

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

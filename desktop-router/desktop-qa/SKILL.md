---
name: desktop-qa
description: 在桌面 UI 实现或重设计交付前，检查实现是否符合 Desktop Read、桌面证据目标、平台感、布局密度、状态、键盘路径、真实数据和主题要求。
version: 0.3.0
---

# Desktop QA

本 Skill 用于 macOS / Windows 桌面 UI 实现后的交付前检查。它不是广义产品审计，也不是代码质量 review；只判断已经实现的桌面界面是否仍符合 Desktop Read 和证据目标。

## 触发条件

当 `desktop-taste` 路由到 `QA`，或用户提出以下需求时使用本 Skill：

- 已完成桌面 UI 实现、重设计或修复，需要交付前检查
- 需要确认实现没有偏离 Desktop Read、`DESIGN.md`、截图、运行中窗口、代码 UI 结构、平台参考或已选 art direction
- 需要确认实现截图 / runtime evidence 是否对齐 selected visual draft 的窗口、状态、密度和平台材料边界
- 需要判断窗口缩放、键盘路径、状态、真实数据、主题和平台感是否足够交付
- macOS-first 实现需要检查 Liquid Glass、scene/window、toolbar/title、drag region、resize/restoration、sidebar/Inspector、commands/focus 和 AppKit 边界
- 需要把剩余 P0 / P1 / P2 问题转成最小修复清单

## 不适用场景

不要用本 Skill 处理：

- 没有桌面应用 UI 载体的 Web landing、Mobile app、品牌官网或营销页
- 用户要广义 UX 审计、产品流程审计或设计 critique；这类任务使用 `desktop-audit`
- 纯代码正确性、安全、性能、测试覆盖、打包、签名、发布或后端 review
- 尚未完成实现、没有 implementation evidence，或没有 Desktop Read / 证据目标可对照的任务

## 前置输入

必须引用：

- `Desktop Read`：platform、platform_depth、app_archetype、density、primary_interaction、main_risks 和 evidence_target。
- source evidence：截图、运行中窗口、现有 UI 代码、`DESIGN.md`、平台参考、用户描述、已选 art direction、draft-ready brief 或 selected visual draft。
- implementation evidence：实现后的截图、运行中窗口、代码路径或可复现路径。

证据不足时可以输出 `blocked`，但不要凭记忆说通过。

## 分析方法

1. **绑定目标**：说明本次 QA 对照的 Desktop Read、证据目标和实现证据。
2. **匹配状态**：确认 source 和 implementation 是否是同一窗口、平台、主题、数据状态、窗口尺寸和交互状态；不一致先写入 limits。
3. **对齐设计稿**：如有 selected visual draft，只比较可实现契约：窗口区域、组件角色、密度、状态、平台材料边界、视觉层级和 signature moment；不做 pixel-perfect 检查。
4. **检查桌面维度**：平台感、窗口结构、布局、typography / density、状态完整性、键盘路径、真实数据、主题 / high contrast / reduced motion。
5. **发现优先**：只列会影响交付的 P0 / P1 / P2；P3 可放 follow-up，不阻塞通过。
6. **给最小修复**：每个阻断项写最小修复，不把 QA 扩成 redesign。

## 检查维度

- `native_feel`: 窗口、toolbar、菜单、context menu、dialog / sheet、系统字体、accent 和平台快捷键。
- `layout_composition`: sidebar、split view、Inspector、table / list / tree、status bar、窗口缩放和滚动边界。
- `typography_density`: 字号、行高、表格 / 列表密度、metadata、错误和状态文案。
- `state_completeness`: hover、focus、selected、active、disabled、loading、empty、error、success、offline / syncing、permission。
- `keyboard_path`: Tab、方向键、Enter、Esc、快捷键、type-ahead、焦点返回和 focus ring。
- `real_data_readiness`: 0 / 1 / 10 / 100+ 条记录、长名称、多列、多选、排序、筛选、权限差异和后台任务。
- `theme_accessibility`: light / dark、high contrast、reduced motion、系统 accent color 和可读性。
- `brand_expression`: 品牌表达是否服务工作流，没有压过状态色、选择态和主工作区。
- `visual_draft_alignment`: 仅在有 selected visual draft 时检查同一窗口 / 状态 / 尺寸 / 主题下的布局、密度、状态、材料边界和 signature moment；不检查随机文字或像素级一致性。
- `macos_native_depth`: 仅在 macOS-first 时检查 Liquid Glass 使用边界、SwiftUI scene/window 角色、toolbar/title、drag region、resize/restoration、sidebar/Inspector、commands/focus、AppKit bridge owner 和 Windows 非适用范围。

## 反模式

- 没有运行或截图证据就说 QA 通过
- 用审美偏好替代 Desktop Read 的平台、密度和交互判断
- 发现 P0 / P1 / P2 后仍标记 `passed`
- 把 QA 扩成完整 redesign，要求重做无关区域
- 用单一 happy path 截图证明键盘、错误、真实数据或可访问性已经可用
- 用 selected visual draft 代替 implementation evidence，或用像素级差异替代桌面契约差异
- 把 Web dashboard、landing hero、低密度卡片墙或平台中性 UI 当作桌面交付通过
- macOS-first 没有检查 Liquid Glass 可读性、scene/window 角色或 AppKit bridge 边界就标记通过
- 把 macOS Liquid Glass、toolbar/sidebar 或 AppKit 规则误判为 Windows 必须项

## 输出格式

```text
Desktop QA:
- result: <passed / blocked>
- source_read:
  - platform: <Desktop Read platform>
  - platform_depth: <macOS-first / Windows-first / cross-platform desktop>
  - app_archetype: <Desktop Read app_archetype>
  - density: <Desktop Read density>
  - primary_interaction: <Desktop Read primary_interaction>
  - main_risks: <Desktop Read risks>
- source_evidence:
  - <screenshot/runtime/code/DESIGN.md/reference/art direction/draft-ready brief/selected visual draft/user description>
- selected_visual_draft:
  - source: <image id / file path / prompt / brief / not provided>
  - scope: <window / platform / theme / data state / selected by>
- comparison_scope:
  - <参与比较的窗口、状态、流程和尺寸>
- draft_contract:
  - <从 selected visual draft 提炼出的可实现布局、密度、状态、材料边界或 signature moment>
- implementation_evidence:
  - <screenshot/runtime/code path/reproduction path/head sha/run id/captured at>
- limits:
  - <当前证据无法证明的交互、可访问性、真实数据或运行状态>
- implementation_mapping:
  - adopt: <实现已经吸收的 draft 契约>
  - adapt: <实现出于平台、可读性、真实数据或工程约束做出的合理调整>
  - reject: <未照抄的随机文字、假数据、错误 chrome、不可实现材料或非产品装饰>

Findings:
- [P0/P1/P2] <area>: <问题一句话>
  evidence: <具体证据>
  impact: <为什么影响桌面交付>
  minimum_fix: <最小可行修正>

Desktop Checks:
- native_feel: <pass / needs work / fail + note>
- layout_composition: <pass / needs work / fail + note>
- typography_density: <pass / needs work / fail + note>
- state_completeness: <pass / needs work / fail + note>
- keyboard_path: <pass / needs work / fail + note>
- real_data_readiness: <pass / needs work / fail + note>
- theme_accessibility: <pass / needs work / fail + note>
- brand_expression: <pass / needs work / fail + note>
- visual_draft_alignment: <pass / needs work / fail / not applicable + note>
- macos_native_depth: <pass / needs work / fail / not applicable + note>

Implementation Checklist:
- <按最小修复顺序列出>

Follow-up Polish:
- <不阻塞通过的 P3>
```

`result` 规则：

- `passed`：没有可执行的 P0 / P1 / P2 finding；P3 可以留作 follow-up。
- `blocked`：仍有 P0 / P1 / P2，或缺少足够 implementation evidence。

## Preflight Checklist

- [ ] 是否引用 Desktop Read 和证据目标
- [ ] 是否区分 source evidence 与 implementation evidence
- [ ] 如有 selected visual draft，是否只比较可实现契约，而不是 pixel-perfect 或随机生成细节
- [ ] 是否说明当前证据的 limits
- [ ] 是否覆盖平台感、布局、密度、状态、键盘、真实数据和主题
- [ ] macOS-first 时是否覆盖 Liquid Glass、scene/window、toolbar/title、drag region、resize/restoration、sidebar/Inspector、commands/focus 和 AppKit 边界
- [ ] Windows-first 或 cross-platform 时是否说明 macOS Native Depth 检查为 not applicable 或仅作平台差异参考
- [ ] 是否把 P0 / P1 / P2 转成最小修复清单
- [ ] 是否避免把 QA 扩成无关 redesign 或 Web critique

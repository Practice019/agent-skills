---
name: office-docs
description: "Office 文档四件套统一入口：Word(.docx) / PDF / Excel(.xlsx,.csv) / PowerPoint(.pptx) 的生成、读取、转换、填写模板与表单。当产物或输入是这四类文档时使用，先按本路由表定位到对应子技能再用 read 打开。Unified router for the office document suite (docx, pdf, xlsx, pptx): generate, read, convert, fill templates and AcroForm. Use whenever the artifact on either side is a Word, PDF, Excel/CSV, or PowerPoint file; route to the matching embedded subskill and read it."
whenToUse: "任务涉及 .docx / .pdf / .xlsx / .xlsm / .csv / .tsv / .pptx 任一格式的读写转换时。"
user-invocable: true
---

# Office Docs Router（文档四件套路由）

四个文档技能物理内嵌在本目录下，**只有本文件被 DSH 注册**；子技能用 `read` 打开后按其指令执行（不要用 `skill` 工具加载子技能名，它们不注册）。

## 子技能速查

| 格式 | 子技能文件 | 适用场景 |
|---|---|---|
| Word `.docx` | `docx-official/SKILL.md` | 写报告/合同/技术文档、抽文本与结构、填模板 |
| PDF `.pdf` | `pdf-official/SKILL.md` | 抽文本与表格、合并/裁剪/旋转/水印、合成新 PDF、填 AcroForm、OCR、加解密 |
| Excel/CSV `.xlsx` `.csv` | `xlsx-official/SKILL.md` | 建模、更新表格、加列、写公式、做图表、导出 |
| PowerPoint `.pptx` | `pptx-official/SKILL.md` | 写幻灯片/路演稿/汇报材料、抽结构、填模板、转 PDF/图片 |

## 路由流程

1. **判断格式**：看输入或产物扩展名（拿不准就问，或看文件头）。
2. **多格式任务**：按"先读后写"顺序逐个路由（例如"把 xlsx 汇总成 pptx" → 先 `xlsx-official` 读数，再 `pptx-official` 出片）。
3. `read <子技能目录>/SKILL.md`（相对本技能目录），按其中的流程与脚本执行。
4. 子技能自带 `references/`、`scripts/`，其中路径相对**该子技能目录**解析。

## 路由输出格式

```text
route: office-docs/<格式>-official
next: read <格式>-official/SKILL.md（相对本技能目录）
```

## 注意事项

- **格式转换链**：跨格式转换优先用子技能里既有的桥接脚本（如 pptx/docx 走 LibreOffice 桥），不要自己临时拼命令。
- **不注册子技能是预期行为**：可用技能列表里只有 `office-docs` 一个名字。
- 子技能文件缺失或被移动时如实告知，不要假装已加载。

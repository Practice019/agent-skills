---
name: video
description: "视频生产两件套统一入口：HTML/CSS/JS 页面无头录制生成 MP4（Playwright + ffmpeg），以及已有素材的后期流水线（ffmpeg + Pillow：分段拼接、xfade 转场、SRT 字幕烧录、静图 Ken-Burns、片头片尾卡）。当任务是从网页/HTML 出片或对多段视频做后期时使用。Unified router for video production: headless HTML/CSS/JS page recording to MP4 (Playwright + ffmpeg) and deterministic post-production on existing material (concat with xfade, burned SRT subtitles, Ken-Burns from a still, title cards). Use when rendering a page to video or assembling/finishing video segments."
whenToUse: "要「把页面录成视频」「HTML 出片」「多段视频拼接」「烧字幕」「静图做动态短片」「做片头卡」时。"
user-invocable: true
---

# Video Router（视频生产路由）

两个视频技能物理内嵌在本目录下，**只有本文件被 DSH 注册**；用 `read` 打开子技能文件后按其指令执行。

## 子技能速查

| 子技能 | 定位 | 何时用 |
|---|---|---|
| `html-to-video-pipeline/SKILL.md` | **生成**：HTML/CSS/JS 页面 → MP4（无头浏览器逐帧录制 + ffmpeg），含排序、坑位与验证步骤 | 素材还不存在，要先"录制/渲染"出画面 |
| `video-post-production/SKILL.md` | **后期**：确定性 ffmpeg + Pillow 流水线（编号片段拼接、xfade、SRT 烧录、Ken-Burns、片头卡） | 素材已存在，要做拼接/字幕/转场/包装 |

## 路由流程

1. **先判断素材状态**：没有画面 → `html-to-video-pipeline`；已有片段/静图/字幕 → `video-post-production`。
2. **串联场景**：先渲出片段、再做后期 → 依次读两个子技能（先生成后后期），不要并行。
3. `read <子技能目录>/SKILL.md`（相对本技能目录）。
4. 子技能内部的 `references/`、`scripts/`、`src/` 相对**该子技能目录**解析；两者互相引用时用兄弟目录路径（如 `video-post-production` 里引用 `../html-to-video-pipeline/...`）。

## 路由输出格式

```text
route: video/<子技能名>
next: read <子技能名>/SKILL.md（相对本技能目录）
```

## 注意事项

- 两边都依赖 **ffmpeg**（字幕烧录还依赖 libass + CJK 字体）；缺依赖时按子技能的检查步骤先装。
- 不要自己临时拼 ffmpeg 命令绕过子技能里的既有脚本 —— 那里记录了排序、坑位与验证步骤。
- 子技能未注册是预期行为，用 `read`，不要用 `skill` 加载。

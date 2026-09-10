---
name: video-post-production
description: "短视频后期流水线（ffmpeg + Pillow，确定性、无 LLM）：编号分段 MP4 拼接与 xfade 转场、SRT 字幕烧录（libass + CJK 字体）、单图转 Ken-Burns 短片、脚本转 SRT、片头/片尾卡 PNG。当用户要把多个片段拼成一条片子、给视频烧字幕、把静图做成动态短片、做片头卡，或 AI 视频被拒需要兜底片段时使用。 Deterministic short-video post-production with ffmpeg and Pillow: concatenate numbered MP4 segments with optional fade transitions, burn an SRT into a video via libass (CJK-safe), turn a single still into a Ken-Burns clip, build cumulative-timestamp SRT cues from a shot script, and render title/ending cards. Trigger when a workflow has produced several short clips that need stitching, needs burned-in subtitles, needs a fallback clip when a moderated video model refuses, or needs cover/ending cards. Merged from the OpenSquilla video-merger / subtitle-burner / video-still-animator / srt-from-script / title-card-image skills."
whenToUse: "用户要把分段视频拼成成片、加转场、烧字幕、生成 SRT、把图片做成动态片段、做片头片尾卡；或上游 AI 视频生成被拒后需要一个合规的替代片段以便下游合并仍能出片。"
metadata:
  provenance:
    origin: "clawhub-mit0 + opensquilla-original"
    license: "MIT-0 (video-merger) / Apache-2.0 (subtitle-burner, video-still-animator, srt-from-script, title-card-image)"
    upstream_skills: "video-merger, subtitle-burner, video-still-animator, srt-from-script, title-card-image"
    upstream_url: https://clawhub.ai/machunlin/video-merger
    ported_from: opensquilla-bundled-skills
    modifications: "Five sibling skills merged into one entry skill (mode B); scripts kept, OpenSquilla env vars renamed to VIDEO_FONTS_DIR / VIDEO_POST_*; no behavior change."
---

# Video Post-Production

Five deterministic post-production steps for a short video, each a plain CLI script. No LLM calls, no
network, no API keys — just ffmpeg, ffprobe, Python, and Pillow.

## Boundaries

**Do**: stitch numbered MP4 segments, normalize resolution/fps/codec, add fade transitions, burn an
SRT into a video, build SRT cues from a shot script, turn a still into a Ken-Burns clip, render
title/ending cards.

**Do not**: generate the source footage. For HTML/CSS/JS → MP4 (headless recording, frame stepping,
concat strategy), use `../html-to-video-pipeline/SKILL.md` instead — that skill owns generation and
the concat-engine decision; this skill owns what happens after clips exist.

## Layout

```
video-post-production/
├── SKILL.md
├── install.ps1              # Windows dependency check/install
├── install.sh               # macOS/Linux dependency check/install
├── scripts/
│   ├── merge.py             # numbered MP4 segments -> one MP4 (xfade, normalize)
│   ├── burn.py              # SRT -> burned-in subtitles (libass)
│   ├── animate.py           # still image -> Ken-Burns MP4
│   ├── build_srt.py         # shot script -> SRT with cumulative timestamps
│   └── render_title_card.py # text -> title/ending PNG (Pillow, CJK-safe)
└── src/
    ├── video_merger.py      # merge.py's core library
    └── __init__.py
```

`scripts/merge.py` imports `src/video_merger.py`, so keep that relative layout when copying the skill.

## Preflight (never skip)

```powershell
# dependencies
Get-Command ffmpeg, ffprobe -ErrorAction SilentlyContinue
python --version                       # 3.8+
python -c "import PIL; print(PIL.__version__)"   # title cards only
ffmpeg -version | Select-String 'enable-libass|enable-libx264'   # subtitles + x264
```

- If `ffmpeg` is missing: run `install.ps1` (Windows) or `install.sh` (macOS/Linux), or install it
  yourself. **Stop and report the missing binary — do not emit a command you cannot run.**
- ffmpeg ≥ 5.0 is required: `subtitles=` (libass), `xfade`, `zoompan`, `libx264`.
- Pillow is only needed for `scripts/render_title_card.py`.

## Pipeline recipes

| Goal | Order |
|---|---|
| Clips → finished film | `scripts/merge.py` → (`scripts/build_srt.py`) → `scripts/burn.py` |
| Topic → short drama with cards | `scripts/render_title_card.py` → `scripts/animate.py` (cover) → clips → `scripts/merge.py` → `scripts/burn.py` |
| Moderated video model refused | `scripts/render_title_card.py` or existing still → `scripts/animate.py` → `scripts/merge.py` |
| Subtitles only | `scripts/build_srt.py` → `scripts/burn.py` |

## 1. Merge numbered segments

```powershell
python scripts\merge.py --input .\segments --output .\final.mp4
python scripts\merge.py --input .\segments --output .\final.mp4 --transition 0.8 --fps 30 --crf 20
python scripts\merge.py --input .\segments --output .\chunks --mode chunk --chunk-duration 60
```

- Input filenames must carry a numeric prefix (`1_intro.mp4`, `2_scene.mp4`, …); ordering is numeric,
  not lexicographic.
- `--transition` sets the fade duration in seconds; `--resolution 1080x1920` overrides the source
  resolution; `--preset` trades encode time for size.
- Pass `--ffmpeg-path` / `--ffprobe-path` when a fresh winget install has not refreshed `PATH`.

## 2. Burn subtitles

```powershell
python scripts\burn.py --input .\final.mp4 --subtitles .\drama.srt --output .\final_subtitled.mp4
python scripts\burn.py -i .\final.mp4 -s .\drama.srt -o .\out.mp4 --font "Microsoft YaHei" --font-size 36 --margin-v 60
```

- Video is re-encoded (H.264 + faststart); audio is copied untouched.
- Fonts: `--fonts-dir` (or the `VIDEO_FONTS_DIR` env var) points libass at a font directory. Without
  it, ffmpeg uses its own font configuration.
- An empty or whitespace-only SRT is a valid "no subtitles" request: the video is probed, copied, and
  reported as `SUBTITLES_SKIPPED: empty`.
- Windows path escaping inside `subtitles=` (drive-letter colons, forward slashes, quotes) is handled
  by the script — do not hand-build the filter string.

## 3. Still → Ken-Burns clip

```powershell
python scripts\animate.py --input .\shot1.png --output .\shot1.mp4 --duration 5
python scripts\animate.py -i .\shot1.png -o .\shot1.mp4 --duration 6 --width 720 --height 1280 --fps 24 --zoom-rate 0.0015
```

Adds a silent AAC track so a later merge does not trip on mixed-audio inputs.

## 4. Shot script → SRT

```powershell
python scripts\build_srt.py --output .\drama.srt --script .\script.txt
Get-Content .\script.txt -Raw | python scripts\build_srt.py --output .\drama.srt
```

- Expects `=== SHOT_N ===` blocks with `DURATION_S:` and `VOICEOVER:` fields; drift from that format
  yields zero cues and exit 1.
- `--gap-ms` (default 200) ends each cue slightly before the next shot; `--leading-offset-ms` shifts
  every cue forward by the cover clip's duration.
- `VOICEOVER: none` contributes no cue but still advances the timeline. Output is UTF-8 so CJK lines
  survive the `subtitles=` filter.

## 5. Title / ending cards

```powershell
python scripts\render_title_card.py --text "咖啡店偶遇" --subtitle "第 1 集" --output .\cover.png
python scripts\render_title_card.py --text "END" --output .\ending.png --width 1080 --height 1920 --background "#101018"
```

- CJK-safe: the script verifies glyphs are not `.notdef` boxes and fails with an actionable error
  instead of rendering tofu.
- Deterministic and offline; the PNG can go straight into `scripts/animate.py`.

## Verification checklist

1. Every produced file exists and has non-zero size.
2. `ffprobe -v error -show_entries format=duration -of default=nw=1 <file>` returns a positive
   duration for every MP4.
3. `ffmpeg -v error -i <file> -f null -` decodes with no errors.
4. Subtitles: sample a frame (`ffmpeg -ss 1 -i out.mp4 -frames:v 1 f.png`) and confirm text is
   present — do not assume libass found the font.
5. Report the real exit code and stderr tail; never claim success from the absence of a crash.

## Traps

- **Merge picks up unrelated files**: the numeric-prefix rule is the only filter. Move stray MP4s out
  of the input directory first.
- **Mixed-source concat corruption** (8s becomes 35s): that is a generation-side timebase problem —
  see `../html-to-video-pipeline/references/ffmpeg-cheatsheet.md` before blaming this skill.
- **Fresh ffmpeg install not on `PATH`**: winget/scoop/choco user-level bins are not inherited by every
  shell. Pass explicit `--ffmpeg-path` / `--ffprobe-path`.
- **Font name mismatch**: `--font` takes one libass family name, not a comma-separated fallback chain.
- **Timestamps drift after editing the script**: rebuild the SRT rather than hand-patching cue times.

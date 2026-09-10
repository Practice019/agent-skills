---
name: download-anything
description: "从互联网找到并下载几乎任何数字资源：电子书、论文、影视、音乐、软件、图片、字体、课程等，中英文生态都覆盖（yt-dlp / aria2 / gallery-dl / spotdl 工具链、资源站目录、网盘搜索、Google dorks）。 Find and download virtually any digital resource from the internet — ebooks, academic papers, movies, TV shows, music, software, images, fonts, courses, and more. Covers both English and Chinese internet ecosystems. Includes CLI tool workflows (yt-dlp, aria2, gallery-dl, spotdl), resource site directories, cloud drive search engines, and search techniques (Google dorks). Use when the user wants to: (1) download a video, audio, or media from a URL, (2) find and download an ebook or academic paper, (3) find and download software, (4) search for any digital resource, (5) batch download images or media from a gallery or site, (6) download torrents or magnet links, (7) find free stock assets (images, video, audio, fonts), (8) search Chinese cloud drives for resources, or (9) any task involving finding or downloading digital content from the internet."
user-invocable: true
---

# Download Anything

Find it. Download it. Any resource, any format.

## Toolkit

```bash
# Install all tools at once
bash scripts/install-toolkit.sh
```

| Tool | Install | Purpose |
|------|---------|---------|
| `yt-dlp` | `brew install yt-dlp` | Video/audio from 1800+ sites |
| `aria2c` | `brew install aria2` | Multi-thread downloads, torrents |
| `gallery-dl` | `pip3 install gallery-dl` | Batch image/media, 170+ sites |
| `spotdl` | `pip3 install spotdl` | Spotify playlists → local files |
| `wget` | `brew install wget` | Recursive downloads, site mirroring |
| `curl` | pre-installed | HTTP requests, API calls |
| `ffmpeg` | `brew install ffmpeg` | Media conversion |
| `jq` | `brew install jq` | JSON parsing for automation |

## Decision Tree

| Want to download... | Tool / Approach |
|---------------------|----------------|
| YouTube / social media video | `scripts/dl-video.sh URL` (auto-detects Bilibili cookies) |
| Audio from any video URL | `scripts/dl-audio.sh URL` |
| Spotify playlist/album/track | `spotdl URL` |
| Images from gallery/artist page | `scripts/dl-gallery.sh URL` |
| A direct file URL (fast) | `scripts/dl-file.sh URL` (aria2, 16 connections) |
| A torrent or magnet link | `scripts/dl-torrent.sh "magnet:..."` |
| Subtitles for a video | `scripts/dl-subtitle.sh QUERY` |
| An ebook or paper | → [references/ebooks.md](references/ebooks.md) |
| A movie or TV show | → [references/video.md](references/video.md) |
| Music / game soundtracks / OST | → [references/music.md](references/music.md) |
| Software or app | → [references/software.md](references/software.md) |
| Stock images/video/audio/fonts | → [references/media-assets.md](references/media-assets.md) |
| Chinese cloud drive resources | → [references/cloud-search.md](references/cloud-search.md) |
| Online courses | → [references/education.md](references/education.md) |
| Something else / not sure | → [references/search-techniques.md](references/search-techniques.md) |

## Scripts

All in `scripts/`. Each does one thing. Compose as needed.

| Script | What it does | Key args |
|--------|-------------|----------|
| `install-toolkit.sh` | Install all CLI tools | — |
| `dl-video.sh URL [QUALITY]` | Download video (auto cookies for Bilibili) | `best`/`1080`/`720`/`480` |
| `dl-audio.sh URL [FORMAT]` | Extract audio | `mp3`/`opus`/`flac`/`best` |
| `dl-file.sh URL [OUTPUT]` | Fast multi-thread download | 16 connections via aria2 |
| `dl-gallery.sh URL [DIR] [ARGS...]` | Batch download images | extra args passed to gallery-dl |
| `dl-torrent.sh MAGNET [DIR]` | Download torrent/magnet | via aria2 |
| `dl-subtitle.sh QUERY [LANG]` | Search & download subtitles | `en`/`zh`/`ja` etc. |

## Quick One-Liners

```bash
# Best quality video
yt-dlp -f "bv*+ba/b" "URL"

# 1080p video + subtitles
yt-dlp -f "bv[height<=1080]+ba/b" --write-subs --sub-langs "en,zh" "URL"

# Extract audio as MP3
yt-dlp -x --audio-format mp3 "URL"

# Download YouTube playlist
yt-dlp --yes-playlist "URL"

# Fast file download (16 connections)
aria2c -x16 -s16 -k1M "URL"

# Download magnet
aria2c --seed-time=0 "magnet:?xt=..."

# Batch images from gallery
gallery-dl "URL"

# Spotify album → local MP3s
spotdl "SPOTIFY_URL"

# All PDFs from a page
wget -r -l1 -A "*.pdf" "URL"

# Video metadata as JSON (automation)
yt-dlp -j "URL"

# Get direct URL without downloading
yt-dlp -g "URL"
```

## Agent Automation Patterns

**Video pipeline:** `yt-dlp -j URL` → parse JSON → select format → `yt-dlp -f FORMAT URL -o OUTPUT`

**Ebook search:** Search Anna's Archive / Z-Library / 鸠摩搜书 → get download page → extract link → `aria2c`

**Bulk media:** `gallery-dl --dump-json URL` → review items → `gallery-dl -d OUTPUT URL`

**Music:** `spotdl SPOTIFY_URL` (auto YouTube match + metadata) or `yt-dlp -x --audio-format mp3 YOUTUBE_URL`

## Domain Instability

Many resource sites rotate domains. When a URL fails:
1. Search: `[site name] mirror 2026` or `[站名] 最新地址`
2. Check Reddit/Twitter for community mirror lists
3. Anna's Archive = most resilient ebook meta-search
4. For Chinese cloud search: check 网盘之家导航 for latest links

## References

| File | Content |
|------|---------|
| [ebooks.md](references/ebooks.md) | Ebook sites, academic papers, audiobooks, manga, Chinese books |
| [video.md](references/video.md) | Torrent sites, DDL, subtitles, anime, Chinese video |
| [music.md](references/music.md) | Free music, download tools, Chinese music, podcasts |
| [software.md](references/software.md) | Software archives, package managers, Chinese sites |
| [media-assets.md](references/media-assets.md) | Stock images, video, audio, fonts |
| [cloud-search.md](references/cloud-search.md) | Chinese cloud drive search (百度/阿里/夸克) |
| [education.md](references/education.md) | Free courses and MOOCs |
| [tools-reference.md](references/tools-reference.md) | Detailed CLI syntax and advanced flags |
| [search-techniques.md](references/search-techniques.md) | Google dorks, search strategies |

---

## DSH / Windows 运行环境适配（本副本补充）

上游脚本是 bash 脚本，本机是 Windows：

| 上游写法 | 本机做法 |
|---|---|
| `bash scripts/install-toolkit.sh` | 需要 bash 环境：Git Bash 或 WSL 里执行；或按脚本内容逐条用 `winget` / `pip` / `npm` 手动装（yt-dlp、aria2、gallery-dl、ffmpeg、spotdl） |
| `scripts/dl-*.sh URL` | 同上，在 Git Bash / WSL 里跑；也可直接调底层工具，例如 `yt-dlp <URL>`、`aria2c -x16 <URL>`、`gallery-dl <URL>` |
| `references/*.md` | 相对本子技能目录解析，用 `read` 打开 |

先确认工具是否就位（`yt-dlp --version`、`aria2c --version`、`ffmpeg -version`），缺哪个装哪个；脚本里的中文路径与 `~` 展开在 Git Bash 下更稳。

> ⚠️ 下载内容前先确认目标资源的版权与站点条款；脚本只负责搬运，合规判断在你。

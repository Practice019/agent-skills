---
name: latex-compile
description: "编译 LaTeX 文档：xelatex → bibtex → xelatex ×2 多遍循环，输出日志尾部、页数与警告信号，可选用 --min-pages / --min-refs 做编译前门禁。当用户要编译 .tex、把论文/报告导出 PDF、或排查 LaTeX 编译报错时使用。 Compile a LaTeX project (xelatex x bibtex x xelatex x 2) and report the log tail, page count, and warning signals, with optional pre-compile gates. Use when the user wants a .tex file turned into a PDF, a citation/page contract enforced before compilation, or a LaTeX build failure diagnosed. Ported and generalized from the OpenSquilla latex-compile skill."
whenToUse: "用户给出 .tex / LaTeX 项目路径并要求编译成 PDF、要求检查引用与页数、或贴出 xelatex/bibtex 报错需要定位时。"
metadata:
  provenance:
    origin: opensquilla-original
    license: Apache-2.0
    upstream_skill: latex-compile
    ported_from: opensquilla-bundled-skills
    modifications: "Rewritten as a general-purpose compiler: no input rewriting, no injected author line, no sibling-section assembly, gates opt-in."
---

# LaTeX Compile

Run the four-pass LaTeX build loop and report something a human can act on: the log tail, the
page count, and the warnings that actually matter (undefined citations, overfull boxes, missing
font shapes).

## Boundaries

**Do**:
- Compile an existing `.tex` entry file into a PDF.
- Report exit code, page count, and extracted warning signals.
- Optionally enforce `--min-pages` / `--min-refs` as pre-compile gates.

**Do not**:
- Rewrite the user's `.tex` source. This skill only reads it.
- Inject an author/title line or assemble sibling `abstract.tex` / `method.tex` fragments — that was
  the upstream meta-skill's contract, not a general compiler's job.
- Claim a build succeeded without checking that the PDF actually exists.

## Preflight

```powershell
# 1. engine present?
Get-Command xelatex -ErrorAction SilentlyContinue
# 2. document present?
Get-Item .\paper\paper.tex
# 3. bibliography present (only needed for citations)?
Get-ChildItem .\paper\*.bib
```

If `xelatex` is missing, stop and give the install command (`winget install MiKTeX.MiKTeX` or
`choco install miktex` on Windows; `tlmgr`/TeX Live elsewhere). Do not fall back to a different
engine silently — `pdflatex` cannot render CJK without extra packages.

## Run

```powershell
python scripts\compile.py .\paper\paper.tex
python scripts\compile.py .\paper\paper.tex --engine pdflatex --no-bibtex
python scripts\compile.py .\paper\paper.tex --min-pages 10 --min-refs 20
python scripts\compile.py .\paper\paper.tex --bib .\paper\refs.bib --tail-lines 80
```

| Flag | Default | Meaning |
|---|---|---|
| `tex_path` | — | `.tex` entry file (required) |
| `--engine` | `xelatex` | LaTeX engine; use `pdflatex` for ASCII-only docs |
| `--bib` | auto | `.bib` path; otherwise `<stem>.bib` or `references.bib` next to the `.tex` |
| `--no-bibtex` | off | skip the bibtex pass |
| `--min-pages` | `0` (off) | fail when the PDF has fewer pages |
| `--min-refs` | `0` (off) | fail when fewer references are cited |
| `--tail-lines` | `40` | log tail lines written to stderr |
| `--timeout` | `300` | per-pass timeout in seconds |

## What the script does

1. Preflight: `.tex` exists, engine on `PATH`, `.bib` located.
2. Optional citation gate: undefined `\cite` keys and `--min-refs` are checked **before** spending
   build time.
3. Build passes: `xelatex` → `bibtex` → `xelatex` → `xelatex`.
   `xelatex` returns 0 even on minor issues, so only the **final** pass is allowed to fail hard.
4. PDF existence check, page-count parse from the log, warning extraction.
5. stdout stays a single clean line (`Compiled: <pdf> (<n> KB, pages=<n>)`); the verbose log tail and
   warnings go to stderr.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | success |
| 2 | `.tex` does not exist |
| 3 | engine not on `PATH` |
| 4 | no PDF produced |
| 5 | citation contract failed (undefined keys or `--min-refs`) |
| 6 | page contract failed (`--min-pages`) |
| 124 | a pass timed out |
| other | exit code of the final engine pass |

## Common traps

- **Stale `.aux` / `.bbl`**: if citations look wrong after a `.bib` edit, delete `*.aux` / `*.bbl`
  and rebuild — the four-pass loop alone cannot always recover a corrupt aux.
- **`bibtex` fails but PDF exists**: reported as a warning, not a hard failure. Check the warning
  list for `bibtex:` lines before telling the user citations resolved.
- **CJK renders as boxes**: the engine lacks a CJK font mapping. Add `\usepackage{xeCJK}` +
  `\setCJKmainfont{...}` (or `fontspec` with a CJK TTF) to the preamble; the script does not inject
  it.
- **Windows PATH**: a freshly installed MiKTeX/TeX Live needs a new shell. If `Get-Command xelatex`
  works but the script reports exit 3, pass the absolute engine path by putting its `bin` on `PATH`
  first.
- **Overfull hbox floods the tail**: harmless warnings. Do not "fix" them by trimming the user's
  prose unless asked.

## Related skills

- `../research-paper-writing/SKILL.md` — drafting and polishing the manuscript itself.
- `../arxiv/SKILL.md` — fetching papers and generating BibTeX entries.

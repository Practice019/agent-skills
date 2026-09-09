#!/usr/bin/env python3
"""Compile a LaTeX document: xelatex -> bibtex -> xelatex x2, then report the log tail.

Ported from the OpenSquilla ``latex-compile`` skill (Apache-2.0, OpenSquilla original),
then rewritten to be a general-purpose compiler instead of a meta-paper-write step:

* it never rewrites the input .tex file and never injects an author line;
* it does not look for sibling ``abstract.tex`` / ``method.tex`` fragments;
* the paper-specific gates (minimum page count, minimum cited references) are
  opt-in flags that default to off.

What is kept from the upstream script: the four-pass ordering, the
"xelatex returns 0 on minor issues, only fail hard on the last pass" nuance,
the page-count parse from the xelatex log, and routing the verbose log tail to
stderr so stdout stays a clean one-line deliverable.

Exit codes:
    0  success
    2  tex file does not exist
    3  LaTeX engine not on PATH
    4  no PDF produced
    5  citation contract failed (--min-refs / undefined keys)
    6  page contract failed (--min-pages)
    *  final-pass exit code
"""

from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import sys
from pathlib import Path

BIB_KEY_RE = re.compile(r"@\w+\s*\{\s*([^,\s]+)")
CITE_RE = re.compile(r"\\cite[a-zA-Z*]*\s*(?:\[[^\]]*\]\s*){0,2}\{([^}]*)\}")
PAGE_COUNT_RE = re.compile(r"Output written on .+?\((\d+) pages?(?:,|\))")
UNDEFINED_CITE_RE = re.compile(r"Citation `([^']+)' .*undefined", re.IGNORECASE)
BIB_WARNING_RE = re.compile(r"Warning--(.+)")


def _run(cmd: list[str], cwd: Path, timeout: int) -> tuple[int, str]:
    try:
        proc = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True,
            check=False,
            timeout=timeout,
        )
    except subprocess.TimeoutExpired:
        return 124, f"{cmd[0]} timed out after {timeout}s"
    return proc.returncode, proc.stdout + proc.stderr


def _bib_keys(bib_path: Path) -> set[str]:
    if not bib_path.is_file():
        return set()
    return {
        m.group(1).strip()
        for m in BIB_KEY_RE.finditer(bib_path.read_text(encoding="utf-8", errors="replace"))
    }


def _cited_keys(tex: str) -> set[str]:
    keys: set[str] = set()
    for m in CITE_RE.finditer(tex):
        for raw in m.group(1).split(","):
            key = raw.strip()
            if key:
                keys.add(key)
    return keys


def _citation_errors(tex_path: Path, bib_path: Path, min_refs: int) -> list[str]:
    tex = tex_path.read_text(encoding="utf-8", errors="replace")
    cited = _cited_keys(tex)
    defined = _bib_keys(bib_path)
    errors: list[str] = []
    missing = sorted(cited - defined)
    if missing:
        errors.append("undefined citation keys: " + ", ".join(missing))
    valid = cited & defined
    if min_refs and len(valid) < min_refs:
        errors.append(
            f"document must cite at least {min_refs} references; found {len(valid)}",
        )
    return errors


def _page_count(log_text: str) -> int | None:
    matches = PAGE_COUNT_RE.findall(log_text)
    return int(matches[-1]) if matches else None


def _log_signals(log_text: str) -> list[str]:
    """Pull the warnings a human actually needs out of a long xelatex/bibtex log."""
    signals: list[str] = []
    for key in sorted(set(UNDEFINED_CITE_RE.findall(log_text))):
        signals.append(f"undefined citation: {key}")
    for warn in BIB_WARNING_RE.findall(log_text)[:10]:
        signals.append("bibtex: " + warn.strip())
    if "Overfull \\hbox" in log_text:
        signals.append(f"overfull hbox x{log_text.count('Overfull \\hbox')}")
    if "LaTeX Warning: Reference" in log_text:
        signals.append("undefined LaTeX cross-reference")
    if "Font shape" in log_text and "undefined" in log_text:
        signals.append("missing font shape (CJK text may not render)")
    return signals


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Compile a LaTeX document with a xelatex/bibtex multi-pass loop.",
    )
    parser.add_argument("tex_path", help="Path to the .tex entry file.")
    parser.add_argument(
        "--engine",
        default="xelatex",
        help="LaTeX engine (default: xelatex; use pdflatex for non-Unicode docs).",
    )
    parser.add_argument("--bib", help="Path to the .bib file (default: <stem>.bib or references.bib next to the .tex).")
    parser.add_argument(
        "--no-bibtex",
        action="store_true",
        help="Skip the bibtex pass (documents without \\bibliography).",
    )
    parser.add_argument(
        "--min-pages",
        type=int,
        default=0,
        help="Fail when the compiled PDF has fewer pages (0 = no gate).",
    )
    parser.add_argument(
        "--min-refs",
        type=int,
        default=0,
        help="Fail when fewer references are cited (0 = no gate).",
    )
    parser.add_argument("--tail-lines", type=int, default=40, help="Log tail lines on stderr.")
    parser.add_argument("--timeout", type=int, default=300, help="Per-pass timeout in seconds.")
    args = parser.parse_args()

    tex_path = Path(args.tex_path).resolve()
    if not tex_path.is_file():
        print(f"error: {tex_path} does not exist", file=sys.stderr)
        sys.exit(2)

    engine = shutil.which(args.engine)
    if engine is None:
        print(
            f"error: {args.engine} not in PATH. Install a LaTeX distribution "
            "(TeX Live / MiKTeX) and reopen the shell so PATH refreshes.",
            file=sys.stderr,
        )
        sys.exit(3)

    cwd = tex_path.parent
    stem = tex_path.stem
    bib_path = Path(args.bib).resolve() if args.bib else None
    if bib_path is None:
        for candidate in (cwd / f"{stem}.bib", cwd / "references.bib"):
            if candidate.is_file():
                bib_path = candidate
                break

    if args.min_refs and bib_path is None:
        print("error: --min-refs needs a .bib file; none found next to the .tex", file=sys.stderr)
        sys.exit(5)

    if bib_path is not None:
        citation_errors = _citation_errors(tex_path, bib_path, args.min_refs)
        if citation_errors:
            for err in citation_errors:
                print(f"error: {err}", file=sys.stderr)
            sys.exit(5)

    passes: list[list[str]] = [
        [args.engine, "-interaction=nonstopmode", "-halt-on-error", tex_path.name],
    ]
    if not args.no_bibtex and bib_path is not None:
        passes.append(["bibtex", stem])
    passes += [
        [args.engine, "-interaction=nonstopmode", "-halt-on-error", tex_path.name],
        [args.engine, "-interaction=nonstopmode", "-halt-on-error", tex_path.name],
    ]

    full_log: list[str] = []
    for cmd in passes:
        rc, log = _run(cmd, cwd, args.timeout)
        full_log.append(f"--- {' '.join(cmd)} (rc={rc}) ---\n{log}")
        if rc != 0 and cmd is passes[-1]:
            print("\n".join(full_log[-2:]), file=sys.stderr)
            sys.exit(rc)
        if cmd[0] == "bibtex" and rc != 0:
            print(
                "warning: bibtex pass failed; the PDF may have unresolved citations",
                file=sys.stderr,
            )

    pdf = cwd / f"{stem}.pdf"
    if not pdf.is_file():
        print("error: compile produced no PDF", file=sys.stderr)
        print("\n".join(full_log[-2:]), file=sys.stderr)
        sys.exit(4)

    combined = "\n".join(full_log)
    pages = _page_count(combined)
    if args.min_pages and (pages is None or pages < args.min_pages):
        found = "unknown" if pages is None else str(pages)
        print(
            f"error: document must be at least {args.min_pages} pages; found {found}",
            file=sys.stderr,
        )
        print("\n".join(full_log[-2:]), file=sys.stderr)
        sys.exit(6)

    tail = "\n".join(combined.splitlines()[-args.tail_lines:])
    print(tail, file=sys.stderr)
    signals = _log_signals(combined)
    if signals:
        print("warnings:", file=sys.stderr)
        for sig in signals:
            print(f"  - {sig}", file=sys.stderr)

    try:
        size_kb = pdf.stat().st_size / 1024
        print(f"Compiled: {pdf} ({size_kb:.1f} KB, pages={pages if pages is not None else 'unknown'})")
    except OSError:
        print(f"Compiled: {pdf}")


if __name__ == "__main__":
    main()

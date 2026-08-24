"""Local graphify pipeline runner (no Claude/LLM needed for code-only corpora).

Phase 1: detect -> AST extract -> build -> cluster -> analyze -> report/graph.json
Phase 2: label communities -> regenerate report -> obsidian + html -> manifest/cost -> cleanup

Usage:
  python run_graphify.py phase1 <input_path>
  python run_graphify.py phase2 <input_path> <labels.json>
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

# ---- cluster fallback: graspologic may be unavailable on py3.13 ----
import networkx as nx
from networkx.algorithms.community import louvain_communities, greedy_modularity_communities

import graphify.cluster as cluster_mod

_ORIG_CLUSTER = cluster_mod.cluster


def cluster_louvain(G: nx.Graph) -> dict[int, list[str]]:
    """networkx Louvain drop-in for graspologic Leiden."""
    if G.number_of_nodes() == 0:
        return {}
    if G.number_of_edges() == 0:
        return {i: [n] for i, n in enumerate(sorted(G.nodes))}
    try:
        comms = louvain_communities(G, seed=42, weight=None)
    except Exception:
        comms = greedy_modularity_communities(G, weight=None)
    raw: dict[int, list[str]] = {}
    for nodes in comms:
        raw[len(raw)] = list(nodes)
    # isolates (should already be covered, but keep behavior consistent)
    final: list[list[str]] = []
    max_size = max(10, int(G.number_of_nodes() * 0.25))
    for nodes in raw.values():
        if len(nodes) > max_size:
            final.extend(sorted(nodes) if False else [sorted(nodes)])  # keep as-is for simplicity
        else:
            final.append(sorted(nodes))
    final.sort(key=len, reverse=True)
    return {i: nodes for i, nodes in enumerate(final)}


cluster_mod.cluster = cluster_louvain
# also patch the local binding used by skill Step 4 imports
import graphify.cluster as _c
_c.cluster = cluster_louvain


def load(path: str | Path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def save(path: str | Path, obj) -> None:
    Path(path).write_text(json.dumps(obj, indent=2, ensure_ascii=False), encoding="utf-8")


def phase1(input_path: str) -> None:
    root = Path(input_path).resolve()

    from graphify.detect import detect
    from graphify.extract import collect_files, extract
    from graphify.build import build_from_json
    from graphify.cluster import cluster, score_all
    from graphify.analyze import god_nodes, surprising_connections, suggest_questions
    from graphify.report import generate
    from graphify.export import to_json

    detection = detect(root)
    save(".graphify_detect.json", detection)
    print(f"[detect] {detection['total_files']} files, ~{detection['total_words']} words")
    print(f"[detect] code={len(detection['files'].get('code', []))} "
          f"docs={len(detection['files'].get('document', []))} "
          f"papers={len(detection['files'].get('paper', []))} "
          f"images={len(detection['files'].get('image', []))}")
    if detection.get("warning"):
        print(f"[detect] warning: {detection['warning']}")

    # Part A - AST extraction (deterministic, no LLM)
    code_files: list[Path] = []
    for f in detection["files"].get("code", []):
        p = Path(f)
        code_files.extend(collect_files(p) if p.is_dir() else [p])
    if code_files:
        ast_result = extract(code_files)
        save(".graphify_ast.json", ast_result)
        print(f"[ast] {len(ast_result['nodes'])} nodes, {len(ast_result['edges'])} edges")
    else:
        save(".graphify_ast.json", {"nodes": [], "edges": [], "input_tokens": 0, "output_tokens": 0})
        print("[ast] no code files")

    # Part B - semantic: skip entirely for code-only corpora
    has_semantic = (
        detection["files"].get("document")
        or detection["files"].get("paper")
        or detection["files"].get("image")
    )
    if has_semantic:
        print("[semantic] docs/papers/images present but LLM not available locally - "
              "skipping semantic extraction (graph will be AST-only)")
    save(".graphify_semantic.json", {"nodes": [], "edges": [], "input_tokens": 0, "output_tokens": 0})

    # Part C - merge
    ast = load(".graphify_ast.json")
    sem = load(".graphify_semantic.json")
    seen = {n["id"] for n in ast["nodes"]}
    merged_nodes = list(ast["nodes"])
    for n in sem["nodes"]:
        if n["id"] not in seen:
            merged_nodes.append(n)
            seen.add(n["id"])
    merged = {
        "nodes": merged_nodes,
        "edges": ast["edges"] + sem["edges"],
        "input_tokens": sem.get("input_tokens", 0),
        "output_tokens": sem.get("output_tokens", 0),
    }
    save(".graphify_extract.json", merged)
    print(f"[merge] {len(merged_nodes)} nodes, {len(merged['edges'])} edges")

    # Step 4 - build/cluster/analyze/report
    G = build_from_json(merged)
    communities = cluster(G)
    cohesion = score_all(G, communities)
    tokens = {"input": merged.get("input_tokens", 0), "output": merged.get("output_tokens", 0)}
    gods = god_nodes(G)
    surprises = surprising_connections(G, communities)
    labels = {cid: f"Community {cid}" for cid in communities}
    questions = suggest_questions(G, communities, labels)

    if G.number_of_nodes() == 0:
        print("ERROR: Graph is empty - extraction produced no nodes.")
        sys.exit(1)

    report = generate(G, communities, cohesion, labels, gods, surprises,
                      detection, tokens, str(root), suggested_questions=questions)
    Path("graphify-out").mkdir(exist_ok=True)
    Path("graphify-out/GRAPH_REPORT.md").write_text(report, encoding="utf-8")
    to_json(G, communities, "graphify-out/graph.json")
    analysis = {
        "communities": {str(k): v for k, v in communities.items()},
        "cohesion": {str(k): v for k, v in cohesion.items()},
        "gods": gods,
        "surprises": surprises,
        "questions": questions,
    }
    save(".graphify_analysis.json", analysis)
    print(f"[build] Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges, "
          f"{len(communities)} communities")

    # Print communities for manual labeling
    print("\n=== COMMUNITY OVERVIEW (for labeling) ===")
    for cid, nodes in sorted(communities.items(), key=lambda kv: -len(kv[1])):
        labels_of = []
        for nid in nodes[:12]:
            lbl = G.nodes[nid].get("label") or nid
            labels_of.append(lbl)
        print(f"community {cid} | size={len(nodes)} | cohesion={cohesion.get(cid)}")
        print("   " + " | ".join(labels_of) + (" ..." if len(nodes) > 12 else ""))


def phase2(input_path: str, labels_path: str) -> None:
    root = Path(input_path).resolve()
    from graphify.build import build_from_json
    from graphify.cluster import score_all
    from graphify.analyze import god_nodes, surprising_connections, suggest_questions
    from graphify.report import generate
    from graphify.export import to_json, to_obsidian, to_canvas, to_html

    extraction = load(".graphify_extract.json")
    detection = load(".graphify_detect.json")
    analysis = load(".graphify_analysis.json")
    manual = load(labels_path)

    G = build_from_json(extraction)
    communities = {int(k): v for k, v in analysis["communities"].items()}
    cohesion = {int(k): v for k, v in analysis["cohesion"].items()}
    labels = {int(k): v for k, v in manual.items()}
    tokens = {"input": extraction.get("input_tokens", 0), "output": extraction.get("output_tokens", 0)}

    questions = suggest_questions(G, communities, labels)
    report = generate(G, communities, cohesion, labels, analysis["gods"],
                      analysis["surprises"], detection, tokens, str(root),
                      suggested_questions=questions)
    Path("graphify-out/GRAPH_REPORT.md").write_text(report, encoding="utf-8")
    save(".graphify_labels.json", {str(k): v for k, v in labels.items()})
    print("[report] regenerated with community labels")

    n = to_obsidian(G, communities, "graphify-out/obsidian",
                    community_labels=labels or None, cohesion=cohesion)
    print(f"[obsidian] {n} notes")
    to_canvas(G, communities, "graphify-out/obsidian/graph.canvas", community_labels=labels or None)
    print("[canvas] graph.canvas written")

    if G.number_of_nodes() <= 5000:
        to_html(G, communities, "graphify-out/graph.html", community_labels=labels or None)
        print("[html] graph.html written")
    else:
        print("[html] too many nodes - skipped HTML")

    # Step 9 - manifest + cost + cleanup
    from graphify.detect import save_manifest
    save_manifest(detection["files"])
    cost_path = Path("graphify-out/cost.json")
    cost = load(cost_path) if cost_path.exists() else {"runs": [], "total_input_tokens": 0, "total_output_tokens": 0}
    from datetime import datetime, timezone
    cost["runs"].append({
        "date": datetime.now(timezone.utc).isoformat(),
        "input_tokens": extraction.get("input_tokens", 0),
        "output_tokens": extraction.get("output_tokens", 0),
        "files": detection.get("total_files", 0),
    })
    cost["total_input_tokens"] += extraction.get("input_tokens", 0)
    cost["total_output_tokens"] += extraction.get("output_tokens", 0)
    save(cost_path, cost)

    for tmp in [".graphify_detect.json", ".graphify_extract.json", ".graphify_ast.json",
                ".graphify_semantic.json", ".graphify_analysis.json", ".graphify_labels.json"]:
        Path(tmp).unlink(missing_ok=True)

    print(f"[done] outputs in {root}/graphify-out/")
    print(f"[cost] this run {extraction.get('input_tokens', 0):,} in / "
          f"{extraction.get('output_tokens', 0):,} out tokens (AST-only: 0 LLM tokens)")


if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "phase1":
        phase1(sys.argv[2])
    elif mode == "phase2":
        phase2(sys.argv[2], sys.argv[3])
    else:
        print("unknown mode")
        sys.exit(1)

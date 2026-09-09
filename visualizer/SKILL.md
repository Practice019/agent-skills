---
name: visualizer
description: "在能比文字更清楚时用内联 SVG 画图：流程、架构、对比、概念、层级、因果链、空间关系。当问题用一张图更容易讲清，或用户要流程图、架构图、示意图时主动使用。 Create inline SVG explanations when a diagram would clarify a process, architecture, comparison, concept, hierarchy, causal chain, or spatial relationship. Use proactively when the question is structurally easier to understand as a visual, or when the user asks for a diagram, flowchart, architecture drawing, or visualization."
icon: "📊"
---

# Visualizer

> **DSH runtime note:** this skill was written for a client that auto-detects and renders inline SVG. In the DSH Web GUI that rendering is not guaranteed — if the diagram does not appear, write the SVG to a `.svg` file and reference that path instead of pasting it inline.

Embed an SVG diagram when a visual would explain the user's question more clearly than prose alone. Pair the diagram with a written explanation; never return only the image.

## When to Trigger

Use proactively without requiring an explicit request to draw:

- Processes, steps, or causal chains -> flowchart
- Architecture, hierarchy, or containment -> structural diagram
- Multi-option comparisons -> comparison matrix
- Concept relationships or classification -> relationship diagram
- Data trends or proportions -> simple chart

Do not use for straightforward factual answers, code generation, file operations, or other tasks where a diagram adds no clarity.

## Output Format

Write SVG source directly in the response body. A code fence is not required because the client detects and renders it as an inline image:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 H" width="100%">
  ...
</svg>
```

An `svg` code fence is also supported. The SVG must end with `</svg>` to render.

## Rendering Constraints

- SVG is loaded as an `<img>`: no scripts, external resources, CSS variables, or interaction. Handlers such as `onclick` do not work.
- Put every style inline with `style="..."` or in an internal SVG `<style>` element.
- Use system fonts only: `font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif`.
- Use responsive width and keep rendered height at or below 480px. The user can click to enlarge the diagram.
- Use a transparent or white (`#FFFFFF`) background. The surrounding container already has a white rounded surface.

## Base SVG Setup

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 H" width="100%">
<style>
text { font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif; }
</style>
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5"
    markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
</defs>
<!-- Content -->
</svg>
```

- Keep the viewBox width fixed at **680**. Set height H to the bottom element's y coordinate plus its height plus 20.
- Keep content within x=40 to x=640 and y=30 to y=(H-30).
- For streamed output, write `<style>` and `<defs>` before content elements so partial output is still meaningful.

## Color Palette (9 Families x 4 Levels)

| Family | Light fill (50) | Medium fill (200) | Accent/stroke (600) | Text (800) |
|---|---|---|---|---|
| purple | #EEEDFE | #AFA9EC | #534AB7 | #3C3489 |
| teal | #E1F5EE | #5DCAA5 | #0F6E56 | #085041 |
| coral | #FAECE7 | #F0997B | #993C1D | #712B13 |
| blue | #E6F1FB | #85B7EB | #185FA5 | #0C447C |
| green | #EAF3DE | #97C459 | #3B6D11 | #27500A |
| amber | #FAEEDA | #EF9F27 | #854F0B | #633806 |
| red | #FCEBEB | #F09595 | #A32D2D | #791F1F |
| pink | #FBEAF0 | #ED93B1 | #993556 | #72243E |
| gray | #F1EFE8 | #B4B2A9 | #5F5E5A | #444441 |

Use level 50 for node fills, level 600 for borders, and level 800 for text. Limit each diagram to at most three color families.

## Typography

| Use | Size | Weight | Approximate rendered width |
|---|---|---|---|
| Title | 14px | 500 | Latin characters x 7px; CJK characters x 14px |
| Subtitle | 12px | 400 | Latin characters x 6px; CJK characters x 12px |
| Body | 13px | 400 | Latin characters x 6.5px; CJK characters x 13px |
| Annotation | 11px | 400 | Latin characters x 5.5px; CJK characters x 11px |

- Minimum font size is 11px. Use only weights 400 and 500.
- Center labels with `text-anchor="middle"` and `dominant-baseline="central"`.
- Use natural sentence case for labels; never write entire sentences in uppercase.

## Diagram Types

### Flowchart

Use for steps, causality, decision trees, and timelines.

- Use a consistent node height: 44px for one line and 56px for two lines.
- Keep at least 60px between nodes and 24px of internal padding.
- Use 0.5px to 1px connector strokes with `marker-end="url(#arrow)"`.
- Limit a single flow to five or six nodes. Split or simplify larger flows.
- Prefer a single top-to-bottom or left-to-right direction.

```svg
<g>
  <rect x="250" y="40" width="180" height="44" rx="8"
    fill="#E6F1FB" stroke="#185FA5" stroke-width="0.5"/>
  <text x="340" y="62" text-anchor="middle" dominant-baseline="central"
    font-size="14" font-weight="500" fill="#0C447C">User request</text>
</g>
<line x1="340" y1="84" x2="340" y2="130"
  stroke="#185FA5" stroke-width="1" marker-end="url(#arrow)"/>
```

### Structural Diagram

Use for containment, hierarchy, and module boundaries.

- Outer frame: `rx=16` to `rx=20`, level-50 fill, and a 0.5px border.
- Inner blocks: `rx=8` with a level-200 fill.
- Limit nesting to three levels.
- Keep at least 20px of internal padding.

### Comparison Matrix

Use for comparing multiple options across multiple dimensions.

- Use a table layout with options as columns and dimensions as rows.
- Give the header a level-50 fill and use white content cells.
- Keep cell heights consistent and align text left or center.
- Highlight a recommended option with a 2px border.

### Relationship Diagram

Use for conceptual associations, classification, and networks.

- Use rounded rectangles or circles for nodes.
- Prefer curves such as `<path d="M... C...">` over straight lines when they improve clarity.
- Place 11px gray labels beside connectors.
- Avoid crossings by repositioning nodes instead of drawing intersecting lines.

### Simple Chart

Use for proportions, trends, and rankings.

- Bar chart: rectangles with values above each bar.
- Pie chart: `<path>` sectors with a legend on the right.
- Line chart: `<polyline>` with point markers.
- Always show numeric values; do not make the user infer them from height alone.

## Design Principles

1. **Flat**: No gradients, shadows, blur, or glow. Use solid fills and thin borders.
2. **Focused**: Express one core idea per diagram instead of packing in excessive information.
3. **Spacious**: Keep at least 20px between elements.
4. **Readable**: Text carries the meaning and graphics support it. Use complete labels rather than expecting shapes to explain themselves.
5. **Paired with prose**: Use the diagram for the primary structure or relationships and explain details in surrounding text.

## Type Routing

| User intent | Type | Content |
|---|---|---|
| "How does it work?" or an explanation of a mechanism | Flowchart | Input -> processing -> output |
| "What is the architecture?" or "What does it contain?" | Structural diagram | Nested modules and hierarchy |
| "What is the difference between A and B?" | Comparison matrix | Dimension x option table |
| "What types are there?" or classification | Relationship diagram | Center -> branches |
| Data, trend, or proportion | Chart | Bar, line, or pie |
| Steps, process, or how-to | Flowchart | Ordered steps and arrows |
| Relationships, dependencies, or effects | Relationship diagram | Nodes and directed connectors |

## Complexity Budget

- At most 8 nodes per diagram
- At most 3 color families
- At most 3 nesting levels
- At most 4 horizontally adjacent boxes, each approximately 140px wide
- viewBox height at most 500; split taller content into multiple diagrams
- At most 1 connector crossing; otherwise redesign the layout

## Complete Example: Simple Flowchart

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 280" width="100%">
<style>
text { font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif; }
</style>
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5"
    markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
</defs>
<rect x="250" y="30" width="180" height="44" rx="8" fill="#E6F1FB" stroke="#185FA5" stroke-width="0.5"/>
<text x="340" y="52" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="500" fill="#0C447C">User input</text>
<line x1="340" y1="74" x2="340" y2="110" stroke="#185FA5" stroke-width="1" marker-end="url(#arrow)"/>
<rect x="250" y="110" width="180" height="44" rx="8" fill="#E1F5EE" stroke="#0F6E56" stroke-width="0.5"/>
<text x="340" y="132" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="500" fill="#085041">Model processing</text>
<line x1="340" y1="154" x2="340" y2="190" stroke="#0F6E56" stroke-width="1" marker-end="url(#arrow)"/>
<rect x="250" y="190" width="180" height="44" rx="8" fill="#EEEDFE" stroke="#534AB7" stroke-width="0.5"/>
<text x="340" y="212" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="500" fill="#3C3489">Visual output</text>
</svg>
```

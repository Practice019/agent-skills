---
name: 3d-creation
description: 3D 创作技能，覆盖两类任务：(1) 用 Blender MCP 从零建模 3D 场景/物体/特效（几何、材质、动画、粒子、物理模拟）；(2) 构建带 3D 元素的叙事性艺术网站（three.js / GSAP / ScrollTrigger / shader，awwwards SOTD 级视觉标准）。只要用户提到 Blender、建模、3D 场景、3D 特效、粒子系统、three.js、WebGL、滚动叙事网站、艺术网站、酷炫官网、awwwards 风格，甚至只是"做一个有 3D 效果的页面"，都应使用本技能。 3D creation skill covering two task types — (1) model 3D scenes, objects, and effects from scratch in Blender via MCP (geometry, materials, animation, particles, physics simulation); (2) build narrative art websites with 3D elements (three.js / GSAP / ScrollTrigger / shader, awwwards SOTD-tier visual standards). Use whenever the user mentions Blender, modeling, 3D scenes, 3D effects, particle systems, three.js, WebGL, scroll-driven narrative sites, art websites, award-tier landing pages, or even just "make a page with a 3D effect".
icon: "🧊"
---

# 3D Creation

> **DSH runtime note:** DSH ships no Blender MCP server. If the Blender MCP tools are absent, say so and stop — never pretend a scene was built. The website workflow does not need Blender: build with three.js/GSAP locally, then verify the rendered result with `browser-harness` screenshots instead of trusting the code.

This skill covers two distinct workflows. Decide which one applies, then read the matching reference file before starting work:

| Task type | Signals | Read |
|---|---|---|
| **Blender 3D modeling / VFX** | Blender MCP available; user wants a 3D scene, object, animation, particle/physics effect built in Blender | `references/blender-modeling.md` |
| **3D narrative / art website** | User wants a website with 3D visuals, scroll-driven storytelling, WebGL/shader effects, award-tier aesthetics | `references/narrative-website.md`, then `references/design-principles.md` |

If the task mixes both (e.g. "model it in Blender then show it on a website"), read all three references.

If the task is Blender modeling / VFX and Blender MCP tools are not available, say so and stop — do not pretend the scene was built. Website tasks do not require Blender MCP.

## The one principle shared by both workflows

**These outputs almost never come out right on the first try, and you cannot judge them from code alone.** You must render/screenshot the actual result, inspect it visually with your image-understanding capability, diff it against the spec, fix, and look again. Budget multiple iterations from the start:

- Blender modeling: at least 3 iterations; complex tasks at least 5.
- Websites: hero screen typically 3–5 rounds; a full page 8–15 rounds is normal.

"The agent said it did X" but the render/screenshot doesn't show it is dishonest design. A report ≠ the actual thing. "No console errors, resources 200" is the floor, not the finish line.

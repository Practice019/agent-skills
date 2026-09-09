# Rich-asset Website Build — Principles

This is a **principle-level** alignment doc — not a process, not a checklist. It maps the judgment calls that recur in this kind of task back onto classical visual & motion design principles.

---

## 1. Style / Aesthetic — lock it in first

Before any concrete decisions, pin down the overall style. A website's overall aesthetic determines what material fits, which typeface family belongs, what direction the palette should go, and what motion should feel like.

Style actually has **two independent axes** — **2D page style** and **3D render style** — and they should echo each other. Otherwise you end up with "two aesthetics arguing above and below the fold."

### 2D page styles (common categories, non-exhaustive, stackable, mixable)

- **Minimalism** — lots of whitespace, monochrome or near-monochrome, few restrained elements.
- **Swiss / International Typographic Style** — strong grid, geometric precision, typography-driven, orderly.
- **Editorial** — magazine-print feel, huge decorative headlines + small body copy, layered typography, strong visuals.
- **Brutalism / Neobrutalism** — raw unpolished, bold high-contrast, hard edges, deliberately "anti-polished"; Neobrutalism adds color and heavy outlines.
- **Neumorphism** — soft shadows + highlights, gentle "embossed" 3D surfaces.
- **Skeuomorphism** — simulates real physical materials (CRT, paper, leather, mechanical).
- **Y2K / Vaporwave / Retro-tech** — 90s/00s retro, CRT scanlines, chromatic dispersion, pixels, neon, retro type.
- **Cyberpunk / Sci-fi / Futurist** — dark + neon glow, geometric HUD, data streams, WebGL-heavy scenes.
- **Cinematic / Painterly / Organic** — cinematic lighting, baked painterly textures, natural elements (fog, grass, sea, terrain), slow pace.
- **Glassmorphism** — semi-transparent + Gaussian blur + edge highlights, layered over colored backgrounds.
- **Surreal / Dream** — surreal collage, floating elements, physics-violating geometry.
- **Maximalism** — very dense, many colors and elements, opposite of minimalism.

### 3D render styles (common categories, likewise non-exhaustive)

- **Photorealistic / PBR** — physically-based lighting, HDR environment maps, accurate materials (metallic/roughness/normal/AO).
- **Stylized / Hand-painted** — painted textures instead of photorealistic, that warm WoW look.
- **Low-poly / Flat-shaded** — deliberately few polygons, visible faceting, flat shading, geometric abstraction.
- **NPR (Non-Photorealistic Rendering)** — umbrella term, includes:
  - **Cel-shaded / Toon** — banded light/dark instead of continuous gradient, animation/comic feel.
  - **Sketch / Line-art** — hand-drawn line feel, common in architectural viz.
  - **Hatching / Stippling** — cross-hatching or stippling, imitating traditional art.
- **Wireframe / Holographic** — glowing edges, transparent geometry, HUD/cyber vibes.
- **Glass / Iridescent / Dispersive** — transparency + refraction + rainbow dispersion (MeshPhysicalMaterial transmission/iridescence).
- **Particle / Point-cloud / Voxel** — particle clouds, point clouds, voxel blocks (Minecraft or pure GPGPU particles).
- **Volumetric / Fluid / Smoke** — volumetric fog, fluid simulations, god-rays.
- **Liquid / Metaball / Organic blob** — mercury / metaballs / organic fused shapes.
- **Procedural shader-only** — no 3D models at all, entirely shader-driven (SDF / fractals / raymarching / fluid gradients).

### How to lock in a tone (three steps)

1. **Infer from spec** — look at spec's adjectives ("retro corporate", "dreamy", "cyber", "cinematic") and its concrete settings (font family, color temperature, grain/scanlines/bloom, etc.). Infer **2D tone** and **3D tone** separately.
2. **Validate with the kit** — do the assets' own vibe (glossy gold? low-poly cartoon? photorealistic PBR? particle clouds?) match the spec's tone? When they don't, either adjust the assets (desaturate, add filters, swap materials/shaders) or commit the whole site to the assets' vibe. Avoid the case where asset vibe and page vibe pull in different directions.
3. **Write it down** — before touching code, write one sentence describing this site's aesthetic (e.g. "Retro-tech × Editorial × Skeuomorphic-PBR: retro corporate VHS aesthetic + oversized serif editorial typography + photorealistic 3D retro computers/phones"). All later decisions can be checked against this one sentence. Ideally the 2D tone and 3D tone both appear in it and echo each other.

## 2. Positioning — role and layer relationship

Before starting a screen, think about two things:

1. **What role does this material play on this screen?** — subject / ground / accent. The same asset may play different roles on different screens.
2. **What's its layer relationship to text / UI?** — **same-layer** (fused into one scene: text receives scene lighting, is clipped/masked by the material, shares depth-of-field and motion) / **different-layer** (material is the backdrop, text/UI are HTML floaters above). Both are valid and both are common.

Each combination calls for different treatment:

- **Same-layer + subject**: text enters the scene — receives light, depth, motion; can stick to material surfaces, be masked, be clipped. The two feel like one organism.
- **Different-layer + subject**: material forms the picture; text floats above. Priority is text legibility (blur the background, drop-shadow to lift, enough whitespace) and avoiding color/motion collisions.
- **Background**: low-contrast, blurred, distant; keep breathing room (subtle light, fog, slow motion), don't steal the show.
- **Accent**: like a grace note — accents the rhythm, reinforces atmosphere; too many gets cloying, too few feels empty.

The real thing to watch out for isn't any specific relationship — it's **unconsciously stacking material and text as two layers that neither respond to nor set each other off**. That's the most common root cause of "messy, sticker-like" output.

## 3. Visual Hierarchy

Each screen ideally guides the eye **first to the spec's protagonist**, then to secondary elements, then to the background. This is co-decided by **size, contrast, position, whitespace**. "The protagonist is loaded" is not the same as "the protagonist is the protagonist" — it should genuinely occupy the visual center in size, camera, and brightness.

## 4. Figure-Ground & Contrast

The protagonist should **pop out** from the background. At least one of hue, brightness, saturation should be clearly separated; otherwise the foreground gets "eaten" by a same-color background and the picture goes limp. The hex values the spec gives are usually not suggestions — they're settings essential to holding figure-ground.

## 5. Consistency / Unity

The whole page should share one visual language: style, palette, grain, filters, lighting vibe. **The kit's own assets set the "texture baseline"** for the whole thing; if you fill in the parts the spec calls for but the kit lacks with slapped-on default materials, they'll be **disconnected** from the kit sections and the overall feel is dragged down — **a bad implementation is worse than none** (echoing Dieter Rams's "as little design as possible").

## 6. Gestalt (Common Fate / Continuation / Closure)

All elements on a screen should ideally be seen as **one scene**. If two layers don't respond to each other in motion, lighting, and depth, they violate *common fate*. The role of **middle transition layers** (particles, fog, ground reflections, light bands, decorative geometry) is to stitch foreground, background, and text into one Gestalt whole.

## 7. Continuity — motion principle

Section-to-section transitions shouldn't be "previous screen vanishes, next screen pops in." Borrow from Disney's 12 principles and Material Motion: use **slow-in/slow-out, staging, follow-through**, plus **shared element transitions**, letting multiple channels (camera, color, fog, text, material transparency) interpolate along **the same scroll progress**. It generally reads much smoother.

## 8. Cinematography & Composition

The camera decides two things: what each frame "sees" (**perspective / composition**, static framing) and "how it changes over time" (**camera movement**). Both deserve deliberate design.

**Perspective / composition**: every frame should ideally read like a strong photograph or film still. Pay attention to **shot size** (long / medium / close / extreme close-up), **camera height** (high angle / eye-level / low angle), **compositional proportions** (rule of thirds, leading lines, negative space), **focus and blur** (FOV, depth-of-field). The vibe the spec describes ("open", "oppressive", "looking up", "looking down") is decided by perspective — the richest content with a bad perspective still won't look good.

**Camera movement**: think in cinematography vocabulary — **dolly** (in/out), **pan / tilt**, **track** (lateral follow), **orbit**, **reveal** — pick 1-2 deliberate moves per section, usually much better than mechanically pushing forward the whole way. **Spatial continuity matters more than "cut to next screen"** — camera paths ideally feel like continuous progression through the same 3D world, with objects' relative positions (ground, distant landscape, landmarks) staying stable.

**Objects placed to serve the camera**: decide perspective and camera path first, then place objects — the direction the camera moves in usually needs visual anchors (distant silhouettes, landmarks, light sources, particle streams). Don't let the camera pass through empty space, and don't let it miss the protagonist.

## 9. Completeness & Honesty

Every detail the spec writes down deserves to exist — copy, small labels, decorative stripes, tiny icons. "The agent said it did X" but final screenshots don't show it is fundamentally **dishonest design** (Rams: "Good design is honest"). A report ≠ the actual thing.

## 10. Critique / Iteration

Sites like these (detailed spec + rich assets + heavy motion / scroll / cursor interactions) **almost never come out right first try** — usually take multiple rounds of self-critique and revision to close in on the spec. **This step can't be skipped**, or the output stays at the "it runs but doesn't look like it" draft level.

The gap between output and spec usually isn't written into existence — it's **spotted and then written out**. Suggested loop:

1. **Screenshot from multiple angles**: hero, static shot of each section, key interaction moments (cursor on a CTA, magnetic snap firing), one each before and after transitions. viewport ≤ 1280px single side, `full_page=False` — to avoid single-shot bloat polluting your own context.
2. **Record + extract frames**: motion, scroll, camera moves, section transitions — **static screenshots literally cannot test these**. Record a video scrolling top-to-bottom, then use ffmpeg to pull keyframes at specific times. Cursor-driven effects same: script a cursor path first, then record. This "record then extract" is basic operation for sites like these, not optional.
3. **Diff against the spec**: for each frame, write down against the spec description what's wrong / what's missing, in a file (don't rely on memory).
4. **Fix → re-shoot / re-record**: re-verify after every fix. "No console errors, resources 200" is the floor, not the finish line.

Empirically, hero screen usually takes 3-5 rounds to approach spec; a full page 8-15 rounds is normal. **Budget-wise and mindset-wise, drop the "one-shot" expectation up front.**

---
name: browser-story-demo
description: Build deterministic, timed browser-based visual demos and record independently editable scene clips. Use for animated slide demos or hybrid demos combining local browser workflows with narrated scenes.
---

# Browser Story Demo

Use this skill when the deliverable is a browser-rendered story with timed scenes,
animation, narration alignment, and video clips.

## Workflow

Work through these gates in order. Do not start a full recording run while an
earlier gate is unresolved.

### 1. Inspect the project

Identify the narrative and narration files, browser entrypoint, local server
command, assets, existing recordings, browser-testing instructions, and capture
display. Preserve existing user changes. Record any missing input as an explicit
open question; do not fill it with invented application data or runtime state.

### 2. Plan the scenes

Create or update exactly one scene manifest for the deliverable. It is the source
of truth for scene order, narration mapping, duration, browser state, capture
geometry, mode, and output naming. Keep business narration separate from
animation and recording instructions.

For each scene, define its purpose, visual state, target duration, direct route or
scene number, expected final state, and safety classification. Mark
`live-mutating` scenes before any recording and obtain explicit authorization
before changing durable state.

### 3. Build a deterministic artifact

The browser artifact must:

- support direct scene selection, such as `?scene=07`;
- reset scene state on every load;
- expose `html[data-capture-ready="true"]` after layout and assets are ready;
- support manual review with previous/next controls or keyboard navigation; and
- keep static animation visibly distinct from verified live application behavior.

Use local fixtures and replayable states. Do not claim that a static animation
proves a product or deployment change.

### 4. Validate before recording

Run the structural check first:

```bash
python3 scripts/validate_manifest.py path/to/scene-manifest.yaml
```

Then manually verify the checks the validator cannot prove:

- every manifest scene resolves to the intended browser scene;
- narration sections and scene numbers map one-to-one, unless an omission is documented;
- text, layout, animation cues, and final state fit the target duration;
- logical viewport, physical capture surface, crop, and encoded dimensions agree;
- the browser is fully on the selected display at the documented zoom; and
- one representative frame is readable and correctly cropped.

Read `references/capture-checklist.md` before recording. Use a project-specific
browser-testing skill for browser verification when one exists.

### 5. Record independently editable clips

Start the local server, then record one scene first:

```bash
MANIFEST=path/to/scene-manifest.yaml \
DEMO_URL=http://127.0.0.1:4174/ \
SCENE=2 \
OUTPUT_DIR=/private/tmp/demo-recordings \
node scripts/record_scenes.mjs
```

Inspect that clip before using `ALL_SCENES=1`. The recorder opens a fresh headed
browser, waits for the ready selector, starts FFmpeg, releases the capture pause,
records the target duration, and trims the warmup. It writes the untouched raw
capture under `raw/` and the final H.264 clip under `final/`.

If a scene is wrong, rerun only that scene. Preserve the prior raw capture by
archiving it or using a new output directory before rerunning; do not re-record
unrelated scenes as part of a correction.

### 6. Validate and hand off

Run the media check after every recording set:

```bash
python3 scripts/validate_media.py \
  path/to/scene-manifest.yaml \
  /private/tmp/demo-recordings/final
```

Use `--scene NUMBER` for a corrected clip. Inspect representative frames and
report, for each scene, the target and actual duration, output dimensions, codec,
audio expectation, and any remaining uncertainty. Report application/runtime
state separately from media output. Do not concatenate scenes unless requested.

## Operating rules

- Do not invent application data, identifiers, runtime state, or product claims.
- Keep static animation distinct from evidence of a live application workflow.
- Mark state-changing scenes before recording. Do not mutate durable state without
  explicit authorization.
- Prefer local fixtures and deterministic replayable states.
- Keep browser zoom, display placement, cursor geometry, crop, and output dimensions
  fixed across scenes.
- Treat logical browser viewport, physical capture surface, and final video frame as
  separate dimensions.
- Preserve user-supplied durations unless a change is explicitly agreed.
- Keep raw captures unchanged when creating corrected clips or overlays.
- Do not concatenate scenes unless requested.
- Never expose credentials, tokens, personal data, or host paths in frames,
  narration, logs, or filenames.

## References

Read only the references needed for the current task:

- [scene-manifest.md](references/scene-manifest.md) for the manifest schema and
  consistency checks.
- [timing-guidelines.md](references/timing-guidelines.md) for animation and duration
  design.
- [capture-checklist.md](references/capture-checklist.md) before browser recording.
- [hybrid-demo-guidelines.md](references/hybrid-demo-guidelines.md) when scenes mix
  animated slides and live application workflows.

For browser-based verification, use a project-specific browser-testing skill when
available. Otherwise read `/Users/dnappcrp/AI/skills/run-browser-test/SKILL.md`.

## Helpers

Run the manifest validator before recording:

```bash
python3 scripts/validate_manifest.py path/to/scene-manifest.yaml
```

The validator checks structure and consistency. It does not prove visual quality or
media correctness.

Record one scene after starting the local server:

```bash
MANIFEST=path/to/scene-manifest.yaml \
DEMO_URL=http://127.0.0.1:4174/ \
SCENE=2 \
OUTPUT_DIR=/private/tmp/demo-recordings \
node scripts/record_scenes.mjs
```

Set `ALL_SCENES=1` only when the full manifest should be recorded. The recorder
requires a headed Brave session, the configured screen-capture backend, and FFmpeg.
It pauses scene animations until capture begins, preserves the full raw capture, and
writes a target-duration H.264 final clip.

Validate final clips with:

```bash
python3 scripts/validate_media.py \
  path/to/scene-manifest.yaml \
  /private/tmp/demo-recordings/final
```

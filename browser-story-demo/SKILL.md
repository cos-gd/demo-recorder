---
name: browser-story-demo
description: Build deterministic, timed browser-based visual demos and record independently editable scene clips. Use for animated slide demos or hybrid demos combining local browser workflows with narrated scenes.
---

# Browser Story Demo

Use this skill when the deliverable is a browser-rendered story with timed scenes,
animation, narration alignment, and video clips.

## Workflow

1. Inspect existing narrative, narration, demo code, assets, local server commands,
   and prior recordings. Preserve existing user changes.
2. Create or update one scene manifest. Treat it as the source of truth for scene
   order, narration mapping, duration, browser state, capture geometry, and output.
3. Keep business narration separate from production instructions.
4. Build deterministic scenes with direct addressing, such as `?scene=07`, and a
   capture-ready DOM signal.
5. Validate the manifest, narration mapping, layout, animation timing, and capture
   geometry before recording.
6. Record one independent clip per scene in a fresh headed-browser state. Preserve
   raw captures and replace only the scene being corrected.
7. Validate every final clip and produce a duration/media handoff report.

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

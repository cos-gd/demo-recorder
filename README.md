# Browser Story Demo

`browser-story-demo` builds timed browser demos and records one editable video clip per scene.

The workflow is manifest-driven:

1. Define scenes, narration mappings, durations, browser settings, and capture geometry in one YAML manifest.
2. Build a deterministic browser artifact that supports direct scene selection, such as `?scene=07`.
3. Mark the page ready with `html[data-capture-ready="true"]`.
4. Validate the manifest.
5. Record one scene at a time, preserving raw captures.
6. Validate the final H.264 clips against the manifest.

## Repository layout

- `browser-story-demo/SKILL.md` - the full skill instructions.
- `browser-story-demo/references/` - manifest, timing, capture, and hybrid-demo guidance.
- `browser-story-demo/scripts/validate_manifest.py` - structural manifest checks.
- `browser-story-demo/scripts/record_scenes.mjs` - headed Brave and FFmpeg recorder.
- `browser-story-demo/scripts/validate_media.py` - duration, dimensions, and codec checks.
- `browser-story-demo/examples/` - example scene manifests.

## Scene manifest

The manifest is the source of truth for scene order and capture behavior.

```yaml
project: recall-aware-product-master
entrypoint: demos/demo-v2/index.html
output_dir: recordings

browser:
  viewport: 1512x982
  zoom: 100
  scale_factor: 2

capture:
  backend: avfoundation
  screen: 6
  native_dimensions: 3024x1964
  crop: 3024x1700+0+0
  output_dimensions: 3024x1700
  pixel_format: yuv420p
  frame_rate: 30

scenes:
  - id: scene-02
    number: 2
    title: The first idea
    narration_section: Scene 2
    duration_seconds: 13.9
    visual_scene: 2
    mode: animated-slide
    capture:
      fresh_page: true
      audio: silent
      cursor: visible
```

Each scene needs a unique `id`, an increasing numeric `number`, a title, a positive duration, and a mode:

- `animated-slide` for deterministic visual scenes.
- `live-readonly` for verified application workflows that do not change state.
- `live-mutating` for workflows that change state and need explicit review before recording.

Narration stays separate from production instructions. Map each scene to its narration section, or document an intentional omission.

## Validate and record

From the repository root:

```bash
python3 browser-story-demo/scripts/validate_manifest.py path/to/scene-manifest.yaml
```

Start the local demo server, then record one scene:

```bash
MANIFEST=path/to/scene-manifest.yaml \
DEMO_URL=http://127.0.0.1:4174/ \
SCENE=2 \
OUTPUT_DIR=/private/tmp/demo-recordings \
node browser-story-demo/scripts/record_scenes.mjs
```

Use `ALL_SCENES=1` instead of `SCENE=2` only when the complete set is ready. The recorder writes raw captures to `raw/` and trimmed clips to `final/`.

Validate the resulting media:

```bash
python3 browser-story-demo/scripts/validate_media.py \
  path/to/scene-manifest.yaml \
  /private/tmp/demo-recordings/final
```

Use `--scene 2` to validate one clip. The media validator checks that each file exists, has a video stream, matches the target duration within tolerance, uses the manifest's output dimensions, and is encoded as H.264.

## Capture model

Keep these dimensions separate:

- **Logical viewport** - the CSS browser size, such as `1512x982`.
- **Physical capture surface** - the display pixels available to FFmpeg, such as `3024x1964`.
- **Final video frame** - the cropped encoded output, such as `3024x1700`.

The recorder opens a fresh headed Brave page, waits for the ready selector, starts FFmpeg, releases the page's capture pause, records the target duration, and trims the warmup period. It does not add audio.

Keep browser position, zoom, display, crop, frame rate, and cursor behavior fixed across scenes. Correct an individual scene by rerunning that scene and leave the other clips unchanged.

## Safety and limits

Use local fixtures and deterministic replayable states. Do not invent product data or claims. Do not expose credentials, tokens, personal data, or host paths in frames, narration, logs, or filenames.

The manifest validator checks structure and consistency. It does not prove visual quality, animation timing, browser placement, or application correctness. Review representative frames and the final clips before delivery.

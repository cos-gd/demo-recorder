# Dynamic Browser Demo Skill Plan

## Purpose

Create a reusable Codex skill for building timed, browser-based visual demos and
recording them as independently editable video clips.

The skill should cover the complete workflow represented by `demo-v1` and
`demo-v2`:

1. Turn a narrative brief into a scene plan.
2. Build a deterministic browser-based slide/demo artifact.
3. Coordinate narration, animation beats, and scene durations.
4. Run and inspect each scene in a headed browser.
5. Record one video clip per scene.
6. Preserve raw captures and regenerate individual scenes safely.
7. Validate the final media and produce a handoff manifest.

The existing `demo-screencast` skill should remain the reference for cursor-visible
browser recording and media QA. This new skill adds the upstream story-authoring,
scene-manifest, and browser-demo orchestration layers.

## Evidence from the existing demos

### Narrative structure

- [`demo-v1/DEMO-STEPS.md`](demo-v1/DEMO-STEPS.md) contains the detailed recording
  sequence, business decisions, runtime findings, and production notes.
- [`demo-v1/DEMO-SCENARIO-BUSINESS-SIMPLE.md`](demo-v1/DEMO-SCENARIO-BUSINESS-SIMPLE.md)
  defines the audience, narrative arc, and takeaways.
- [`demo-v2/DEMO_SCENARIO_BUSINESS_SIMPLE_v2.md`](demo-v2/DEMO_SCENARIO_BUSINESS_SIMPLE_v2.md)
  separates business meaning from animation and production guidance.
- [`demo-v2/DEMO_NARRATION_BUSINESS_SIMPLE_v2.md`](demo-v2/DEMO_NARRATION_BUSINESS_SIMPLE_v2.md)
  contains spoken narration only.

### Browser artifact

- [`demo-v2/app.js`](demo-v2/app.js) defines a scene array containing scene number,
  duration, class name, title, and HTML.
- [`demo-v2/styles.css`](demo-v2/styles.css) contains the visual system and timed
  CSS animations.
- The runtime renders one scene at a time, which naturally resets CSS animation
  timelines when the scene DOM is replaced.
- Previous/Next controls and keyboard navigation support manual review.
- The demo is static, deterministic, network-free, and safe to replay.

### Recording workflow

The current demos contain raw and final MP4 captures, but the project does not yet
have a reusable scene manifest, capture runner, or media-validation script. Scene
durations are duplicated between narration documents, README files, JavaScript,
and CSS animation delays. The new skill should make the scene manifest the source
of truth.

## Proposed skill scope

Suggested name: `browser-story-demo` or `dynamic-demo-screencast`.

The skill should support two related modes:

### Animated slide mode

For locally served, static browser artifacts like `demo-v2`.

- Generate or update HTML, JavaScript, and CSS.
- Address scenes directly by URL or query parameter.
- Reset the scene deterministically.
- Wait for a capture-ready signal.
- Record the scene without requiring application state mutation.

### Live workflow mode

For demos that show a real local application.

- Inspect application configuration and fixtures.
- Use project-specific browser-testing instructions when available.
- Prepare deterministic read-only state.
- Mark any state-changing action explicitly.
- Record only verified application states.

The skill must not imply that a static animation is a live product workflow, or
that a recording proves a deployment or runtime change occurred.

## Canonical scene manifest

Introduce one manifest as the source of truth for scene metadata:

```yaml
project: recall-aware-product-master
entrypoint: demos/demo-v2/index.html
output_dir: recordings

browser:
  viewport: 1512x982
  zoom: 100
  scale_factor: 2

capture:
  display: built-in
  native_dimensions: 3024x1964
  crop: 3024x1700+0+0
  output_dimensions: 3024x1700
  pixel_format: yuv420p

scenes:
  - id: scene-02
    number: 2
    title: The first idea
    narration_section: Scene 2
    duration_seconds: 13.9
    visual_scene: 2
    capture:
      fresh_page: true
      audio: silent
      cursor: visible
```

The manifest should define:

- Scene identifiers and ordering.
- Titles and narration mappings.
- Target durations.
- Browser entrypoints and scene-selection parameters.
- Logical browser viewport dimensions.
- Physical capture-display dimensions and scale factor.
- Crop rectangle and final encoded video dimensions.
- Pixel format, frame rate, and aspect-ratio expectations.
- Capture mode and audio expectations.
- Output filenames.
- Optional animation cue points.
- Whether the scene is static, read-only, or state-changing.
- Any intentional omissions, such as v2's separate Scene 1 visualization.

## Workflow

### 1. Inspect the project

Before editing or recording, inspect:

- Existing demo directories and assets.
- Narrative, scenario, and narration files.
- Existing browser-testing skills.
- Local server commands and entrypoints.
- Capture display geometry and browser scale.
- Existing raw and final media.

Do not invent demo data, identifiers, application states, or claims about product
behavior.

### 2. Plan the story

Map the brief into a scene table containing:

- Audience and objective.
- One spoken purpose per scene.
- Visual concept.
- Key animation beats.
- Target duration.
- Browser state at capture start.
- Expected final state.
- Safety classification.

Narration should remain separate from production instructions, as in the v2
artifacts.

### 3. Build the browser artifact

Use a reusable scaffold containing:

- `index.html`
- `app.js` or generated scene modules
- `styles.css`
- `scene-manifest.yaml`
- `README.md`
- Optional local assets

The runtime should support:

- Direct scene selection, for example `?scene=07`.
- Previous/Next navigation for manual review.
- Keyboard navigation.
- A visible development-only scene marker.
- A deterministic reset for every scene.
- A DOM signal such as `data-capture-ready="true"`.
- Optional autoplay and reduced-motion debugging modes.

### 4. Validate timing and layout

For every scene, validate:

- The manifest scene exists in the browser artifact.
- Narration and scene mappings are one-to-one unless explicitly documented.
- Target durations are positive and consistent.
- Animation delays do not exceed the capture window unexpectedly.
- Text remains readable at the selected viewport.
- No content is clipped or revealed after the target duration.
- The final visual state is stable and intentional.

#### Capture geometry

Capture geometry must be separate from browser layout. The skill should record
and validate all three dimensions:

1. **Logical browser viewport** — the CSS-sized browser window, such as
   `1512x982`.
2. **Physical capture surface** — the native display pixels, such as
   `3024x1964` on a Retina display.
3. **Final video frame** — the cropped and encoded output, such as
   `3024x1700` for a 16:9-compatible crop.

Before recording, the skill should identify the actual capture display, place the
headed browser fully on it, keep browser zoom at 100%, select an even-dimension
crop, and document its x/y offset. It should keep cursor coordinates, browser
chrome offsets, display scale, crop offsets, and final dimensions consistent, then
validate one representative frame before recording the complete scene set.

The skill must not infer final video dimensions from the browser window alone.

Capture still frames at the beginning, at representative cue points, and near the
end of each scene. This is especially important for long scenes and lower-page
content.

### 5. Record independent clips

For each scene:

1. Open a fresh headed-browser session or fresh page state.
2. Navigate directly to the scene.
3. Wait for the capture-ready signal.
4. Keep browser position, zoom, and display geometry fixed.
5. Capture only that scene.
6. Preserve the raw capture.
7. Render or copy the final numbered MP4.
8. Regenerate only the affected scene when correcting an error.

Do not concatenate scenes unless explicitly requested.

### 6. Validate media and produce the handoff

For each final clip, report:

- Filename and scene number.
- Target and actual duration.
- Duration delta.
- Codec and dimensions.
- Frame rate.
- Capture display, crop rectangle, final output dimensions, and pixel format.
- Aspect ratio.
- Audio presence or expected silence.
- Visual inspection status.

The final handoff should include the scene manifest, duration report, voiceover
file, final clips, and links to representative still frames. Generated media
should remain outside the repository unless the user explicitly asks for it to be
checked in.

## Proposed skill package

```text
browser-story-demo/
  SKILL.md
  references/
    scene-manifest.md
    authoring-patterns.md
    timing-guidelines.md
    capture-checklist.md
    hybrid-demo-guidelines.md
  templates/
    browser-demo/
      index.html
      app.js
      styles.css
      scene-manifest.yaml
      README.md
  scripts/
    validate_manifest.*
    serve_demo.*
    capture_scenes.*
    validate_media.*
    sample_frames.*
```

`SKILL.md` should contain the concise operational workflow. Detailed browser
geometry, timing rules, manifest schema, and media checks should live in the
referenced documents.

## Validation and safety requirements

The skill should:

- Prefer deterministic local fixtures and replayable states.
- Avoid paid, destructive, or long-running actions without explicit approval.
- Mark state-mutating scenes before recording.
- Never expose credentials, tokens, personal data, or host paths.
- Keep raw captures unchanged when producing overlays or corrected outputs.
- Keep static slide animations distinct from live application evidence.
- Use the project browser-testing skill when one is available.
- Use headed capture for cursor-visible video and a separate headless path for
  assertions or screenshot checks.
- Preserve user-supplied durations exactly unless a change is explicitly agreed.

## Implementation phases

1. Define and document the scene-manifest schema.
2. Extract a reusable browser-demo scaffold from `demo-v2`.
3. Add direct scene addressing and capture-ready signaling.
4. Add manifest, narration, and duration consistency validation.
5. Add deterministic still-frame sampling and layout checks.
6. Add capture-display detection, crop configuration, and one-frame geometry validation.
7. Add independent scene capture orchestration.
8. Add FFprobe-based media validation and duration reporting.
9. Add support for hybrid static/live demos.
10. Rebuild the Lab 04 v2 flow using the new skill as the first regression fixture.
11. Package the skill using the Codex skill-creation workflow.

## Acceptance criteria

The skill is ready when it can reproduce the Lab 04 v2 workflow with:

- One canonical scene manifest.
- Directly addressable browser scenes.
- Deterministic animation resets.
- Correctly timed scenes, including long scenes.
- One independent MP4 per scene.
- Explicit, validated physical capture and final video dimensions.
- Preserved raw captures.
- Automated duration and media reports.
- Still-frame QA output.
- Explicit handling of intentionally omitted scenes.
- No accidental network calls, mutations, credentials, or invented data.

## First implementation target

Use [`demo-v2`](demo-v2/) as the first fixture because it already demonstrates:

- A clear business narrative.
- Separate narration and production guidance.
- A reusable scene array.
- CSS-driven animation timelines.
- Directly measurable scene durations.
- A static, network-free browser runtime.

The v1 materials should remain reference inputs for hybrid application demos,
historical-run selection, troubleshooting notes, and cursor-visible workflow
recording.

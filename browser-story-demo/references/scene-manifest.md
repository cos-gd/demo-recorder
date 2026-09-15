# Scene Manifest

Use one manifest for scene metadata. YAML is preferred for hand editing.

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
  display: built-in
  native_dimensions: 3024x1964
  crop: 3024x1699+0+265
  output_dimensions: 3024x1699
  pixel_format: uyvy422
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

## Required fields

Root:

- `project`
- `entrypoint`
- `scenes`

Recommended capture fields:

- `browser.viewport`: logical CSS dimensions.
- `browser.zoom`.
- `browser.scale_factor`.
- `capture.native_dimensions`: physical display pixels.
- `capture.crop`: `WIDTHxHEIGHT+X+Y`.
- `capture.output_dimensions`: final encoded frame dimensions.
- `capture.pixel_format`.
- `capture.frame_rate`.

The recorder preserves the full native capture in `raw/`. `capture.crop` is applied
only when creating the final clip, so `3024x1699+0+265` means crop a 3024×1699
rectangle from physical source coordinates x=0, y=265. Keep the raw file when
iterating on framing.

Scenes may define an `interactions` timeline. Each step supports `at_seconds` and
one of:

- `select`: `selector`, optional `index`, and `value`.
- `click`: `selector`, optional `index`.
- `scroll`: optional `delta_y` and `duration_ms`; scrolling is eased continuously.
- `highlight`: `selector` or `text`, optional `exact`, `duration_ms`, and
  `scroll: false` when the target is already visible.
- `wait`: optional `duration_ms`.

Use exact text targets for repeated section names and give important validation or
stage headings enough hold time for the narration.

Each scene should have:

- unique `id`;
- unique numeric `number`;
- `title`;
- `duration_seconds`;
- narration mapping or an explicit narration omission;
- `mode`: `animated-slide`, `live-readonly`, or `live-mutating`;
- capture behavior.

## Invariants

- Scene numbers are unique and ordered unless intentional omissions are documented.
- Durations are positive numbers.
- Narration sections map one-to-one to scenes unless explicitly marked otherwise.
- The browser artifact can address every scene directly.
- Logical viewport dimensions are not used as final video dimensions by assumption.
- The physical capture surface, crop, and encoded output dimensions are recorded.

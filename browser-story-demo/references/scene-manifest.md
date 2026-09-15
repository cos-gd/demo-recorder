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

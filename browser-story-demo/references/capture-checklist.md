# Capture Checklist

## Before capture

- Validate the scene manifest.
- Confirm the local URL and direct scene route.
- Confirm the browser viewport, zoom, display, native dimensions, crop, and output
  dimensions.
- Confirm the AVFoundation display index and its actual native resolution.
- Place the headed browser fully on that same capture display; do not assume
  `(0,0)` is the internal display when an external monitor is connected.
- Confirm crop offsets in physical pixels and compare the crop boundary with a
  reference frame so application headings are not cut.
- Confirm the voiceover-to-scene mapping.
- Mark scenes that mutate durable state.
- Validate one representative frame.
- Confirm FFmpeg and FFprobe paths.
- Confirm macOS Screen Recording and Accessibility permissions.

## During capture

- Use a fresh headed-browser state for each scene.
- Wait for the capture-ready signal.
- Keep browser position and zoom fixed.
- Move the real cursor deliberately when interaction is part of the scene.
- Exercise the configured interaction timeline and verify that scrolls are smooth,
  focus highlights land on the intended exact headings, and each narrated beat has
  enough exposure time.
- Preserve raw captures.
- Stop and diagnose a failed capture before retrying.
- Record one scene first. Inspect it before recording the full set.

## After capture

- Check scene count and ordering.
- Check target versus actual duration.
- Check codec, frame rate, dimensions, crop, and pixel format.
- Confirm the raw capture is full native-display resolution and remains unchanged;
  validate the final cropped clip separately against the target duration.
- Confirm expected audio or silence.
- Inspect representative frames, especially lower-page or tab-change scenes.
- Report runtime state separately from media output.

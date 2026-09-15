# Capture Checklist

## Before capture

- Validate the scene manifest.
- Confirm the local URL and direct scene route.
- Confirm the browser viewport, zoom, display, native dimensions, crop, and output
  dimensions.
- Place the headed browser fully on the selected capture display.
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
- Preserve raw captures.
- Stop and diagnose a failed capture before retrying.
- Record one scene first. Inspect it before recording the full set.

## After capture

- Check scene count and ordering.
- Check target versus actual duration.
- Check codec, frame rate, dimensions, crop, and pixel format.
- Confirm the raw capture is valid and the final clip matches the target duration.
- Confirm expected audio or silence.
- Inspect representative frames, especially lower-page or tab-change scenes.
- Report runtime state separately from media output.

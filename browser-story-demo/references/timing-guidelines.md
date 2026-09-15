# Timing Guidelines

- Derive the target duration from the narration paragraph or an explicit user
  duration.
- Put the target duration in the manifest, not only in JavaScript or CSS.
- Keep the first meaningful visual cue early enough for the audience to see it.
- Leave a stable final state before the scene ends.
- Reset scenes by replacing the scene DOM or using an equivalent deterministic reset.
- Avoid animation delays that exceed the capture window unless the delay is part of
  the intended story.
- For long scenes, use several deliberate beats instead of one animation followed by
  a long static hold.
- Sample the start, cue points, midpoint, and end before recording.
- Keep scene timing independent. A corrected scene must not shift other clips.

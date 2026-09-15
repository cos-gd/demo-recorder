# Hybrid Demos

Use hybrid mode when some scenes are authored animations and others show a local
application.

- Label each scene's mode in the manifest.
- Use static fixtures for authored scenes.
- Use verified application state for live scenes.
- Treat a recording of a live page as evidence only of the state shown in that clip.
- Do not claim a new run, deployment, or mutation unless it exists and was rechecked.
- Use the project browser-testing skill for selectors and assertions when available.
- Keep scene transitions explicit. Do not hide a live workflow behind an animation.

#!/usr/bin/env python3
"""Validate the structural invariants of a browser-story scene manifest."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


try:
    import yaml
except ImportError:  # pragma: no cover
    yaml = None


DIMENSION = re.compile(r"^\d+x\d+$")
CROP = re.compile(r"^\d+x\d+\+\d+\+\d+$")
MODES = {"animated-slide", "live-readonly", "live-mutating"}


def load_manifest(path: Path) -> dict:
    if yaml is None:
        raise RuntimeError("PyYAML is required to read YAML manifests")
    with path.open(encoding="utf-8") as handle:
        value = yaml.safe_load(handle)
    if not isinstance(value, dict):
        raise ValueError("manifest root must be a mapping")
    return value


def require(mapping: dict, key: str, location: str, errors: list[str]) -> None:
    if key not in mapping or mapping[key] in (None, ""):
        errors.append(f"{location} is required")


def validate(manifest: dict) -> list[str]:
    errors: list[str] = []
    for key in ("project", "entrypoint", "scenes"):
        require(manifest, key, key, errors)

    scenes = manifest.get("scenes")
    if not isinstance(scenes, list) or not scenes:
        errors.append("scenes must be a non-empty list")
        return errors

    ids: set[str] = set()
    numbers: set[int] = set()
    previous_number = None
    for index, scene in enumerate(scenes, 1):
        location = f"scenes[{index}]"
        if not isinstance(scene, dict):
            errors.append(f"{location} must be a mapping")
            continue
        for key in ("id", "number", "title", "duration_seconds", "mode"):
            require(scene, key, f"{location}.{key}", errors)

        scene_id = scene.get("id")
        if scene_id in ids:
            errors.append(f"{location}.id is duplicated: {scene_id}")
        elif scene_id:
            ids.add(scene_id)

        number = scene.get("number")
        if not isinstance(number, int) or isinstance(number, bool):
            errors.append(f"{location}.number must be an integer")
        else:
            if number in numbers:
                errors.append(f"{location}.number is duplicated: {number}")
            numbers.add(number)
            if previous_number is not None and number <= previous_number:
                errors.append(f"{location}.number must be strictly increasing")
            previous_number = number

        duration = scene.get("duration_seconds")
        if not isinstance(duration, (int, float)) or isinstance(duration, bool) or duration <= 0:
            errors.append(f"{location}.duration_seconds must be positive")

        if scene.get("mode") not in MODES:
            errors.append(f"{location}.mode must be one of {sorted(MODES)}")

    browser = manifest.get("browser", {})
    capture = manifest.get("capture", {})
    if not isinstance(browser, dict):
        errors.append("browser must be a mapping")
    else:
        if "viewport" in browser and not DIMENSION.fullmatch(str(browser["viewport"])):
            errors.append("browser.viewport must use WIDTHxHEIGHT")
    if not isinstance(capture, dict):
        errors.append("capture must be a mapping")
    else:
        for key in ("native_dimensions", "output_dimensions"):
            if key in capture and not DIMENSION.fullmatch(str(capture[key])):
                errors.append(f"capture.{key} must use WIDTHxHEIGHT")
        if "crop" in capture and not CROP.fullmatch(str(capture["crop"])):
            errors.append("capture.crop must use WIDTHxHEIGHT+X+Y")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("manifest", type=Path)
    args = parser.parse_args()
    try:
        manifest = load_manifest(args.manifest)
        errors = validate(manifest)
    except (OSError, ValueError, RuntimeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2

    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1
    print(f"OK: {args.manifest} ({len(manifest['scenes'])} scenes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

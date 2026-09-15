#!/usr/bin/env python3
"""Validate final scene clips against a browser-story manifest."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

import yaml


def probe(path: Path, ffprobe: str) -> dict:
    result = subprocess.run(
        [ffprobe, "-v", "error", "-print_format", "json", "-show_streams", "-show_format", str(path)],
        check=True, capture_output=True, text=True,
    )
    return json.loads(result.stdout)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("manifest", type=Path)
    parser.add_argument("media_dir", type=Path)
    parser.add_argument("--scene", type=int, help="validate only one scene")
    parser.add_argument("--ffprobe", default="/opt/homebrew/bin/ffprobe")
    parser.add_argument("--tolerance", type=float, default=0.25)
    args = parser.parse_args()

    manifest = yaml.safe_load(args.manifest.read_text(encoding="utf-8"))
    errors = []
    scenes = manifest.get("scenes", [])
    if args.scene is not None:
        scenes = [scene for scene in scenes if int(scene["number"]) == args.scene]
        if not scenes:
            print(f"ERROR: scene not found in manifest: {args.scene}")
            return 1
    for scene in scenes:
        path = args.media_dir / f"scene-{int(scene['number']):02d}.mp4"
        if not path.exists():
            errors.append(f"missing: {path}")
            continue
        try:
            data = probe(path, args.ffprobe)
        except (OSError, subprocess.CalledProcessError, json.JSONDecodeError) as exc:
            errors.append(f"{path}: probe failed: {exc}")
            continue
        video = next((stream for stream in data.get("streams", []) if stream.get("codec_type") == "video"), None)
        if not video:
            errors.append(f"{path}: no video stream")
            continue
        actual = float(data.get("format", {}).get("duration", 0))
        target = float(scene["duration_seconds"])
        if abs(actual - target) > args.tolerance:
            errors.append(f"{path}: duration {actual:.2f}s differs from {target:.2f}s")
        expected = manifest.get("capture", {}).get("output_dimensions")
        if expected:
            width, height = (int(value) for value in expected.split("x"))
            if video.get("width") != width or video.get("height") != height:
                errors.append(f"{path}: dimensions {video.get('width')}x{video.get('height')} != {expected}")
        if video.get("codec_name") != "h264":
            errors.append(f"{path}: codec {video.get('codec_name')} != h264")
        print(f"{path}: {actual:.2f}s {video.get('codec_name')} {video.get('width')}x{video.get('height')}")

    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1
    print("OK: all media validated")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

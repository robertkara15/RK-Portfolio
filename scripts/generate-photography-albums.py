#!/usr/bin/env python3
"""Scan images/photography/* and write data/photography-albums.json for the site."""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PHOTO_ROOT = ROOT / "images" / "photography"
OUTPUT = ROOT / "data" / "photography-albums.json"
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".avif"}
SKIP_ALBUMS = {"album2", "album3"}

ALBUM_TITLES = {
    "home": "Featured Photos",
    "album1": "Haze",
}

ALBUM_SUBTITLES = {
    "home": "Some of my personal favourites",
    "album1": "A glimpse into the foggy and mysterious",
}

THUMB_MAX_PX = 1200
THUMB_JPEG_QUALITY = 75
THUMB_DIR_NAME = "thumbs"


def album_title(folder_id: str) -> str:
    if folder_id in ALBUM_TITLES:
        return ALBUM_TITLES[folder_id]
    match = re.match(r"^album(\d+)$", folder_id, re.IGNORECASE)
    if match:
        return f"Album {match.group(1)}"
    return folder_id.replace("-", " ").replace("_", " ").title()


def ensure_thumb(src_path: Path) -> Path | None:
    """Create a compressed grid thumbnail; full-size src is kept for the lightbox."""
    thumb_dir = src_path.parent / THUMB_DIR_NAME
    thumb_dir.mkdir(exist_ok=True)
    thumb_path = thumb_dir / f"{src_path.stem}.jpg"

    if thumb_path.exists() and thumb_path.stat().st_mtime >= src_path.stat().st_mtime:
        return thumb_path

    if sys.platform == "darwin":
        result = subprocess.run(
            [
                "sips",
                "-Z",
                str(THUMB_MAX_PX),
                "-s",
                "format",
                "jpeg",
                "-s",
                "formatOptions",
                str(THUMB_JPEG_QUALITY),
                str(src_path),
                "--out",
                str(thumb_path),
            ],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            print(f"Warning: could not create thumb for {src_path}: {result.stderr.strip()}", file=sys.stderr)
            return None
        return thumb_path

    try:
        from PIL import Image
    except ImportError:
        print(
            f"Warning: skipping thumb for {src_path} (install Pillow or run on macOS with sips).",
            file=sys.stderr,
        )
        return None

    with Image.open(src_path) as image:
        image = image.convert("RGB")
        image.thumbnail((THUMB_MAX_PX, THUMB_MAX_PX), Image.Resampling.LANCZOS)
        image.save(thumb_path, "JPEG", quality=THUMB_JPEG_QUALITY, optimize=True)
    return thumb_path


def main() -> int:
    if not PHOTO_ROOT.is_dir():
        print(f"Missing directory: {PHOTO_ROOT}", file=sys.stderr)
        return 1

    albums = []
    for folder in sorted(PHOTO_ROOT.iterdir()):
        if not folder.is_dir() or folder.name.startswith(".") or folder.name in SKIP_ALBUMS:
            continue

        photos = []
        for path in sorted(folder.iterdir()):
            if path.suffix.lower() not in IMAGE_EXTS or not path.is_file():
                continue
            if path.parent.name == THUMB_DIR_NAME:
                continue
            rel = path.relative_to(ROOT).as_posix()
            entry = {
                "src": rel,
                "name": path.stem,
                "caption": path.stem.replace("-", " ").replace("_", " ").title(),
            }
            thumb_path = ensure_thumb(path)
            if thumb_path:
                entry["thumb"] = thumb_path.relative_to(ROOT).as_posix()
            photos.append(entry)

        entry = {"id": folder.name, "title": album_title(folder.name), "photos": photos}
        if folder.name in ALBUM_SUBTITLES:
            entry["subtitle"] = ALBUM_SUBTITLES[folder.name]
        albums.append(entry)

    albums.sort(key=lambda item: (0 if item["id"] == "home" else 1, item["id"].lower()))

    payload = {"defaultAlbum": "home", "albums": albums}
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT} ({len(albums)} albums)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

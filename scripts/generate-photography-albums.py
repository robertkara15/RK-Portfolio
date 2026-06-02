#!/usr/bin/env python3
"""Scan images/photography/* and write data/photography-albums.json for the site."""

from __future__ import annotations

import json
import re
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


def album_title(folder_id: str) -> str:
    if folder_id in ALBUM_TITLES:
        return ALBUM_TITLES[folder_id]
    match = re.match(r"^album(\d+)$", folder_id, re.IGNORECASE)
    if match:
        return f"Album {match.group(1)}"
    return folder_id.replace("-", " ").replace("_", " ").title()


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
            rel = path.relative_to(ROOT).as_posix()
            photos.append(
                {
                    "src": rel,
                    "name": path.stem,
                    "caption": path.stem.replace("-", " ").replace("_", " ").title(),
                }
            )

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

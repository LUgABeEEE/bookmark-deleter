#!/usr/bin/env bash
# Build a zip that can be uploaded to the Chrome Web Store / Edge Add-ons.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 - <<'PY'
import json, pathlib, zipfile

version = json.loads(pathlib.Path("manifest.json").read_text(encoding="utf-8"))["version"]
out = pathlib.Path("bookmark-deleter-%s.zip" % version)
include = ["manifest.json", "background.js", "deadlinks.json", "README.md", "LICENSE"]
dirs = ["lib", "icons"]
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for name in include:
        z.write(name)
    for d in dirs:
        for f in sorted(pathlib.Path(d).rglob("*")):
            if f.is_file():
                z.write(f)
print("built", out, out.stat().st_size, "bytes")
PY

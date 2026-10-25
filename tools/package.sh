#!/usr/bin/env bash
# Build a zip that can be uploaded to the Chrome Web Store / Edge Add-ons.
set -euo pipefail
cd "$(dirname "$0")/.."
out="bookmark-deleter-$(python3 -c 'import json;print(json.load(open("manifest.json"))["version"])').zip"
rm -f "$out"
zip -qr "$out" manifest.json background.js lib deadlinks.json icons README.md LICENSE \
  -x '*.DS_Store'
echo "built $out"
